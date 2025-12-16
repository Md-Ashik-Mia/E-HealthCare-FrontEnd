"use client";

import { createContext, useContext, useState, useRef } from "react";

interface CallContextType {
  isOpen: boolean;
  inCall: boolean;
  remoteUserId: string | null;

  localStream: MediaStream | null;
  remoteStream: MediaStream | null;

  // New: Call notification state
  callAvailable: boolean;
  callerInfo: { id: string; name: string } | null;

  openCall: (id: string) => void;
  closeCall: () => void;
  joinCall: () => void; // New: Explicit join function

  setLocalStream: (s: MediaStream) => void;
  setRemoteStream: (s: MediaStream) => void;
  setInCall: (v: boolean) => void;
  setCallAvailable: (v: boolean) => void; // New
  setCallerInfo: (info: { id: string; name: string } | null) => void; // New

  peerRef: React.MutableRefObject<RTCPeerConnection | null>;
}

const CallContext = createContext<CallContextType | null>(null);

export const CallProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inCall, setInCall] = useState(false);
  const [remoteUserId, setRemoteUserId] = useState<string | null>(null);

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  // New: Call notification state
  const [callAvailable, setCallAvailable] = useState(false);
  const [callerInfo, setCallerInfo] = useState<{ id: string; name: string } | null>(null);

  const peerRef = useRef<RTCPeerConnection | null>(null);

  function openCall(id: string) {
    setIsOpen(true);
    setRemoteUserId(id);
  }

  function joinCall() {
    // This will be called when user clicks "Join Call" button
    // The actual WebRTC connection will be handled in CallWindow
    setCallAvailable(false);
    setIsOpen(true);
  }

  function closeCall() {
    setIsOpen(false);
    setInCall(false);
    setCallAvailable(false);
    setCallerInfo(null);

    // Stop video streams
    localStream?.getTracks().forEach((t) => t.stop());
    remoteStream?.getTracks().forEach((t) => t.stop());

    setLocalStream(null);
    setRemoteStream(null);

    // Close peer connection
    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }
  }

  return (
    <CallContext.Provider
      value={{
        isOpen,
        inCall,
        remoteUserId,

        localStream,
        remoteStream,

        callAvailable,
        callerInfo,

        openCall,
        closeCall,
        joinCall,

        setLocalStream,
        setRemoteStream,
        setInCall,
        setCallAvailable,
        setCallerInfo,

        peerRef,
      }}
    >
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => useContext(CallContext)!;
