'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDoctorSchedule, createSchedule, deleteSchedule } from '@/services/doctorService';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { toast } from 'react-toastify';

export default function DoctorSchedulePage() {
    const queryClient = useQueryClient();
    const [isAdding, setIsAdding] = useState(false);
    const [formData, setFormData] = useState({
        dayOfWeek: 'Monday',
        startTime: '09:00',
        endTime: '17:00',
        slotDurationMinutes: 30,
    });

    const { data: schedules, isLoading } = useQuery({
        queryKey: ['doctorSchedule'],
        queryFn: getDoctorSchedule,
    });

    const createMutation = useMutation({
        mutationFn: createSchedule,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['doctorSchedule'] });
            setIsAdding(false);
            toast.success('Schedule created successfully');
        },
        onError: (error: any) => {
            toast.error('Failed to create schedule: ' + (error.response?.data?.message || error.message));
        }
    });

    const deleteMutation = useMutation({
        mutationFn: deleteSchedule,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['doctorSchedule'] });
            toast.success('Schedule deleted successfully');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Convert day name to number (1 = Monday, 7 = Sunday)
        const dayMap: { [key: string]: number } = {
            'Monday': 1,
            'Tuesday': 2,
            'Wednesday': 3,
            'Thursday': 4,
            'Friday': 5,
            'Saturday': 6,
            'Sunday': 7
        };

        createMutation.mutate({
            dayOfWeek: dayMap[formData.dayOfWeek],
            startTime: formData.startTime,
            endTime: formData.endTime,
            slotDurationMinutes: formData.slotDurationMinutes
        });
    };

    // Convert number to day name for display
    const getDayName = (dayNum: number): string => {
        const days = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        return days[dayNum] || 'Unknown';
    };

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    if (isLoading) return <div className="p-8 text-center">Loading schedules...</div>;

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Schedule</h1>
                    <p className="text-gray-600">Manage your availability for appointments</p>
                </div>
                <Button onClick={() => setIsAdding(!isAdding)}>
                    {isAdding ? 'Cancel' : 'Add New Schedule'}
                </Button>
            </div>

            {isAdding && (
                <Card title="Add New Schedule">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Day</label>
                                <select
                                    value={formData.dayOfWeek}
                                    onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                >
                                    {days.map(day => <option key={day} value={day}>{day}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Start Time</label>
                                <input
                                    type="time"
                                    value={formData.startTime}
                                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">End Time</label>
                                <input
                                    type="time"
                                    value={formData.endTime}
                                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Slot Duration (mins)</label>
                                <input
                                    type="number"
                                    value={formData.slotDurationMinutes}
                                    onChange={(e) => setFormData({ ...formData, slotDurationMinutes: parseInt(e.target.value) })}
                                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <Button type="submit" disabled={createMutation.isPending}>
                                {createMutation.isPending ? 'Creating...' : 'Create Schedule'}
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {schedules && schedules.length > 0 ? (
                    schedules.map((item: any) => (
                        <Card key={item._id || item.id} className="relative">
                            <button
                                onClick={() => {
                                    if (confirm('Are you sure you want to delete this schedule?')) {
                                        deleteMutation.mutate(item._id || item.id);
                                    }
                                }}
                                className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
                                title="Delete Schedule"
                            >
                                🗑️
                            </button>
                            <h3 className="mb-4 text-xl font-semibold text-gray-900">{getDayName(item.dayOfWeek)}</h3>
                            <div className="space-y-2">
                                <div className="rounded-lg bg-blue-50 p-3 text-center text-lg font-medium text-blue-900">
                                    {item.startTime} - {item.endTime}
                                </div>
                                <p className="text-center text-sm text-gray-500">
                                    {item.slotDurationMinutes} min slots
                                </p>
                            </div>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full py-12 text-center text-gray-500">
                        No schedules found. Add one to start accepting appointments.
                    </div>
                )}
            </div>
        </div>
    );
}
