"use client";

import { motion } from "framer-motion";
import { useCall } from "@/context/CallContext";
import { socket } from "@/lib/socket";
import { useEffect, useRef, useState } from "react";

export default function CallWindow() {
  const {
    isOpen,
    closeCall,
    remoteUserId,
    setLocalStream,
    setRemoteStream,
    setInCall,
    peerRef,     // ← use THIS peerRef (from context)
  } = useCall();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  interface Message {
    text: string;
    to: string | null;
    fromMe: boolean;
  }

  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);


  /** ---------------------------
   *   INITIALIZE WEBRTC
   * -----------------------------
   */
  async function startCall() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setLocalStream(stream);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const peer = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });

      peerRef.current = peer;

      // Send local ICE candidates to other user
      peer.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", {
            to: remoteUserId,
            candidate: event.candidate,
          });
        }
      };

      // When remote stream arrives
      peer.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      // Add local stream tracks
      stream.getTracks().forEach((track) => {
        peer.addTrack(track, stream);
      });

      // Offer SDP
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);

      socket.emit("call-user", {
        offer,
        to: remoteUserId,
      });

      setInCall(true);
    } catch (error) {
      console.error("Error starting call:", error);
      alert("Could not access camera/microphone. Please check permissions.");
    }
  }

  // Auto-start call when window opens
  useEffect(() => {
    if (isOpen && remoteUserId) {
      startCall();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, remoteUserId]);

  /** ---------------------------
   *   SOCKET SIGNALING
   * -----------------------------
   */
  useEffect(() => {
    socket.on("call-offer", async ({ offer, from }) => {
      if (!peerRef.current) {
        peerRef.current = new RTCPeerConnection({
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });
      }

      const peer = peerRef.current;

      peer.ontrack = (event) => {
        setRemoteStream(event.streams[0]);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      peer.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", {
            to: from,
            candidate: event.candidate,
          });
        }
      };

      // Local stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setLocalStream(stream);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      stream.getTracks().forEach((track) => {
        peer.addTrack(track, stream);
      });

      await peer.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      socket.emit("call-answer", {
        to: from,
        answer,
      });

      setInCall(true);
    });

    socket.on("call-answer", async ({ answer }) => {
      await peerRef.current?.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      try {
        await peerRef.current?.addIceCandidate(candidate);
      } catch (e) {
        console.error("ICE FAILED:", e);
      }
    });

    return () => {
      socket.off("call-offer");
      socket.off("call-answer");
      socket.off("ice-candidate");
    };
  }, [peerRef, setInCall, setLocalStream, setRemoteStream]);

  /** ---------------------------
   *    CHAT MESSAGES
   * -----------------------------
   */
  useEffect(() => {
    socket.on("chat-message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("chat-message");
    };
  }, []);

  function sendMessage() {
    if (!chatInput.trim()) return;

    const msg = {
      text: chatInput,
      to: remoteUserId,
      fromMe: true,
    };

    socket.emit("chat-message", msg);

    setMessages((prev) => [...prev, msg]);
    setChatInput("");
  }

  if (!isOpen) return null;

  return (
    <motion.div
      drag
      className="fixed bottom-4 right-4 z-50 w-[450px] h-[600px] bg-white shadow-2xl rounded-xl border overflow-hidden"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 flex justify-between items-center">
        <span className="font-semibold">Live Consultation</span>
        <button
          onClick={closeCall}
          className="hover:bg-white/20 px-2 py-1 rounded"
        >
          ✕
        </button>
      </div>

      {/* Video Area */}
      <div className="relative h-[55%] bg-black">
        <video
          ref={localVideoRef}
          autoPlay
          muted
          className="absolute bottom-2 right-2 w-32 h-24 bg-gray-900 rounded-lg border border-white/20"
        />

        <video
          ref={remoteVideoRef}
          autoPlay
          className="w-full h-full object-cover"
        />
      </div>

      {/* Chat */}
      <div className="h-[45%] flex flex-col">
        <div className="flex-1 p-3 overflow-y-auto space-y-2 bg-gray-50">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`p-2 rounded-lg max-w-[70%] ${msg.fromMe ? "ml-auto bg-blue-600 text-white" : "bg-gray-200"
                }`}
            >
              {msg.text}
            </div>
          ))}
        </div>

        <div className="flex p-2 border-t bg-white">
          <input
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="flex-1 px-3 py-2 border rounded-lg"
            placeholder="Type message..."
          />
          <button
            onClick={sendMessage}
            className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Send
          </button>
        </div>
      </div>
    </motion.div>
  );
}
