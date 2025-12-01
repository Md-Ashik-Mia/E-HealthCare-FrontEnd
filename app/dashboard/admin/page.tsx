'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdminDashboardStats, getPendingDoctors, approveDoctor, getAllUsers } from '@/services/adminService';
import { useSession } from 'next-auth/react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { toast } from 'react-toastify';

export default function AdminDashboard() {
    const { data: session } = useSession();
    const queryClient = useQueryClient();

    const { data: stats, isLoading: statsLoading } = useQuery({
        queryKey: ['adminStats'],
        queryFn: getAdminDashboardStats,
        enabled: !!session,
    });

    const { data: pendingDoctors, isLoading: doctorsLoading } = useQuery({
        queryKey: ['pendingDoctors'],
        queryFn: getPendingDoctors,
        enabled: !!session,
    });

    const { data: users, isLoading: usersLoading } = useQuery({
        queryKey: ['allUsers'],
        queryFn: getAllUsers,
        enabled: !!session,
    });

    const approveMutation = useMutation({
        mutationFn: approveDoctor,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pendingDoctors'] });
            queryClient.invalidateQueries({ queryKey: ['allUsers'] }); // Refresh user list too
            toast.success('Doctor approved successfully');
        },
    });

    if (statsLoading || doctorsLoading || usersLoading) return (
        <div className="flex h-full items-center justify-center">
            <div className="text-center">
                <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                <p className="text-gray-600">Loading dashboard...</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600">Welcome back, Admin {session?.user?.name}</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                <Card>
                    <p className="text-sm text-gray-500">Total Revenue</p>
                    <p className="text-2xl font-bold text-green-600">{stats?.revenue || '$0'}</p>
                </Card>
                <Card>
                    <p className="text-sm text-gray-500">Total Patients</p>
                    <p className="text-2xl font-bold">{stats?.totalPatients || 0}</p>
                </Card>
                <Card>
                    <p className="text-sm text-gray-500">Total Doctors</p>
                    <p className="text-2xl font-bold">{stats?.totalDoctors || 0}</p>
                </Card>
                <Card>
                    <p className="text-sm text-gray-500">Active Appointments</p>
                    <p className="text-2xl font-bold">{stats?.activeAppointments || 0}</p>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                {/* Pending Approvals */}
                <Card title="Pending Doctor Approvals" className="lg:col-span-2">
                    {pendingDoctors && Array.isArray(pendingDoctors) && pendingDoctors.length > 0 ? (
                        <div className="space-y-4">
                            {pendingDoctors.map((doc: any) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
                                <div key={doc.id || doc._id} className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-gray-50">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">👨‍⚕️</div>
                                        <div>
                                            <p className="font-semibold">{doc.name}</p>
                                            <p className="text-sm text-gray-500">{doc.email} • {doc.specialization}</p>
                                            <p className="text-xs text-gray-400">Applied: {doc.appliedDate || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        onClick={() => approveMutation.mutate(doc.id || doc._id)}
                                        disabled={approveMutation.isPending}
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        {approveMutation.isPending ? 'Approving...' : 'Approve'}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500">No pending approvals.</p>
                    )}
                </Card>

                {/* Quick Actions */}
                <Card title="Quick Actions">
                    <div className="space-y-3">
                        <Button variant="outline" className="w-full justify-start">Generate Reports</Button>
                        <Button variant="outline" className="w-full justify-start" onClick={() => window.location.href = '/dashboard/admin/doctors'}>Manage Doctors</Button>
                        <Button variant="outline" className="w-full justify-start">System Settings</Button>
                    </div>
                </Card>
            </div>

            {/* All Users Table */}
            <Card title="All Users">
                {users && users.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b text-sm text-gray-500">
                                    <th className="pb-3 pl-4">Name</th>
                                    <th className="pb-3">Email</th>
                                    <th className="pb-3">Role</th>
                                    <th className="pb-3">Status</th>
                                    <th className="pb-3">Joined Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {users.map((user: any) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
                                    <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="py-4 pl-4 font-medium text-gray-900">{user.name}</td>
                                        <td className="py-4 text-gray-600">{user.email}</td>
                                        <td className="py-4">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                                user.role === 'doctor' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                            </span>
                                        </td>
                                        <td className="py-4">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                {user.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="py-4 text-gray-500">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-gray-500 py-4 text-center">No users found.</p>
                )}
            </Card>
        </div>
    );
}
