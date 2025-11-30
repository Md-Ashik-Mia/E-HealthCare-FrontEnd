'use client';

import { useQuery } from '@tanstack/react-query';
import { getPatientProfile, getPatientAppointments } from '@/services/patientService';
import { useSession } from 'next-auth/react';
import Card from '@/components/ui/Card';

export default function PatientDashboard() {
    const { data: session } = useSession();

    const { data: profile, isLoading: profileLoading } = useQuery({
        queryKey: ['patientProfile'],
        queryFn: getPatientProfile,
        enabled: !!session,
    });

    const { data: appointments, isLoading: appointmentsLoading } = useQuery({
        queryKey: ['patientAppointments'],
        queryFn: getPatientAppointments,
        enabled: !!session,
    });

    if (profileLoading || appointmentsLoading) return <div className="flex h-full items-center justify-center">Loading...</div>;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Patient Dashboard</h1>
                <p className="text-gray-600">Welcome back, {session?.user?.name}</p>
            </div>

            {/* Vitals Section */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                <Card className="border-l-4 border-red-500">
                    <p className="text-sm text-gray-500">Heart Rate</p>
                    <p className="text-2xl font-bold">72 <span className="text-sm font-normal text-gray-400">bpm</span></p>
                </Card>
                <Card className="border-l-4 border-blue-500">
                    <p className="text-sm text-gray-500">Blood Pressure</p>
                    <p className="text-2xl font-bold">120/80</p>
                </Card>
                <Card className="border-l-4 border-green-500">
                    <p className="text-sm text-gray-500">Weight</p>
                    <p className="text-2xl font-bold">70 <span className="text-sm font-normal text-gray-400">kg</span></p>
                </Card>
                <Card className="border-l-4 border-yellow-500">
                    <p className="text-sm text-gray-500">Blood Glucose</p>
                    <p className="text-2xl font-bold">95 <span className="text-sm font-normal text-gray-400">mg/dL</span></p>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* Profile Section */}
                <Card title="My Profile" className="lg:col-span-1">
                    {profile ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl">👤</div>
                                <div>
                                    <p className="font-semibold">{profile.name}</p>
                                    <p className="text-sm text-gray-500">{profile.email}</p>
                                </div>
                            </div>
                            <div className="border-t pt-4 space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Age:</span>
                                    <span className="font-medium">{profile.age}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Blood Group:</span>
                                    <span className="font-medium">{profile.bloodGroup}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Address:</span>
                                    <span className="font-medium text-right">{profile.address}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p>No profile data available.</p>
                    )}
                </Card>

                {/* Appointments Section */}
                <Card title="Upcoming Appointments" className="lg:col-span-2">
                    {appointments && appointments.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b text-sm text-gray-500">
                                        <th className="pb-3">Doctor</th>
                                        <th className="pb-3">Date & Time</th>
                                        <th className="pb-3">Reason</th>
                                        <th className="pb-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {appointments.map((apt: any) => (
                                        <tr key={apt.id}>
                                            <td className="py-4">
                                                <p className="font-medium">{apt.doctor}</p>
                                                <p className="text-xs text-gray-500">{apt.specialization}</p>
                                            </td>
                                            <td className="py-4">
                                                <p>{apt.date}</p>
                                                <p className="text-xs text-gray-500">{apt.time}</p>
                                            </td>
                                            <td className="py-4 text-gray-600">{apt.reason}</td>
                                            <td className="py-4">
                                                <span className={`rounded-full px-3 py-1 text-xs font-medium ${apt.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {apt.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-gray-500">No appointments found.</p>
                    )}
                </Card>
            </div>
        </div>
    );
}
