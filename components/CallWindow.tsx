"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCall } from "@/context/CallContext";
import { useSocket } from "@/context/SocketContext";
import { useEffect, useRef, useState } from "react";

export default function CallWindow() {
  const { userId, socket } = useSocket();
  const {
    isOpen,
    openCall,
    closeCall,
    remoteUserId,
    setLocalStream,
    setRemoteStream,
    setInCall,
    peerRef,
    callAvailable,
    callerInfo,
    joinCall,
    setCallAvailable,
    setCallerInfo,
  } = useCall();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);

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
  const isRingingRef = useRef<boolean>(false); // Track if ringtone is already playing
  const isAnsweringCallRef = useRef<boolean>(false); // Track if we're answering (not initiating) a call

  // Call controls state
  const [isMuted, setIsMuted] = useState(false);
  const [isAudioDetected, setIsAudioDetected] = useState(false);

  useEffect(() => {
    ringtoneRef.current = new Audio("/sounds/ringtone.mp3");
    ringtoneRef.current.loop = true;

    // Cleanup on unmount
    return () => {
      if (ringtoneRef.current) {
        ringtoneRef.current.pause();
        ringtoneRef.current.currentTime = 0;
      }
      isRingingRef.current = false;
    };
  }, []);

  const playRingtone = () => {
    // Prevent double ringing
    if (isRingingRef.current) {
      console.log("⚠️ Ringtone already playing, skipping");
      return;
    }

    try {
      isRingingRef.current = true;
      console.log("🔔 Playing ringtone");
      ringtoneRef.current?.play().catch(e => {
        console.error("Audio play failed:", e);
        isRingingRef.current = false;
      });
    } catch (e) {
      console.error("Error playing ringtone:", e);
      isRingingRef.current = false;
    }
  };

  const stopRingtone = () => {
    try {
      if (ringtoneRef.current) {
        ringtoneRef.current.pause();
        ringtoneRef.current.currentTime = 0;
        console.log("🔇 Ringtone stopped");
      }
      isRingingRef.current = false; // Reset the flag
    } catch (e) {
      console.error("Error stopping ringtone:", e);
      isRingingRef.current = false; // Still reset the flag
    }
  };

  const stopMediaStream = (stream: MediaStream | null) => {
    try {
      stream?.getTracks()?.forEach((t) => t.stop());
    } catch {
      // ignore
    }
  };

  const clearVideoElementStream = (video: HTMLVideoElement | null) => {
    if (!video) return;
    try {
      const stream = video.srcObject as MediaStream | null;
      if (stream) stopMediaStream(stream);
      video.srcObject = null;
    } catch {
      // ignore
    }
  };

  const cleanupCallMedia = () => {
    // Stop any streams we tracked explicitly
    stopMediaStream(localStreamRef.current);
    stopMediaStream(remoteStreamRef.current);
    localStreamRef.current = null;
    remoteStreamRef.current = null;

    // Also clear video element streams (covers cases where state hasn't updated yet)
    clearVideoElementStream(localVideoRef.current);
    clearVideoElementStream(remoteVideoRef.current);
  };

  const acceptCall = async () => {
    stopRingtone();
    setIsRinging(false);
    setCallAvailable(false);

    if (!pendingOffer) return;

    // Mark that we're answering a call, not initiating one
    isAnsweringCallRef.current = true;

    // Open call window
    if (callerInfo) {
      openCall(callerInfo.id);
    }

    // Initialize WebRTC
    if (!peerRef.current) {
      peerRef.current = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
    }

    const peer = peerRef.current;

    peer.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
      remoteStreamRef.current = event.streams[0];
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

      localStreamRef.current = stream;

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

      // Reset the answering flag after successful connection
      isAnsweringCallRef.current = false;
    } catch (err) {
      console.error("Error accepting call:", err);
      // Ensure we don't leave camera/mic running if something fails mid-setup
      cleanupCallMedia();
      alert("Could not access camera/microphone");
    }
  };

  const declineCall = () => {
    stopRingtone();
    setIsRinging(false);
    setCallAvailable(false);
    setCallerInfo(null);
    setPendingOffer(null);

    // Defensive: ensure we don't keep any streams
    cleanupCallMedia();

    // Notify caller that call was declined
    if (socket && callerId) {
      socket.emit("call:end", { to: callerId });
    }
  };

  const toggleMute = () => {
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
        console.log(audioTrack.enabled ? "🎤 Microphone unmuted" : "🔇 Microphone muted");
      }
    }
  };

  const endCall = () => {
    console.log("📴 Ending call");

    // Notify remote user
    if (socket && remoteUserId) {
      socket.emit("call:end", { to: remoteUserId });
    }

    // Release camera/mic immediately
    cleanupCallMedia();

    // Close the call state
    closeCall();
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

      localStreamRef.current = stream;

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
        remoteStreamRef.current = event.streams[0];
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
      cleanupCallMedia();
      alert("Could not access camera/microphone. Please check permissions.");
    }
  }

  // Auto-start call when window opens (only if we're initiating, not answering)
  useEffect(() => {
    if (isOpen && remoteUserId && !isAnsweringCallRef.current) {
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

      // Show video icon notification instead of auto-opening
      setCallerInfo({ id: from, name: "User" }); // You can fetch user name from API if needed
      setCallAvailable(true);
      setPendingOffer(offer);
      setCallerId(from);
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

    socket.on("call:end", () => {
      console.log("📴 Call ended by remote user");
      cleanupCallMedia();
      closeCall();
      stopRingtone();
    });

    return () => {
      socket.off("call:offer");
      socket.off("call:answer");
      socket.off("call:ice-candidate");
      socket.off("call:end");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]); // Simplified dependencies - only socket to prevent duplicate listener registration

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

  // Video Icon Notification Component
  const VideoIconNotification = () => {
    if (!callAvailable || !callerInfo) return null;

    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="fixed bottom-24 right-4 z-50 bg-white shadow-2xl rounded-2xl border-2 border-blue-500 overflow-hidden w-80"
        >
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center"
              >
                <span className="text-2xl">📹</span>
              </motion.div>
              <div className="flex-1">
                <p className="font-semibold text-sm">Incoming Video Call</p>
                <p className="text-xs text-blue-100">{callerInfo.name}</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gray-50">
            <p className="text-sm text-gray-600 mb-3">
              {callerInfo.name} is calling you. Join the video consultation?
            </p>
            <div className="flex gap-2">
              <button
                onClick={declineCall}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
              >
                Decline
              </button>
              <button
                onClick={acceptCall}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <span>📹</span>
                Join Call
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  };

  if (!isOpen) return <VideoIconNotification />;

  return (
    <>
      <VideoIconNotification />

      {/* Full-Screen Call Window */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black flex flex-col"
      >
        {/* Header with controls */}
        <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/70 to-transparent p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-xl">👤</span>
              </div>
              <div>
                <p className="text-white font-semibold">Live Consultation</p>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                  <p className="text-white/80 text-sm">Connected</p>
                  {isAudioDetected && (
                    <span className="text-green-400 text-xs flex items-center gap-1">
                      <span className="animate-pulse">🎤</span> Audio Active
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={endCall}
              className="text-white/80 hover:text-white transition-colors"
              title="Close"
            >
              <span className="text-2xl">✕</span>
            </button>
          </div>
        </div>

        {/* Video Area - Full Screen */}
        <div className="relative flex-1 bg-black">
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
              {/* Local Video - Small PiP */}
              <div className="absolute top-20 right-6 w-48 h-36 bg-gray-900 rounded-xl border-2 border-white/30 z-10 overflow-hidden shadow-2xl">
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 left-2 text-white text-xs bg-black/50 px-2 py-1 rounded">
                  You
                </div>
              </div>

              {/* Remote Video - Main */}
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            </>
          )}
        </div>

        {/* Call Controls - Bottom Bar */}
        <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/70 to-transparent p-6">
          <div className="flex items-center justify-center gap-4">
            {/* Mute/Unmute Button */}
            <button
              onClick={toggleMute}
              className={`h-14 w-14 rounded-full flex items-center justify-center transition-all ${isMuted
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-white/20 hover:bg-white/30"
                }`}
              title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
            >
              <span className="text-2xl">{isMuted ? "🔇" : "🎤"}</span>
            </button>

            {/* End Call Button */}
            <button
              onClick={endCall}
              className="h-14 px-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center gap-2 transition-colors"
              title="End Call"
            >
              <span className="text-2xl">📞</span>
              <span className="text-white font-semibold">End Call</span>
            </button>

            {/* Leave Call Button (same as end) */}
            <button
              onClick={endCall}
              className="h-14 w-14 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all"
              title="Leave Call"
            >
              <span className="text-2xl">🚪</span>
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
