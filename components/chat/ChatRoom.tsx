'use client';

import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSession } from 'next-auth/react';
import Button from '@/components/ui/Button';
import { doctorApi, patientApi } from '@/lib/axios';
import { useCall } from '@/context/CallContext';

interface Message {
    sender: string;
    message: string;
    timestamp: string;
}

interface ChatRoomProps {
    otherUserId: string;
    otherUserName: string;
    role: 'patient' | 'doctor';
}

export default function ChatRoom({ otherUserId, otherUserName, role }: ChatRoomProps) {
    const { data: session } = useSession();
    const { openCall } = useCall(); // Get openCall from CallContext
    const [socket, setSocket] = useState<Socket | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [aiEnabled, setAiEnabled] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom on new message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Initialize Socket and AI Status
    useEffect(() => {
        if (!session?.user) return;

        // Connect to Socket.io
        const newSocket = io('http://localhost:5000');
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSocket(newSocket);

        const roomId = [session.user.id, otherUserId].sort().join('-');

        newSocket.emit('joinRoom', {
            roomId,
            userId: session.user.id,
            role
        });

        newSocket.on('newMessage', (msg: Message) => {
            setMessages((prev) => [...prev, msg]);
        });

        // Fetch AI status if doctor
        if (role === 'doctor') {
            const fetchAiStatus = async () => {
                try {
                    const response = await doctorApi.get(`/ai/status/${session.user.id}`);
                    setAiEnabled(response.data.isAIEnabled);
                } catch (error) {
                    console.error('Error fetching AI status:', error);
                }
            };
            fetchAiStatus();
        }

        return () => {
            newSocket.disconnect();
        };
    }, [session, otherUserId, role]);

    const sendMessage = async () => {
        if (!inputMessage.trim() || !socket || !session?.user) return;

        const messageData = {
            sender: role, // 'patient' or 'doctor'
            message: inputMessage,
            timestamp: new Date().toISOString(),
            roomId: [session.user.id, otherUserId].sort().join('-'),
            receiverId: otherUserId
        };

        // Emit to socket
        socket.emit('sendMessage', messageData);

        // Add to local state immediately
        setMessages((prev) => [...prev, messageData]);
        setInputMessage('');

        // If patient sending to doctor with AI enabled
        if (role === 'patient') {
            try {
                const response = await patientApi.post(`/ai/response/${otherUserId}`, {
                    query: inputMessage,
                });

                if (response.data && response.data.response) {
                    const aiMsg = {
                        sender: 'ai',
                        message: response.data.response,
                        timestamp: new Date().toISOString()
                    };
                    setMessages((prev) => [...prev, aiMsg]);
                }
            } catch (error) {
                console.log('AI response not available or error:', error);
            }
        }
    };

    const toggleAI = async () => {
        if (role !== 'doctor' || !session?.user) return;
        try {
            const newStatus = !aiEnabled;
            await doctorApi.patch('/ai/toggle', {
                doctorId: session.user.id,
                isAIEnabled: newStatus
            });
            setAiEnabled(newStatus);
        } catch (error) {
            console.error('Error toggling AI:', error);
        }
    };

    const handleVideoCall = () => {
        openCall(otherUserId); // Open call window with video
    };

    const handleAudioCall = () => {
        openCall(otherUserId); // Open call window with audio
    };

    return (
        <div className="flex flex-col h-[calc(100vh-120px)]">
            {/* Header */}
            <div className="bg-white p-4 border-b flex justify-between items-center shadow-sm rounded-t-lg">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-xl">
                        {role === 'patient' ? '👨‍⚕️' : '👤'}
                    </div>
                    <div>
                        <h2 className="font-bold text-gray-800">{otherUserName}</h2>
                        <p className="text-xs text-green-600 flex items-center gap-1">
                            <span className="h-2 w-2 rounded-full bg-green-500"></span> Online
                        </p>
                    </div>
                </div>

                <div className="flex gap-2">
                    {role === 'doctor' && (
                        <Button
                            variant={aiEnabled ? 'primary' : 'outline'}
                            onClick={toggleAI}
                            className="mr-2"
                        >
                            {aiEnabled ? '🤖 AI Auto-Reply On' : '🤖 Enable AI'}
                        </Button>
                    )}
                    <Button variant="ghost" onClick={handleAudioCall} title="Audio Call">📞</Button>
                    <Button variant="ghost" onClick={handleVideoCall} title="Video Call">📹</Button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
                {messages.map((msg, idx) => {
                    const isMe = msg.sender === role;
                    const isAi = msg.sender === 'ai';
                    return (
                        <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] rounded-lg p-3 ${isMe
                                ? 'bg-blue-600 text-white rounded-br-none'
                                : isAi
                                    ? 'bg-purple-100 text-purple-900 border border-purple-200'
                                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                                }`}>
                                {isAi && <p className="text-xs font-bold mb-1 text-purple-700">🤖 AI Assistant</p>}
                                <p>{msg.message}</p>
                                <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-blue-100' : 'text-gray-400'}`}>
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white p-4 border-t rounded-b-lg">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Type a message..."
                        className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Button onClick={sendMessage}>Send</Button>
                </div>
            </div>
        </div>
    );
}
