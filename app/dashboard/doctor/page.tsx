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
                <p className="text-gray-600">Welcome back, Dr. {session?.user?.name}</p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <Card className="bg-blue-600 text-white">
                    <p className="text-blue-100">Total Patients</p>
                    <p className="text-3xl font-bold">1,240</p>
                </Card>
                <Card className="bg-teal-500 text-white">
                    <p className="text-teal-100">Appointments Today</p>
                    <p className="text-3xl font-bold">8</p>
                </Card>
                <Card className="bg-purple-600 text-white">
                    <p className="text-purple-100">Pending Reports</p>
                    <p className="text-3xl font-bold">3</p>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* Profile Section */}
                <Card title="My Profile" className="lg:col-span-1">
                    {profile ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-2xl">👨‍⚕️</div>
                                <div>
                                    <p className="font-semibold">{profile.name}</p>
                                    <p className="text-sm text-gray-500">{profile.specialization}</p>
                                </div>
                            </div>
                            <div className="border-t pt-4 space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Experience:</span>
                                    <span className="font-medium">{profile.experience}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Hospital:</span>
                                    <span className="font-medium">{profile.hospital}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Rating:</span>
                                    <span className="font-medium text-yellow-500">★ {profile.rating}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p>No profile data available.</p>
                    )}
                </Card>

                {/* Appointments Section */}
                <Card title="Today's Appointments" className="lg:col-span-2">
                    {appointments && appointments.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b text-sm text-gray-500">
                                        <th className="pb-3">Patient</th>
                                        <th className="pb-3">Time</th>
                                        <th className="pb-3">Type</th>
                                        <th className="pb-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {appointments.map((apt: any) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
                                        <tr key={apt.id}>
                                            <td className="py-4">
                                                <p className="font-medium">{apt.patient}</p>
                                                <p className="text-xs text-gray-500">Age: {apt.age}</p>
                                            </td>
                                            <td className="py-4 font-medium">{apt.time}</td>
                                            <td className="py-4 text-gray-600">{apt.type}</td>
                                            <td className="py-4">
                                                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
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
