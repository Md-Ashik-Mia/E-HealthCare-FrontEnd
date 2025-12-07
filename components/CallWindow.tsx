"use client";

import { motion } from "framer-motion";
import { useCall } from "@/context/CallContext";
import { useSocket } from "@/context/SocketContext";
// import { socket } from "@/lib/socket"; // Removed to use context socket
import { useEffect, useRef, useState } from "react";

export default function CallWindow() {
  const { userId, socket } = useSocket();
  const {
    isOpen,
    openCall,
    closeCall,
    remoteUserId,
    // inCall, // unused
    // localStream, // unused
    // remoteStream, // unused
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
  const [isRinging, setIsRinging] = useState(false);
  const [callerId, setCallerId] = useState<string | null>(null);
  const [pendingOffer, setPendingOffer] = useState<RTCSessionDescriptionInit | null>(null);
  const ringtoneRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    ringtoneRef.current = new Audio("/sounds/ringtone.mp3"); // Ensure this file exists or use a URL
    ringtoneRef.current.loop = true;
  }, []);

  const playRingtone = () => {
    try {
      ringtoneRef.current?.play().catch(e => console.error("Audio play failed:", e));
    } catch (e) {
      console.error("Error playing ringtone:", e);
    }
  };

  const stopRingtone = () => {
    ringtoneRef.current?.pause();
    if (ringtoneRef.current) ringtoneRef.current.currentTime = 0;
  };

  const acceptCall = async () => {
    stopRingtone();
    setIsRinging(false);

    if (!pendingOffer) return;

    // Initialize WebRTC
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
      if (event.candidate && socket) {
        socket.emit("call:ice-candidate", {
          to: callerId,
          candidate: event.candidate,
        });
      }
    };

    // Local stream
    try {
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

      await peer.setRemoteDescription(new RTCSessionDescription(pendingOffer));
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      if (socket) {
        socket.emit("call:answer", {
          to: callerId,
          answer,
        });
      }

      setInCall(true);
    } catch (err) {
      console.error("Error accepting call:", err);
      alert("Could not access camera/microphone");
    }
  };

  const declineCall = () => {
    stopRingtone();
    setIsRinging(false);
    setPendingOffer(null);
    closeCall();
    // Optionally emit a 'call:rejected' event here
  };


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
        if (event.candidate && socket) {
          socket.emit("call:ice-candidate", {
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

      if (socket) {
        socket.emit("call:offer", {
          offer,
          to: remoteUserId,
          from: userId,
        });
      }

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
    if (!socket) return;

    socket.on("call:offer", async ({ offer, from }) => {
      console.log("📞 Incoming call from:", from);

      // Auto-open window but show ringing state
      if (!isOpen) {
        openCall(from);
      }

      setCallerId(from);
      setPendingOffer(offer);
      setIsRinging(true);
      playRingtone();
    });

    socket.on("call:answer", async ({ answer }) => {
      await peerRef.current?.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
    });

    socket.on("call:ice-candidate", async ({ candidate }) => {
      try {
        await peerRef.current?.addIceCandidate(candidate);
      } catch (e) {
        console.error("ICE FAILED:", e);
      }
    });

    return () => {
      socket.off("call:offer");
      socket.off("call:answer");
      socket.off("call:ice-candidate");
    };
  }, [peerRef, setInCall, setLocalStream, setRemoteStream, isOpen, openCall, socket]);

  /** ---------------------------
   *    CHAT MESSAGES
   * -----------------------------
   */
  useEffect(() => {
    if (!socket) return;

    socket.on("chat-message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("chat-message");
    };
  }, [socket]);

  function sendMessage() {
    if (!chatInput.trim()) return;

    const msg = {
      text: chatInput,
      to: remoteUserId,
      fromMe: true,
    };

    if (socket) socket.emit("chat-message", msg);

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
        {isRinging ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white z-10">
            <div className="h-20 w-20 bg-blue-500 rounded-full flex items-center justify-center mb-4 animate-pulse">
              <span className="text-3xl">📞</span>
            </div>
            <h3 className="text-xl font-bold mb-2">Incoming Call...</h3>
            <div className="flex gap-4 mt-4">
              <button
                onClick={declineCall}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full font-semibold transition-colors"
              >
                Decline
              </button>
              <button
                onClick={acceptCall}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full font-semibold transition-colors"
              >
                Accept
              </button>
            </div>
          </div>
        ) : (
          <>
            <video
              ref={localVideoRef}
              autoPlay
              muted
              className="absolute bottom-2 right-2 w-32 h-24 bg-gray-900 rounded-lg border border-white/20 z-10"
            />
            <video
              ref={remoteVideoRef}
              autoPlay
              className="w-full h-full object-cover"
            />
          </>
        )}
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
