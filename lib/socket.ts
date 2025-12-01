"use client";

import { io, Socket } from "socket.io-client";

let socketInstance: Socket;

if (typeof window !== "undefined") {
  socketInstance = io("http://localhost:6000", {
    transports: ["websocket"],
    reconnection: true,
    autoConnect: true,
    auth: {
      token: localStorage.getItem("access_token"),
    },
  });
} else {
  // Server-side dummy to prevent crashes during SSR
  socketInstance = {
    on: () => { },
    off: () => { },
    emit: () => { },
    connect: () => { },
    disconnect: () => { },
    connected: false,
  } as unknown as Socket;
}

export const socket = socketInstance;
