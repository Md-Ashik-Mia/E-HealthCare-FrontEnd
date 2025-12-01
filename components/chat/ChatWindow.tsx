"use client";

import { useEffect, useState, useRef } from "react";
import { socket } from "@/lib/socket";
import { patientApi, doctorApi } from "@/lib/axios";
import { useSocket } from "@/context/SocketContext";
import clsx from "clsx";

interface Msg {
  _id: string;
  senderId: string;
  message: string;
  isAI?: boolean;
}

export default function ChatWindow({
  user,
  conversationId,
  role,
}: {
  user: { _id: string; name: string; role?: string };
  conversationId: string;
  role: "doctor" | "patient";
}) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const api = role === "doctor" ? doctorApi : patientApi;
  const bottomRef = useRef<HTMLDivElement>(null);
  const { userId } = useSocket(); // Get real user ID from context

  useEffect(() => {
    if (!conversationId) return;

    api.get(`/chat/${conversationId}/messages`).then((res) => {
      setMessages(res.data);
    });

    socket.on("message:receive", (msg) => {
      if (msg.conversationId === conversationId) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      socket.off("message:receive");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function send() {
    if (!input.trim() || !userId) return;

    const payload = {
      conversationId,
      from: userId, // Use real user ID from context
      to: user._id,
      message: input,
    };

    socket.emit("message:send", payload);

    setMessages((m) => [
      ...m,
      {
        _id: crypto.randomUUID(),
        senderId: userId, // Use real user ID from context
        message: input,
      },
    ]);

    setInput("");
  }

  return (
    <div className="flex flex-col h-full w-full bg-black">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m) => (
          <div
            key={m._id}
            className={clsx(
              "max-w-sm p-3 rounded-lg",
              m.senderId === userId // Use real user ID from context
                ? "bg-blue-500 text-white self-end"
                : m.isAI
                  ? "bg-purple-500 text-red self-start"
                  : "bg-black-200 text-white-800 self-start"
            )}
          >
            {m.message}
          </div>
        ))}

        <div ref={bottomRef}></div>
      </div>

      <div className="p-4 border-t flex space-x-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && send()}
          className="flex-1 px-3 py-2 border rounded"
          placeholder="Type a message..."
        />
        <button
          onClick={send}
          className="bg-blue-600 text-white px-4 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}
