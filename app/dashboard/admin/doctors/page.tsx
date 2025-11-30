'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPendingDoctors, approveDoctor, rejectDoctor } from '@/services/adminService';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { toast } from 'react-toastify';

export default function AdminDoctorsPage() {
    const queryClient = useQueryClient();

    const { data: pendingDoctors, isLoading } = useQuery({
        queryKey: ['pendingDoctors'],
        queryFn: getPendingDoctors,
    });

    const approveMutation = useMutation({
        mutationFn: approveDoctor,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pendingDoctors'] });
            toast.success('Doctor approved successfully');
        },
    });

    const rejectMutation = useMutation({
        mutationFn: rejectDoctor,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pendingDoctors'] });
            toast.success('Doctor rejected successfully');
        },
    });

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="text-center">
                    <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                    <p className="text-gray-600">Loading doctors...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Doctors Management</h1>
                    <p className="mt-2 text-gray-600">Review and manage doctor applications</p>
                </div>
            </div>

            <Card title="Pending Approvals">
                {pendingDoctors && pendingDoctors.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b text-sm text-gray-500">
                                    <th className="pb-4 pl-4">Doctor Name</th>
                                    <th className="pb-4">Email</th>
                                    <th className="pb-4">Specialization</th>
                                    <th className="pb-4">Status</th>
                                    <th className="pb-4">Applied Date</th>
                                    <th className="pb-4 pr-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {pendingDoctors.map((doctor: any) => (
                                    <tr key={doctor.id || doctor._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="py-4 pl-4 font-medium text-gray-900">{doctor.name}</td>
                                        <td className="py-4 text-gray-600">{doctor.email}</td>
                                        <td className="py-4 text-gray-600">{doctor.specialization || 'N/A'}</td>
                                        <td className="py-4">
                                            <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                                                Pending
                                            </span>
                                        </td>
                                        <td className="py-4 text-gray-500">
                                            {doctor.appliedDate || new Date().toLocaleDateString()}
                                        </td>
                                        <td className="py-4 pr-4">
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    className="bg-green-600 hover:bg-green-700 text-white"
                                                    onClick={() => approveMutation.mutate(doctor.id || doctor._id)}
                                                    disabled={approveMutation.isPending || rejectMutation.isPending}
                                                >
                                                    {approveMutation.isPending ? '...' : 'Approve'}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    className="bg-red-600 hover:bg-red-700 text-white border-none"
                                                    onClick={() => {
                                                        if (confirm('Are you sure you want to reject this doctor?')) {
                                                            rejectMutation.mutate(doctor.id || doctor._id);
                                                        }
                                                    }}
                                                    disabled={approveMutation.isPending || rejectMutation.isPending}
                                                >
                                                    {rejectMutation.isPending ? '...' : 'Reject'}
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
                        <div className="mb-4 text-6xl">✅</div>
                        <h3 className="mb-2 text-xl font-semibold text-gray-900">All Caught Up!</h3>
                        <p className="text-gray-600">There are no pending doctor applications at the moment.</p>
                    </div>
                )}
            </Card>
        </div>
    );
}
