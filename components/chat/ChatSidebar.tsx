"use client";

import { useEffect, useState } from "react";
import { patientApi, doctorApi } from "@/lib/axios";
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
  const api = role === "doctor" ? doctorApi : patientApi;

  useEffect(() => {
    api.get("/chat/my").then((res) => setConversations(res.data));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-64 bg-green-800 border-r p-4 overflow-y-auto">
      <h2 className="font-semibold text-xl mb-4">Chats</h2>

      {conversations.map((c) => {
        const other = c.participants.find((p) => p.role !== role);

        return (
          <div
            key={c._id}
            onClick={() => onSelect(c._id, other)}
            className={clsx(
              "p-3 mb-2 rounded cursor-pointer bg-blue hover:bg-black-200"
            )}
          >
            <p className="font-semibold">{other?.name}</p>
            <p className="text-sm text-yellow line-clamp-1">
              {c.lastMessage}
            </p>
          </div>
        );
      })}
    </div>
  );
}
