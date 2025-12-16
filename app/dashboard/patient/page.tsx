'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPatientProfile, getPatientAppointments, updateProfile } from '@/services/patientService';
import { useSession } from 'next-auth/react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useState } from 'react';

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

    // if (profileLoading || appointmentsLoading) return <div className="flex h-full items-center justify-center">Loading...</div>;

    const queryClient = useQueryClient();
    const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);
    const [vitalsForm, setVitalsForm] = useState({
        heartRate: '',
        bloodPressure: '',
        weight: '',
        bloodGlucose: ''
    });

    const updateProfileMutation = useMutation({
        mutationFn: updateProfile,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['patientProfile'] });
            setIsVitalsModalOpen(false);
            // toast.success('Vitals updated successfully');
        }
    });

    const handleUpdateVitals = (e: React.FormEvent) => {
        e.preventDefault();
        updateProfileMutation.mutate({
            healthMetrics: vitalsForm
        });
    };

    const openVitalsModal = () => {
        if (profile?.healthMetrics) {
            setVitalsForm({
                heartRate: profile.healthMetrics.heartRate || '',
                bloodPressure: profile.healthMetrics.bloodPressure || '',
                weight: profile.healthMetrics.weight || '',
                bloodGlucose: profile.healthMetrics.bloodGlucose || ''
            });
        }
        setIsVitalsModalOpen(true);
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Patient Dashboard</h1>
                    <p className="text-gray-600">Welcome back, {session?.user?.name}</p>
                </div>
                <Button onClick={openVitalsModal}>Update Vitals</Button>
            </div>

            {/* Vitals Section */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                <Card className="border-l-4 border-red-500">
                    <p className="text-sm font-medium text-gray-700">Heart Rate</p>
                    <p className="text-2xl font-bold text-gray-900">
                        {profile?.healthMetrics?.heartRate || 'N/A'} <span className="text-sm font-normal text-gray-600">bpm</span>
                    </p>
                </Card>
                <Card className="border-l-4 border-blue-500">
                    <p className="text-sm font-medium text-gray-700">Blood Pressure</p>
                    <p className="text-2xl font-bold text-gray-900">
                        {profile?.healthMetrics?.bloodPressure || 'N/A'}
                    </p>
                </Card>
                <Card className="border-l-4 border-green-500">
                    <p className="text-sm font-medium text-gray-700">Weight</p>
                    <p className="text-2xl font-bold text-gray-900">
                        {profile?.healthMetrics?.weight || 'N/A'} <span className="text-sm font-normal text-gray-600">kg</span>
                    </p>
                </Card>
                <Card className="border-l-4 border-yellow-500">
                    <p className="text-sm font-medium text-gray-700">Blood Glucose</p>
                    <p className="text-2xl font-bold text-gray-900">
                        {profile?.healthMetrics?.bloodGlucose || 'N/A'} <span className="text-sm font-normal text-gray-600">mg/dL</span>
                    </p>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* Profile Section */}
                <Card title="My Profile" className="lg:col-span-1">
                    {profileLoading ? (
                        <div className="animate-pulse space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 rounded-full bg-gray-200"></div>
                                <div className="space-y-2 flex-1">
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            </div>
                            <div className="space-y-3 pt-4 border-t">
                                <div className="h-4 bg-gray-200 rounded"></div>
                                <div className="h-4 bg-gray-200 rounded"></div>
                                <div className="h-4 bg-gray-200 rounded"></div>
                            </div>
                        </div>
                    ) : profile ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl">👤</div>
                                <div>
                                    <p className="font-semibold text-gray-900">{profile.name}</p>
                                    <p className="text-sm text-gray-600">{profile.email}</p>
                                </div>
                            </div>
                            <div className="border-t border-gray-200 pt-4 space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-700">Age:</span>
                                    <span className="font-medium text-gray-900">{profile.age || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-700">Blood Group:</span>
                                    <span className="font-medium text-gray-900">{profile.bloodGroup || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-700">Address:</span>
                                    <span className="font-medium text-right text-gray-900 max-w-[50%] truncate">{profile.address || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-600">No profile data available.</p>
                    )}
                </Card>

                {/* Appointments Section */}
                <Card title="Upcoming Appointments" className="lg:col-span-2">
                    {appointmentsLoading ? (
                        <div className="animate-pulse space-y-4">
                            <div className="h-8 bg-gray-200 rounded w-full mb-4"></div>
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="h-12 bg-gray-200 rounded w-1/4"></div>
                                    <div className="h-12 bg-gray-200 rounded w-1/4"></div>
                                    <div className="h-12 bg-gray-200 rounded w-1/4"></div>
                                    <div className="h-12 bg-gray-200 rounded w-1/4"></div>
                                </div>
                            ))}
                        </div>
                    ) : appointments && appointments.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="border-b border-gray-200 text-sm font-semibold text-gray-700">
                                        <th className="pb-3">Doctor</th>
                                        <th className="pb-3">Date & Time</th>
                                        <th className="pb-3">Reason</th>
                                        <th className="pb-3">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {appointments.map((apt: any) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
                                        <tr key={apt._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="py-4">
                                                <p className="font-medium text-gray-900">{apt.doctorId?.name || 'Unknown'}</p>
                                                <p className="text-xs text-gray-600">{apt.doctorId?.specialization || 'General'}</p>
                                            </td>
                                            <td className="py-4">
                                                <p className="text-gray-900">{apt.date}</p>
                                                <p className="text-xs text-gray-600">{apt.time}</p>
                                            </td>
                                            <td className="py-4 text-gray-700">{apt.note || '-'}</td>
                                            <td className="py-4">
                                                <span className={`rounded-full px-3 py-1 text-xs font-medium ${apt.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
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
                        <p className="text-gray-600">No appointments found.</p>
                    )}
                </Card>
            </div>

            {/* Vitals Modal */}
            {isVitalsModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                        <h2 className="mb-4 text-xl font-bold text-gray-900">Update Health Vitals</h2>
                        <form onSubmit={handleUpdateVitals} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Heart Rate (bpm)</label>
                                <input
                                    type="text"
                                    value={vitalsForm.heartRate}
                                    onChange={(e) => setVitalsForm({ ...vitalsForm, heartRate: e.target.value })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white p-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="e.g., 72"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Blood Pressure</label>
                                <input
                                    type="text"
                                    value={vitalsForm.bloodPressure}
                                    onChange={(e) => setVitalsForm({ ...vitalsForm, bloodPressure: e.target.value })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white p-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="e.g., 120/80"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
                                <input
                                    type="text"
                                    value={vitalsForm.weight}
                                    onChange={(e) => setVitalsForm({ ...vitalsForm, weight: e.target.value })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white p-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="e.g., 70"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Blood Glucose (mg/dL)</label>
                                <input
                                    type="text"
                                    value={vitalsForm.bloodGlucose}
                                    onChange={(e) => setVitalsForm({ ...vitalsForm, bloodGlucose: e.target.value })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white p-2 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="e.g., 95"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <Button type="button" variant="outline" onClick={() => setIsVitalsModalOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={updateProfileMutation.isPending}>
                                    {updateProfileMutation.isPending ? 'Saving...' : 'Save Vitals'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
