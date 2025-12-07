'use client';

import { useQuery } from '@tanstack/react-query';
import { getPatientPrescriptions } from '@/services/prescriptionService';
import { useSession } from 'next-auth/react';
import Card from '@/components/ui/Card';

export default function PatientPrescriptionsPage() {
    const { data: session } = useSession();
    const userId = session?.user?.id;

    const { data: prescriptions, isLoading } = useQuery({
        queryKey: ['patientPrescriptions', userId],
        queryFn: () => getPatientPrescriptions(userId!),
        enabled: !!userId,
    });

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="text-center">
                    <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                    <p className="text-gray-600">Loading prescriptions...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">My Prescriptions</h1>
                <p className="mt-2 text-gray-600">View all your prescriptions from doctors</p>
            </div>

            {prescriptions && prescriptions.length > 0 ? (
                <div className="grid gap-6">
                    {prescriptions.map((prescription: any) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
                        <Card key={prescription._id}>
                            <div className="space-y-4">
                                {/* Header */}
                                <div className="flex items-start justify-between border-b pb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Dr. {prescription.doctorId?.name || 'Unknown'}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {new Date(prescription.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                    <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                                        💊 Prescription
                                    </span>
                                </div>

                                {/* Diagnosis */}
                                <div>
                                    <h4 className="font-semibold text-gray-900">Diagnosis</h4>
                                    <p className="mt-1 text-gray-700">{prescription.diagnosis}</p>
                                </div>

                                {/* Medications */}
                                <div>
                                    <h4 className="font-semibold text-gray-900">Medications</h4>
                                    <div className="mt-2 space-y-3">
                                        {prescription.medications.map((med: any, index: number) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
                                            <div key={index} className="rounded-lg bg-gray-50 p-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <p className="font-medium text-gray-900">{med.name}</p>
                                                        <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                                                            <div>
                                                                <span className="text-gray-500">Dosage:</span>
                                                                <p className="font-medium text-gray-900">{med.dosage}</p>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-500">Frequency:</span>
                                                                <p className="font-medium text-gray-900">{med.frequency}</p>
                                                            </div>
                                                            <div>
                                                                <span className="text-gray-500">Duration:</span>
                                                                <p className="font-medium text-gray-900">{med.duration}</p>
                                                            </div>
                                                        </div>
                                                        {med.instructions && (
                                                            <p className="mt-2 text-sm text-gray-600">
                                                                <span className="font-medium">Instructions:</span> {med.instructions}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Notes */}
                                {prescription.notes && (
                                    <div>
                                        <h4 className="font-semibold text-gray-900">Doctor's Notes</h4>
                                        <p className="mt-1 text-gray-700">{prescription.notes}</p>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-2 border-t pt-4">
                                    <button
                                        onClick={() => window.print()}
                                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        🖨️ Print
                                    </button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card>
                    <div className="py-12 text-center">
                        <div className="mb-4 text-6xl">💊</div>
                        <h3 className="mb-2 text-xl font-semibold text-gray-900">No Prescriptions Yet</h3>
                        <p className="text-gray-600">Your prescriptions from doctors will appear here.</p>
                    </div>
                </Card>
            )}
        </div>
    );
}
