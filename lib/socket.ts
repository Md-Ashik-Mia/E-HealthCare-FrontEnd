"use client";

import { io, Socket } from "socket.io-client";
import { BASE_URL } from "./axios";

let socketInstance: Socket;

if (typeof window !== "undefined") {
  socketInstance = io(BASE_URL, {
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
