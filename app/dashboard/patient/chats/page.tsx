// 'use client';

// import { useQuery } from '@tanstack/react-query';
// import { getApprovedDoctors } from '@/services/patientService';
// import ChatList from '@/components/chat/ChatList';

// export default function PatientChatsPage() {
//     const { data: doctors, isLoading } = useQuery({
//         queryKey: ['approvedDoctors'],
//         queryFn: getApprovedDoctors,
//     });

//     if (isLoading) return <div className="p-8 text-center">Loading doctors...</div>;

//     // Transform doctors to match ChatList User interface
//     const users = doctors?.map((doc: any) => ({ // eslint-disable-line @typescript-eslint/no-explicit-any
//         id: doc._id || doc.id,
//         name: doc.name,
//         role: 'doctor',
//         specialty: doc.speciality || doc.specialty
//     })) || [];

//     return (
//         <div className="space-y-6">
//             <h1 className="text-3xl font-bold text-gray-900">Chat with Doctors</h1>
//             <p className="text-gray-600">Select a doctor to start chatting or consult via video/audio call.</p>
//             <ChatList users={users} basePath="/dashboard/patient/chats" />
//         </div>
//     );
// }


"use client";

import { useState } from "react";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatWindow from "@/components/chat/ChatWindow";

export default function PatientChatPage() {
  const [selected, setSelected] = useState<{ id: string; user: { _id: string; name: string; role: string } | undefined } | null>(null);

  return (
    <div className="flex h-full">
      <ChatSidebar
        role="patient"
        onSelect={(id, user) => setSelected({ id, user })}
      />

      <div className="flex-1">
        {selected && selected.user ? (
          <ChatWindow
            role="patient"
            user={selected.user}
            conversationId={selected.id}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-black-500">
            Select a chat to begin
          </div>
        )}
      </div>
    </div>
  );
}
