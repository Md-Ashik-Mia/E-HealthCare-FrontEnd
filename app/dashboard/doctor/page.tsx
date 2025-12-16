'use client';

import { useQuery } from '@tanstack/react-query';
import { getDoctorProfile, getDoctorAppointments } from '@/services/doctorService';
import { useSession } from 'next-auth/react';
import Card from '@/components/ui/Card';

export default function DoctorDashboard() {
    const { data: session } = useSession();

    const { data: profile, isLoading: profileLoading } = useQuery({
        queryKey: ['doctorProfile'],
        queryFn: getDoctorProfile,
        enabled: !!session,
    });

    const { data: appointments, isLoading: appointmentsLoading } = useQuery({
        queryKey: ['doctorAppointments'],
        queryFn: getDoctorAppointments,
        enabled: !!session,
    });

    if (profileLoading || appointmentsLoading) return <div className="flex h-full items-center justify-center">Loading...</div>;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Doctor Dashboard</h1>
                <p className="text-gray-700 font-medium">Welcome back, Dr. {session?.user?.name}</p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <Card className="!bg-blue-600 text-white shadow-lg">
                    <p className="text-white font-medium opacity-90">Total Patients</p>
                    <p className="text-3xl font-bold">1,240</p>
                </Card>
                <Card className="!bg-teal-600 text-white shadow-lg">
                    <p className="text-white font-medium opacity-90">Appointments Today</p>
                    <p className="text-3xl font-bold">8</p>
                </Card>
                <Card className="!bg-purple-600 text-white shadow-lg">
                    <p className="text-white font-medium opacity-90">Pending Reports</p>
                    <p className="text-3xl font-bold">3</p>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* Profile Section */}
                <Card title="My Profile" className="lg:col-span-1 shadow-md">
                    {profile ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-2xl border-2 border-blue-200">👨‍⚕️</div>
                                <div>
                                    <p className="font-bold text-gray-900 text-lg">{profile.name}</p>
                                    <p className="text-sm text-gray-700 font-medium">{profile.specialization}</p>
                                </div>
                            </div>
                            <div className="border-t border-gray-200 pt-4 space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-700 font-medium">Experience:</span>
                                    <span className="font-bold text-gray-900">{profile.experience}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-700 font-medium">Hospital:</span>
                                    <span className="font-bold text-gray-900">{profile.hospital}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-700 font-medium">Rating:</span>
                                    <span className="font-bold text-amber-500">★ {profile.rating}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-600">No profile data available.</p>
                    )}
                </Card>

                {/* Appointments Section */}
                <Card title="Today's Appointments" className="lg:col-span-2 shadow-md">
                    {appointments && appointments.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-gray-200 text-sm text-gray-800">
                                        <th className="pb-3 font-bold">Patient</th>
                                        <th className="pb-3 font-bold">Time</th>
                                        <th className="pb-3 font-bold">Type</th>
                                        <th className="pb-3 font-bold">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {appointments.map((apt: any) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
                                        <tr key={apt.id} className="hover:bg-gray-50">
                                            <td className="py-4">
                                                <p className="font-bold text-gray-900">{apt.patient}</p>
                                                <p className="text-xs text-gray-600 font-medium">Age: {apt.age}</p>
                                            </td>
                                            <td className="py-4 font-bold text-gray-800">{apt.time}</td>
                                            <td className="py-4 text-gray-800 font-medium">{apt.type}</td>
                                            <td className="py-4">
                                                <span className={`rounded-full px-3 py-1 text-xs font-bold ${apt.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                    apt.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                        'bg-blue-100 text-blue-800'
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
                        <p className="text-gray-600 font-medium">No appointments found.</p>
                    )}
                </Card>
            </div>
        </div>
    );
}
