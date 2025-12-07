"use client";

import { useEffect, useState } from "react";
import { patientApi, doctorApi } from "@/lib/axios";
import { useSocket } from "@/context/SocketContext";
import clsx from "clsx";

interface Conversation {
  _id: string;
  participants: { _id: string; name: string; role: string }[];
  lastMessage: string;
}

export default function ChatSidebar({
  role,
  onSelect,
}: {
  role: "doctor" | "patient";
  onSelect: (id: string, user: { _id: string; name: string; role: string } | undefined) => void;
}) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const api = role === "doctor" ? doctorApi : patientApi;
  const { onlineUsers } = useSocket();

  useEffect(() => {
    api.get("/chat/my").then((res) => setConversations(res.data));
  }, [api]);

  function handleSelect(id: string, user: { _id: string; name: string; role: string } | undefined) {
    setSelectedId(id);
    onSelect(id, user);
  }

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-xl text-gray-900">Messages</h2>
        <p className="text-sm text-gray-500 mt-1">
          {role === "doctor" ? "Your patients" : "Your doctors"}
        </p>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No conversations yet</p>
            <p className="text-sm text-gray-400 mt-2">
              {role === "patient"
                ? "Book an appointment to start chatting with a doctor"
                : "Patients will appear here after booking appointments"}
            </p>
          </div>
        ) : (
          conversations.map((c) => {
            const other = c.participants.find((p) => p.role !== role);
            const isOnline = other ? onlineUsers.includes(other._id) : false;
            const isSelected = selectedId === c._id;

            return (
              <div
                key={c._id}
                onClick={() => handleSelect(c._id, other)}
                className={clsx(
                  "p-4 border-b border-gray-100 cursor-pointer transition-colors",
                  isSelected
                    ? "bg-blue-50 border-l-4 border-l-blue-600"
                    : "hover:bg-gray-50"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-lg">
                      {other?.role === 'doctor' ? '👨‍⚕️' : '👤'}
                    </div>
                    {isOnline && (
                      <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {other?.name || "Unknown"}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {c.lastMessage || "No messages yet"}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
