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
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        // Get token from localStorage
        const token = localStorage.getItem("access_token");

        // Get user ID from session
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sessionUserId = (session?.user as any)?.id;

        console.log("🔍 SocketContext: Checking connection requirements", {
            hasToken: !!token,
            hasUserId: !!sessionUserId,
            userId: sessionUserId,
            currentSocketId: socket?.id
        });

        if (!token || !sessionUserId) {
            console.log("⚠️ Cannot create socket: missing token or userId");
            return;
        }

        // If we already have a socket and the user ID hasn't changed, don't reconnect
        if (socket && userId === sessionUserId) {
            return;
        }

        // Close existing socket if any
        if (socket) {
            console.log("♻️ Closing existing socket before reconnecting");
            socket.close();
        }

        console.log(`🔌 Creating new socket connection to ${BASE_URL}`);
        const newSocket = io(BASE_URL, {
            auth: { token },
            transports: ["websocket"],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        newSocket.on("connect", () => {
            console.log("✅ Socket connected:", newSocket.id);
            // Emit user online status with actual user ID
            newSocket.emit("user:online", sessionUserId);
        });

        newSocket.on("connect_error", (error) => {
            console.error("❌ Socket connection error:", error);
        });

        newSocket.on("disconnect", (reason) => {
            console.log("🔴 Socket disconnected:", reason);
        });

        // Update state in a way that doesn't trigger the warning
        // by batching the updates together
        setUserId(sessionUserId);
        setSocket(newSocket);

        return () => {
            console.log("🧹 Cleaning up socket connection");
            newSocket.close();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session]);

    useEffect(() => {
        if (socket) {
            socket.on("users:online", (users: string[]) => {
                setOnlineUsers(users);
            });
        }
    }, [socket]);

    return (
        <SocketContext.Provider value={{ socket, onlineUsers, userId }}>
            {children}
        </SocketContext.Provider>
    );
};
