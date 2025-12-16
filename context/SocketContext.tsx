"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";

import { BASE_URL } from "../lib/axios";

interface SocketContextType {
    socket: Socket | null;
    onlineUsers: string[];
    userId: string | null;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    onlineUsers: [],
    userId: null,
});

export const useSocket = () => useContext(SocketContext);

interface SocketProviderProps {
    children: ReactNode;
}

export const SocketProvider = ({ children }: SocketProviderProps) => {
    const { data: session } = useSession();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

    // Extract userId to a stable primitive to prevent effect re-runs on session object reference changes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sessionUserId = (session?.user as any)?.id || (session?.user as any)?._id;

    useEffect(() => {
        // Ensure this runs only in the browser
        if (typeof window === "undefined") {
            return;
        }

        // Get token from localStorage
        const token = localStorage.getItem("access_token");

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
        // Dependency is now only the primitive ID, not the whole session object
    }, [sessionUserId]);

    useEffect(() => {
        if (!socket) return;

        const handlePresenceUpdate = (users: string[]) => {
            setOnlineUsers(users);
        };

        // Backend emits `presence:update`
        socket.on("presence:update", handlePresenceUpdate);

        return () => {
            socket.off("presence:update", handlePresenceUpdate);
        };
    }, [socket]);

    return (
        <SocketContext.Provider value={{ socket, onlineUsers, userId: sessionUserId }}>
            {children}
        </SocketContext.Provider>
    );
};
