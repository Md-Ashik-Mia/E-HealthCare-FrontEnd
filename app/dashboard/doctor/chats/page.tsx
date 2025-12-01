// 'use client';

// import { useQuery } from '@tanstack/react-query';
// import { getDoctorAppointments } from '@/services/doctorService';
// import ChatList from '@/components/chat/ChatList';

// export default function DoctorChatsPage() {
//     const { data: appointments, isLoading } = useQuery({
//         queryKey: ['doctorAppointments'],
//         queryFn: getDoctorAppointments,
//     });

//     if (isLoading) return <div className="p-8 text-center">Loading patients...</div>;

//     // Extract unique patients from appointments
//     const uniquePatients = new Map();

//     if (Array.isArray(appointments)) {
//         appointments.forEach((apt: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
//             // Try to extract patient info from various possible structures
//             const patientId = apt.patientId || apt.patient?._id || apt.userId;
//             const patientName = apt.patientName || apt.patient?.name || apt.patient;

//             if (patientId && patientName && !uniquePatients.has(patientId)) {
//                 uniquePatients.set(patientId, {
//                     id: patientId,
//                     name: patientName,
//                     role: 'patient',
//                     condition: 'Patient'
//                 });
//             }
//         });
//     }

//     const users = Array.from(uniquePatients.values());

//     return (
//         <div className="space-y-6">
//             <h1 className="text-3xl font-bold text-gray-900">Chat with Patients</h1>
//             <p className="text-gray-600">Select a patient to start chatting.</p>
//             {users.length > 0 ? (
//                 <ChatList users={users} basePath="/dashboard/doctor/chats" />
//             ) : (
//                 <div className="text-center py-12 bg-white rounded-lg border border-dashed">
//                     <p className="text-gray-500">No patients found from your appointments history.</p>
//                     <p className="text-sm text-gray-400 mt-2">Patients will appear here once they book an appointment.</p>
//                 </div>
//             )}
//         </div>
//     );
// }



"use client";

import { useState } from "react";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatWindow from "@/components/chat/ChatWindow";

export default function DoctorChatPage() {
  const [selected, setSelected] = useState<{ id: string; user: { _id: string; name: string; role: string } | undefined } | null>(null);

  return (
    <div className="flex h-full">
      <ChatSidebar
        role="doctor"
        onSelect={(id, user) => setSelected({ id, user })}
      />

      <div className="flex-1">
        {selected && selected.user ? (
          <ChatWindow
            role="doctor"
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
