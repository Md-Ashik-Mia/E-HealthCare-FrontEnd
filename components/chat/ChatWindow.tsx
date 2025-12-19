"use client";

import { useEffect, useState, useRef } from "react";
import { patientApi, doctorApi } from "@/lib/axios";
import { useSocket } from "@/context/SocketContext";
import { useCall } from "@/context/CallContext";
import clsx from "clsx";

interface Msg {
  _id: string;
  conversationId: string;
  senderId: string;
  message: string;
  isAI?: boolean;
}

export default function ChatWindow({
  user,
  conversationId,
  role,
}: {
  user: { _id?: string; id?: string; name: string; role?: string };
  conversationId: string;
  role: "doctor" | "patient";
}) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAIEnabled, setIsAIEnabled] = useState(false); // New state for AI Toggle
  const api = role === "doctor" ? doctorApi : patientApi;
  const bottomRef = useRef<HTMLDivElement>(null);
  const { userId, onlineUsers, socket, isConversationMuted, toggleConversationMute } = useSocket();
  const { openCall } = useCall();

  const peerUserId = (user._id || user.id || "").toString();
  const isUserOnline = peerUserId ? onlineUsers.includes(peerUserId) : false;
  const isMuted = isConversationMuted(conversationId);

  useEffect(() => {
    if (!conversationId || !socket) return;

    let cancelled = false;

    // Clear previous messages and errors immediately when switching conversations
    Promise.resolve().then(() => {
      if (cancelled) return;
      setMessages([]);
      setError(null);
      setLoading(true);
    });

    console.log("📡 Fetching messages for conversation:", conversationId);
    api.get(`/chat/${conversationId}/messages`)
      .then((res) => {
        console.log("📥 Loaded messages:", res.data.length);
        setMessages(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Error loading messages:", err);
        setError("Failed to load messages. Please try again.");
        setLoading(false);
      });

    // Check per-conversation AI auto-reply status if current user is doctor
    if (role === 'doctor' && userId) {
      api.get(`/chat/${conversationId}/ai-auto-reply`)
        .then(res => setIsAIEnabled(!!res.data.effectiveEnabled))
        .catch(err => console.error("❌ Error fetching conversation AI status:", err));
    }

    const handleMessageReceive = (msg: Msg) => {
      console.log("📨 Message received via socket:", msg);

      if (msg.conversationId === conversationId) {
        setMessages((prev) => {
          // 1. Check if we already have this EXACT message ID (server confirmation)
          if (prev.some(m => m._id === msg._id)) {
            return prev;
          }

          // 2. If this is my own message (senderId matches), replace the optimistic one
          if (msg.senderId === userId) {
            // Find the optimistic message (we can assume it's the last one or match by content)
            // A simple heuristic: find the last message by this user that has a temporary-looking ID (long string)
            // OR simply replace the last message if it matches content.

            const optimisticIndex = prev.findIndex(m =>
              m.senderId === userId &&
              m.message === msg.message &&
              m._id.length > 24 // MongoDB IDs are 24 hex chars, UUIDs are 36 chars
            );

            if (optimisticIndex !== -1) {
              console.log("🔄 Replacing optimistic message with confirmed one");
              const newMessages = [...prev];
              newMessages[optimisticIndex] = msg;
              return newMessages;
            }
          }

          return [...prev, msg];
        });
        console.log("✅ Message added to UI");
      }
    };

    socket.on("message:receive", handleMessageReceive);

    const handleMessageError = (payload: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
      const msg = payload?.error || "Failed to send message.";
      console.error("❌ Socket message:error:", payload);
      setError(msg);
    };

    socket.on("message:error", handleMessageError);

    return () => {
      cancelled = true;
      socket.off("message:receive", handleMessageReceive);
      socket.off("message:error", handleMessageError);
    };
  }, [conversationId, socket, api, userId, role]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleAI = async () => {
    if (!userId) return;
    try {
      const newState = !isAIEnabled;
      setIsAIEnabled(newState); // Optimistic update
      const res = await api.patch(`/chat/${conversationId}/ai-auto-reply`, { enabled: newState });
      setIsAIEnabled(!!res.data.effectiveEnabled);
    } catch (err) {
      console.error("❌ Error toggling AI:", err);
      setIsAIEnabled(!isAIEnabled); // Revert on error
    }
  };

  function send() {
    if (!input.trim() || !userId || !socket) {
      console.log("⚠️ Cannot send: empty message, no userId, or no socket");
      return;
    }

    const payload = {
      conversationId,
      from: userId,
      to: peerUserId,
      message: input,
    };

    console.log("📤 Sending message:", payload);
    console.log("🔌 Socket Status:", {
      connected: socket.connected,
      id: socket.id,
      disconnected: socket.disconnected
    });

    if (!socket.connected) {
      console.error("❌ Socket is NOT connected! Message might not send.");
      // Try to reconnect?
      socket.connect();
    }

    // Optimistic update: Add message to UI immediately
    const optimisticMsg: Msg = {
      _id: crypto.randomUUID(), // Temporary ID
      conversationId,
      senderId: userId,
      message: input,
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    socket.emit("message:send", payload);
    setInput("");
  }

  function startAudioCall() {
    if (peerUserId) openCall(peerUserId);
  }

  function startVideoCall() {
    if (peerUserId) openCall(peerUserId);
  }

  return (
    <div className="flex flex-col h-full w-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-lg">
              {user.role === 'doctor' ? '👨‍⚕️' : '👤'}
            </div>
            {isUserOnline && (
              <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></div>
            )}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-500">
              {isUserOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        {/* Mute notifications for this room */}
        <button
          onClick={() => toggleConversationMute(conversationId)}
          className={clsx(
            "ml-4 flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border",
            isMuted
              ? "bg-gray-200 text-gray-700 border-gray-300 hover:bg-gray-300"
              : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
          )}
          title={isMuted ? "Unmute notifications for this chat" : "Mute notifications for this chat"}
        >
          <span className="text-lg">{isMuted ? "🔕" : "🔔"}</span>
          {isMuted ? "Muted" : "Mute"}
        </button>

        {/* AI Toggle for Doctor */}
        {role === 'doctor' && (
          <button
            onClick={toggleAI}
            className={clsx(
              "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border mr-auto ml-4",
              isAIEnabled
                ? "bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200"
                : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
            )}
            title={isAIEnabled ? "Disable AI Auto-reply" : "Enable AI Auto-reply"}
          >
            <span className="text-lg">🤖</span>
            {isAIEnabled ? "AI On" : "AI Off"}
          </button>
        )}

        {/* Call Buttons */}
        <div className="flex gap-2">
          <button
            onClick={startAudioCall}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            title="Audio Call"
          >
            <span className="text-xl">🎤</span>
          </button>
          <button
            onClick={startVideoCall}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            title="Video Call"
          >
            <span className="text-xl">📹</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-sm mt-4">Loading messages...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-full text-red-500">
            <p className="text-lg">⚠️ {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Reload Page
            </button>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p className="text-lg">No messages yet</p>
            <p className="text-sm mt-2">Start the conversation by sending a message below</p>
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m._id}
              className={clsx(
                "flex",
                m.senderId === userId ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={clsx(
                  "max-w-sm p-3 rounded-lg",
                  m.senderId === userId
                    ? "bg-blue-600 text-white"
                    : m.isAI
                      ? "bg-purple-100 text-purple-900 border border-purple-300"
                      : "bg-white text-gray-900 border border-gray-200"
                )}
              >
                {m.isAI && (
                  <p className="text-xs text-purple-600 mb-1">🤖 AI Reply</p>
                )}
                <p className="whitespace-pre-wrap wrap-break-word">{m.message}</p>
              </div>
            </div>
          ))
        )}

        <div ref={bottomRef}></div>
      </div>

      {/* Input */}
      <div className="p-4 border-t bg-white flex space-x-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && send()}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          placeholder="Type a message..."
        />
        <button
          onClick={send}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Send
        </button>
      </div>
    </div>
  );
}
