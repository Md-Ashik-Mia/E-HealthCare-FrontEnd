"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";

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
        const sessionUserId = (session?.user as any)?.id;

        if (token && sessionUserId) {
            setUserId(sessionUserId);

            const newSocket = io("http://localhost:6000", {
                auth: { token },
                transports: ["websocket"],
                reconnection: true,
            });

            newSocket.on("connect", () => {
                console.log("Socket connected:", newSocket.id);
                // Emit user online status with actual user ID
                newSocket.emit("user:online", sessionUserId);
            });

            newSocket.on("disconnect", () => {
                console.log("Socket disconnected");
            });

            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSocket(newSocket);

            return () => {
                newSocket.close();
            };
        }
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
