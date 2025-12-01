'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { getDoctorSchedule, bookAppointment } from '@/services/patientService';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function SchedulePage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const queryClient = useQueryClient();

    const doctorId = searchParams.get('doctorId');
    const doctorName = searchParams.get('doctorName');
    const specialty = searchParams.get('specialty');
    const fee = searchParams.get('fee');

    const [selectedSlot, setSelectedSlot] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
    const [showToast, setShowToast] = useState(false);
    const [note, setNote] = useState('');

    const { data: schedules, isLoading } = useQuery({
        queryKey: ['doctorSchedule', doctorId],
        queryFn: () => getDoctorSchedule(doctorId!),
        enabled: !!doctorId,
    });

    const bookMutation = useMutation({
        mutationFn: (data: any) => bookAppointment(data), // eslint-disable-line @typescript-eslint/no-explicit-any
        onSuccess: () => {
            setShowToast(true);
            setSelectedSlot(null);
            setNote('');
            queryClient.invalidateQueries({ queryKey: ['doctorSchedule', doctorId] });

            setTimeout(() => {
                setShowToast(false);
                router.push('/dashboard/patient/appointments');
            }, 3000);
        },
    });

    const handleBookAppointment = () => {
        if (!selectedSlot) return;

        bookMutation.mutate({
            doctorId,
            scheduleId: selectedSlot._id,
            date: selectedSlot.date || new Date().toISOString().split('T')[0],
            time: selectedSlot.startTime,
            note,
        });
    };

    const getDayName = (dayOfWeek: number) => {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days[dayOfWeek];
    };

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="text-center">
                    <div className="mb-4 inline-block h-16 w-16 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                    <p className="mt-4 text-lg font-semibold text-gray-700">Loading available slots...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="animate-fade-in">
                <button
                    onClick={() => router.back()}
                    className="mb-4 flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors font-semibold"
                >
                    <span>←</span>
                    <span>Back to Doctors</span>
                </button>

                <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white shadow-xl">
                    <div className="flex items-center gap-4">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 text-4xl backdrop-blur-sm">
                            👨‍⚕️
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">{doctorName}</h1>
                            <p className="mt-1 text-blue-100">{specialty}</p>
                            <p className="mt-2 text-xl font-semibold">Consultation Fee: ${fee}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Available Slots */}
            <div className="space-y-8">
                <div>
                    <h2 className="mb-6 text-2xl font-bold text-gray-900">Available Time Slots</h2>

                    {schedules && schedules.length > 0 ? (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {schedules.map((schedule: any) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
                                <Card
                                    key={schedule._id}
                                    className="transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
                                >
                                    <div className="space-y-4">
                                        {/* Day and Time */}
                                        <div>
                                            <div className="flex items-center gap-2 text-xl font-bold text-gray-900">
                                                <span>📅</span>
                                                <span>{getDayName(schedule.dayOfWeek)}</span>
                                            </div>
                                            <div className="mt-3 flex items-center gap-2 text-lg text-blue-600">
                                                <span>🕐</span>
                                                <span className="font-semibold">{schedule.startTime} - {schedule.endTime}</span>
                                            </div>
                                            <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                                                <span>⏱️</span>
                                                <span>{schedule.slotDurationMinutes} minutes</span>
                                            </div>
                                        </div>

                                        {/* Consultation Fee */}
                                        <div className="rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 p-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-gray-700">Fee</span>
                                                <span className="text-xl font-bold text-green-600">${fee}</span>
                                            </div>
                                        </div>

                                        {/* Book Button */}
                                        <Button
                                            onClick={() => {
                                                setSelectedSlot(schedule);
                                                setNote('');
                                                if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                                                    setTimeout(() => {
                                                        document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' });
                                                    }, 100);
                                                }
                                            }}
                                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3"
                                        >
                                            Select This Slot
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="py-12 text-center">
                            <div className="mb-4 text-6xl">📅</div>
                            <h3 className="mb-2 text-xl font-semibold text-gray-900">No Available Slots</h3>
                            <p className="text-gray-600">This doctor has no available time slots at the moment.</p>
                        </div>
                    )}
                </div>

                {/* Booking Confirmation Form */}
                {selectedSlot && (
                    <div id="booking-form" className="mt-8">
                        <Card className="animate-fade-in-up border-2 border-blue-500">
                            <div className="space-y-6">
                                <div className="flex items-center justify-between border-b pb-4">
                                    <h3 className="text-2xl font-bold text-gray-900">Confirm Your Booking</h3>
                                    <button
                                        onClick={() => setSelectedSlot(null)}
                                        className="text-gray-400 hover:text-gray-600 text-2xl"
                                    >
                                        ✕
                                    </button>
                                </div>

                                {/* Selected Slot Info */}
                                <div className="rounded-xl bg-gradient-to-r from-blue-50 to-purple-50 p-6">
                                    <p className="text-sm font-medium text-gray-600">Selected Time Slot</p>
                                    <div className="mt-3 space-y-2">
                                        <p className="text-2xl font-bold text-gray-900">
                                            {getDayName(selectedSlot.dayOfWeek)}
                                        </p>
                                        <p className="text-xl font-semibold text-blue-600">
                                            {selectedSlot.startTime} - {selectedSlot.endTime}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Duration: {selectedSlot.slotDurationMinutes} minutes
                                        </p>
                                    </div>
                                </div>

                                {/* Note Field */}
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        Add a Note (Optional)
                                    </label>
                                    <textarea
                                        className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                                        rows={4}
                                        placeholder="Describe your symptoms or reason for visit..."
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                    />
                                </div>

                                {/* Total Fee */}
                                <div className="rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 p-6">
                                    <div className="flex items-center justify-between">
                                        <span className="text-lg font-semibold text-gray-700">Total Consultation Fee</span>
                                        <span className="text-3xl font-bold text-green-600">${fee}</span>
                                    </div>
                                </div>

                                {/* Confirm Button */}
                                <Button
                                    onClick={handleBookAppointment}
                                    disabled={bookMutation.isPending}
                                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 text-lg"
                                >
                                    {bookMutation.isPending ? (
                                        <span className="flex items-center justify-center gap-3">
                                            <div className="h-6 w-6 animate-spin rounded-full border-3 border-white border-t-transparent"></div>
                                            Confirming Appointment...
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center gap-2">
                                            <span>✓</span>
                                            Confirm Appointment
                                        </span>
                                    )}
                                </Button>

                                <p className="text-center text-sm text-gray-500">
                                    The doctor will contact you with confirmation details
                                </p>
                            </div>
                        </Card>
                    </div>
                )}
            </div>

            {/* Success Toast */}
            {showToast && (
                <div className="fixed bottom-8 right-8 z-50 animate-slide-in-bottom">
                    <div className="rounded-2xl bg-white p-6 shadow-2xl border-l-4 border-green-500">
                        <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 animate-bounce">
                                <span className="text-2xl">✓</span>
                            </div>
                            <div className="flex-1">
                                <h4 className="text-lg font-bold text-gray-900">Appointment Confirmed!</h4>
                                <p className="mt-1 text-gray-600">
                                    Your appointment has been booked successfully.
                                </p>
                                <p className="mt-2 text-sm text-blue-600">
                                    The doctor will contact you soon with confirmation details.
                                </p>
                            </div>
                            <button
                                onClick={() => setShowToast(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CSS Animations */}
            <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slide-in-bottom {
          from {
            opacity: 0;
            transform: translateY(100px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }
        
        .animate-slide-in-bottom {
          animation: slide-in-bottom 0.5s ease-out;
        }
      `}</style>
        </div>
    );
}
