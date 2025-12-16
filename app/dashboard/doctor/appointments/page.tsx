'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDoctorAppointments, confirmAppointment, completeAppointment } from '@/services/doctorService';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useState } from 'react';
import { toast } from 'react-toastify';

export default function DoctorAppointmentsPage() {
    const queryClient = useQueryClient();
    const { data: appointments, isLoading } = useQuery({
        queryKey: ['doctorAppointments'],
        queryFn: getDoctorAppointments,
    });

    const [selectedAppointment, setSelectedAppointment] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any

    const confirmMutation = useMutation({
        mutationFn: confirmAppointment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['doctorAppointments'] });
            toast.success('Appointment confirmed successfully');
        },
        onError: (error: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
            toast.error('Failed to confirm: ' + (error.response?.data?.message || error.message));
        }
    });

    const completeMutation = useMutation({
        mutationFn: completeAppointment,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['doctorAppointments'] });
            toast.success('Appointment marked as completed');
        },
        onError: (error: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
            toast.error('Failed to complete: ' + (error.response?.data?.message || error.message));
        }
    });

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="text-center">
                    <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                    <p className="text-gray-600">Loading appointments...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
                    <p className="mt-2 text-gray-600">Manage your upcoming patient consultations</p>
                </div>
                <div className="rounded-lg bg-blue-50 px-4 py-2 text-blue-700">
                    <span className="font-bold">{appointments?.length || 0}</span> Total Appointments
                </div>
            </div>

            <Card>
                {appointments && appointments.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b text-sm text-gray-500">
                                    <th className="pb-4 pl-4">Patient Details</th>
                                    <th className="pb-4">Date & Time</th>
                                    <th className="pb-4">Reason/Note</th>
                                    <th className="pb-4">Status</th>
                                    <th className="pb-4 pr-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {appointments.map((apt: any) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
                                    <tr key={apt._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="py-4 pl-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 font-bold">
                                                    P
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">
                                                        {apt.patientId?.name || apt.patientName || 'Unknown'}
                                                    </div>
                                                    <div className="text-xs font-mono text-gray-500 bg-gray-100 px-1 rounded inline-block">
                                                        {(apt.patientId?._id || apt.patientId || '').toString().substring(0, 8)}...
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <div className="font-medium text-gray-900">{apt.date}</div>
                                            <div className="text-sm text-gray-500">{apt.time}</div>
                                        </td>
                                        <td className="py-4">
                                            <div className="max-w-xs text-sm text-gray-600">
                                                {apt.note ? (
                                                    <span title={apt.note}>{apt.note.length > 30 ? apt.note.substring(0, 30) + '...' : apt.note}</span>
                                                ) : (
                                                    <span className="text-gray-400 italic">No notes</span>
                                                )}
                                            </div>
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
                                            <div className="flex gap-2">
                                                {apt.status === 'pending' && (
                                                    <Button
                                                        size="sm"
                                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                                        onClick={() => confirmMutation.mutate(apt._id)}
                                                        disabled={confirmMutation.isPending}
                                                    >
                                                        {confirmMutation.isPending ? '...' : 'Confirm'}
                                                    </Button>
                                                )}
                                                {(apt.status === 'pending' || apt.status === 'confirmed') && (
                                                    <Button
                                                        size="sm"
                                                        className="bg-green-600 hover:bg-green-700 text-white"
                                                        onClick={() => completeMutation.mutate(apt._id)}
                                                        disabled={completeMutation.isPending}
                                                    >
                                                        {completeMutation.isPending ? '...' : 'Take Now'}
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setSelectedAppointment(apt)}
                                                >
                                                    Details
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="py-12 text-center">
                        <div className="mb-4 text-6xl">📅</div>
                        <h3 className="mb-2 text-xl font-semibold text-gray-900">No appointments found</h3>
                        <p className="text-gray-600">You don&apos;t have any scheduled appointments yet.</p>
                    </div>
                )}
            </Card>

            {/* Appointment Details Modal */}
            {selectedAppointment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Appointment Details</h2>
                            <button
                                onClick={() => setSelectedAppointment(null)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="rounded-lg bg-gray-50 p-4">
                                <p className="text-sm text-gray-500">Patient</p>
                                <p className="font-medium text-gray-900">{selectedAppointment.patientId?.name || 'Unknown'}</p>
                                <p className="text-xs font-mono text-gray-500 mt-1">ID: {selectedAppointment.patientId?._id || selectedAppointment.patientId}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Date</p>
                                    <p className="font-medium text-gray-900">{selectedAppointment.date}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Time</p>
                                    <p className="font-medium text-gray-900">{selectedAppointment.time}</p>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">Note / Reason</p>
                                <p className="mt-1 text-gray-900">{selectedAppointment.note || 'No notes provided.'}</p>
                            </div>

                            <div className="flex items-center justify-between border-t pt-4">
                                <div>
                                    <p className="text-sm text-gray-500">Status</p>
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${selectedAppointment.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                                        selectedAppointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                                            selectedAppointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {selectedAppointment.status.charAt(0).toUpperCase() + selectedAppointment.status.slice(1)}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Payment</p>
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${selectedAppointment.paymentStatus === 'paid'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {selectedAppointment.paymentStatus === 'paid' ? '✓ Paid' : 'Pending'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <Button onClick={() => setSelectedAppointment(null)}>
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
