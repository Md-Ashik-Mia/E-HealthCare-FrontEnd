"use client";

import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";

import { BASE_URL } from "../lib/axios";

interface SocketContextType {
    socket: Socket | null;
    onlineUsers: string[];
    userId: string | null;
    isConversationMuted: (conversationId: string) => boolean;
    toggleConversationMute: (conversationId: string) => void;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    onlineUsers: [],
    userId: null,
    isConversationMuted: () => false,
    toggleConversationMute: () => {},
});

export const useSocket = () => useContext(SocketContext);

interface SocketProviderProps {
    children: ReactNode;
}

export const SocketProvider = ({ children }: SocketProviderProps) => {
    const { data: session } = useSession();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    const [mutedConversations, setMutedConversations] = useState<string[]>([]);

    // Extract userId to a stable primitive to prevent effect re-runs on session object reference changes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sessionUserId = (session?.user as any)?.id || (session?.user as any)?._id;
    // Prefer token directly from session to avoid localStorage timing issues.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sessionToken = (session?.user as any)?.accessToken as string | undefined;

    const muteStorageKey = sessionUserId ? `muted_conversations_${sessionUserId}` : null;

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const next = (() => {
            if (!muteStorageKey) return [];
            try {
                const raw = localStorage.getItem(muteStorageKey);
                const parsed = raw ? JSON.parse(raw) : [];
                return Array.isArray(parsed) ? parsed : [];
            } catch {
                return [];
            }
        })();

        // Avoid setState synchronously in effect body (eslint rule)
        Promise.resolve().then(() => setMutedConversations(next));
    }, [muteStorageKey]);

    const mutedSet = useMemo(() => new Set(mutedConversations), [mutedConversations]);

    const isConversationMuted = (conversationId: string) => mutedSet.has(conversationId);

    const toggleConversationMute = (conversationId: string) => {
        if (!muteStorageKey) return;
        setMutedConversations((prev) => {
            const next = prev.includes(conversationId)
                ? prev.filter((id) => id !== conversationId)
                : [...prev, conversationId];
            try {
                localStorage.setItem(muteStorageKey, JSON.stringify(next));
            } catch {}
            return next;
        });
    };

    useEffect(() => {
        // Ensure this runs only in the browser
        if (typeof window === "undefined") {
            return;
        }

        // Get token (prefer session token; fall back to localStorage)
        const token = sessionToken || localStorage.getItem("access_token");

        console.log("🔍 SocketContext: Checking connection requirements", {
            hasToken: !!token,
            userId: sessionUserId,
        });

        if (!token || !sessionUserId) {
            return;
        }

        // If we already have a socket connected for this user, do nothing
        // This check is implicitly handled by the dependency array now.

        console.log(`🔌 Creating new socket connection to ${BASE_URL}`);
        const newSocket = io(BASE_URL, {
            auth: { token },
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        newSocket.on("connect", () => {
            console.log("✅ Socket connected:", newSocket.id);
            newSocket.emit("user:online", sessionUserId);
        });

        newSocket.on("connect_error", (error) => {
            console.error("❌ Socket connection error:", error);
        });

        newSocket.on("disconnect", (reason) => {
            console.log("🔴 Socket disconnected:", reason);
        });

        // Avoid calling setState synchronously in the effect body (eslint rule)
        Promise.resolve().then(() => setSocket(newSocket));

        return () => {
            console.log("🧹 Cleaning up socket connection");
            newSocket.close();
            Promise.resolve().then(() => setSocket(null));
        };
        // Reconnect when user or token changes
    }, [sessionUserId, sessionToken]);

    useEffect(() => {
        if (!socket) return;

        const handlePresenceUpdate = (users: string[]) => {
            setOnlineUsers(users);
        };

        // Backend emits `presence:update`
        socket.on("presence:update", handlePresenceUpdate);

        const handleNewNotification = (notification: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
            const title = notification?.title || "Notification";
            const msg = notification?.message || "";
            const conversationId = notification?.conversationId as string | undefined;

            // If this notification belongs to a muted conversation, suppress it.
            if (conversationId && mutedSet.has(conversationId)) {
                return;
            }
            // Keep this lightweight; full notification UI can use the REST endpoints.
            toast.info(msg ? `${title}: ${msg}` : title, { autoClose: 60_000 });
        };

        socket.on("notification:new", handleNewNotification);

        return () => {
            socket.off("presence:update", handlePresenceUpdate);
            socket.off("notification:new", handleNewNotification);
        };
    }, [socket, mutedSet]);

    return (
        <SocketContext.Provider value={{ socket, onlineUsers, userId: sessionUserId, isConversationMuted, toggleConversationMute }}>
            {children}
        </SocketContext.Provider>
    );
};
