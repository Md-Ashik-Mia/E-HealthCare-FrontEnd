'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPatientAppointments, getApprovedDoctors, cancelAppointment } from '@/services/patientService';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useState } from 'react';
import { toast } from 'react-toastify';

export default function PatientAppointmentsPage() {
    const queryClient = useQueryClient();
    const [cancellingId, setCancellingId] = useState<string | null>(null);

    // Fetch appointments
    const { data: appointments, isLoading: appointmentsLoading } = useQuery({
        queryKey: ['patientAppointments'],
        queryFn: getPatientAppointments,
    });

    // Fetch doctors to map names
    const { data: doctors, isLoading: doctorsLoading } = useQuery({
        queryKey: ['approvedDoctors'],
        queryFn: getApprovedDoctors,
    });

    // Cancel mutation
    const cancelMutation = useMutation({
        mutationFn: cancelAppointment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['patientAppointments'] });
            setCancellingId(null);
            toast.success('Appointment cancelled successfully');
        },
        onError: () => {
            setCancellingId(null);
            toast.error('Failed to cancel appointment');
        }
    });

    const handleCancel = async (appointmentId: string) => {
        if (confirm('Are you sure you want to cancel this appointment?')) {
            setCancellingId(appointmentId);
            cancelMutation.mutate(appointmentId);
        }
    };

    const isLoading = appointmentsLoading || doctorsLoading;

    // Helper to get doctor name
    const getDoctorName = (id: string) => {
        if (!doctors) return 'Unknown Doctor';
        const doctor = doctors.find((d: any) => (d._id || d.id) === id); // eslint-disable-line @typescript-eslint/no-explicit-any
        return doctor ? doctor.name : 'Unknown Doctor';
    };

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="text-center">
                    <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                    <p className="text-gray-600">Loading your appointments...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
                    <p className="mt-2 text-gray-600">Track your scheduled consultations</p>
                </div>
                <div className="rounded-lg bg-blue-50 px-4 py-2 text-blue-700">
                    <span className="font-bold">{appointments?.length || 0}</span> Upcoming
                </div>
            </div>

            <Card>
                {appointments && appointments.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b text-sm text-gray-500">
                                    <th className="pb-4 pl-4">Doctor</th>
                                    <th className="pb-4">Date & Time</th>
                                    <th className="pb-4">Note</th>
                                    <th className="pb-4">Payment</th>
                                    <th className="pb-4">Status</th>
                                    <th className="pb-4 pr-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {appointments.map((apt: any) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
                                    <tr key={apt._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="py-4 pl-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                                    👨‍⚕️
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">
                                                        {getDoctorName(apt.doctorId)}
                                                    </div>
                                                    <div className="text-xs text-gray-500">ID: {apt.doctorId.substring(0, 6)}...</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <div className="font-medium text-gray-900">{apt.date}</div>
                                            <div className="text-sm text-gray-500">{apt.time}</div>
                                        </td>
                                        <td className="py-4">
                                            <div className="max-w-xs truncate text-gray-600" title={apt.note}>
                                                {apt.note || '-'}
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${apt.paymentStatus === 'paid'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {apt.paymentStatus === 'paid' ? '✓ Paid' : 'Pending'}
                                            </span>
                                        </td>
                                        <td className="py-4">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${apt.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                                                apt.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                    apt.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {apt.status.charAt(0).toUpperCase() + apt.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="py-4 pr-4">
                                            {apt.status !== 'cancelled' && apt.status !== 'completed' && (
                                                <Button
                                                    className="text-sm px-3 py-1.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                                                    onClick={() => handleCancel(apt._id)}
                                                    disabled={cancellingId === apt._id}
                                                >
                                                    {cancellingId === apt._id ? 'Cancelling...' : 'Cancel'}
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="py-12 text-center">
                        <div className="mb-4 text-6xl">📅</div>
                        <h3 className="mb-2 text-xl font-semibold text-gray-900">No appointments yet</h3>
                        <p className="text-gray-600">Book your first consultation with our expert doctors.</p>
                        <Button
                            className="mt-6 bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => window.location.href = '/dashboard/patient/find-doctor'}
                        >
                            Find a Doctor
                        </Button>
                    </div>
                )}
            </Card>
        </div>
    );
}
