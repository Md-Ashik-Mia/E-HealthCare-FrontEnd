"use client";

import { useEffect, useState } from "react";
import { patientApi, doctorApi } from "@/lib/axios";
import { useSocket } from "@/context/SocketContext";
import clsx from "clsx";
import { useSession } from "next-auth/react";

interface Conversation {
  _id: string;
  participants: { _id: string; name: string; role: string }[];
  lastMessage: string;
}

type SessionUser = {
  id?: string;
  _id?: string;
};

export default function ChatSidebar({
  role,
  onSelect,
}: {
  role: "doctor" | "patient";
  onSelect: (id: string, user: { _id: string; name: string; role: string } | undefined) => void;
}) {
  const { data: session } = useSession();
  const sessionUser = session?.user as unknown as SessionUser | undefined;
  const sessionUserId = sessionUser?.id ?? sessionUser?._id;
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isAIEnabled, setIsAIEnabled] = useState(false);
  const api = role === "doctor" ? doctorApi : patientApi;
  const { onlineUsers } = useSocket();

  useEffect(() => {
    if (role !== "doctor" || !sessionUserId) return;

    doctorApi
      .get(`/ai/status/${sessionUserId}`)
      .then((res) => setIsAIEnabled(res.data.isAIEnabled))
      .catch((err) =>
        console.log("AI Status fetch error (might be not set yet):", err)
      );
  }, [role, sessionUserId]);

  const handleToggleAI = async () => {
    if (!sessionUserId) return;
    try {
      const newStatus = !isAIEnabled;
      setIsAIEnabled(newStatus); // Optimistic update
      await doctorApi.patch('/ai/toggle', {
        doctorId: sessionUserId,
        isAIEnabled: newStatus
      });
    } catch (error) {
      console.error("Failed to toggle AI", error);
      setIsAIEnabled(!isAIEnabled); // Revert on error
    }
  };

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
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-semibold text-xl text-gray-900">Messages</h2>
            <p className="text-sm text-gray-500 mt-1">
              {role === "doctor" ? "Your patients" : "Your doctors"}
            </p>
          </div>
          {role === "doctor" && session?.user && (
            <div className="flex flex-col items-end gap-1">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={isAIEnabled}
                  onChange={handleToggleAI}
                />
                <div className="relative w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
              <span className="text-xs text-gray-500 font-medium">Auto-Reply {isAIEnabled ? 'On' : 'Off'}</span>
            </div>
          )}
        </div>
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
