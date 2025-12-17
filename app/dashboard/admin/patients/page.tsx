'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAdminPatients, getPatientDetails } from '@/services/adminService';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function AdminPatientsPage() {
    const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

    const { data: patients, isLoading } = useQuery({
        queryKey: ['adminPatients'],
        queryFn: getAdminPatients,
    });

    const { data: patientDetails, isLoading: isLoadingDetails } = useQuery({
        queryKey: ['adminPatientDetails', selectedPatientId],
        queryFn: () => getPatientDetails(selectedPatientId!),
        enabled: !!selectedPatientId,
    });

    const handleCloseModal = () => setSelectedPatientId(null);

    if (isLoading) return (
        <div className="flex h-full items-center justify-center">
            <div className="text-center">
                <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                <p className="text-gray-600">Loading patients...</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 relative">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">Patients Management</h1>
                <div className="rounded-lg bg-blue-50 px-4 py-2 text-blue-700">
                    <span className="font-bold">{patients?.length || 0}</span> Total Patients
                </div>
            </div>

            <Card>
                {patients && patients.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b text-sm text-gray-500">
                                    <th className="pb-4 pl-4">Name</th>
                                    <th className="pb-4">Age</th>
                                    <th className="pb-4">Last Visit</th>
                                    <th className="pb-4">Assigned Doctor</th>
                                    <th className="pb-4 pr-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {patients.map((patient: any) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
                                    <tr key={patient._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="py-4 pl-4">
                                            <div className="font-medium text-gray-900">{patient.name}</div>
                                            <div className="text-xs text-gray-500">{patient.email}</div>
                                        </td>
                                        <td className="py-4">{patient.age}</td>
                                        <td className="py-4">{patient.lastVisit !== 'N/A' ? new Date(patient.lastVisit).toLocaleDateString() : 'N/A'}</td>
                                        <td className="py-4">
                                            {patient.assignedDoctor !== 'None' ? (
                                                <span className="text-blue-600 font-medium">{patient.assignedDoctor}</span>
                                            ) : (
                                                <span className="text-gray-400 italic">None</span>
                                            )}
                                        </td>
                                        <td className="py-4 pr-4">
                                            <button
                                                onClick={() => setSelectedPatientId(patient._id)}
                                                className="text-blue-600 hover:underline"
                                            >
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="py-12 text-center">
                        <div className="mb-4 text-6xl">👥</div>
                        <h3 className="mb-2 text-xl font-semibold text-gray-900">No patients found</h3>
                        <p className="text-gray-600">There are no registered patients yet.</p>
                    </div>
                )}
            </Card>

            {/* Patient Details Modal */}
            {selectedPatientId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Patient Details</h2>
                            <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
                                ✕
                            </button>
                        </div>

                        {isLoadingDetails ? (
                            <div className="flex justify-center p-8">
                                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                            </div>
                        ) : patientDetails ? (
                            <div className="space-y-6">
                                {/* Basic Info */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm text-gray-500">Name</label>
                                            <p className="font-medium">{patientDetails.user.name}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-500">Email</label>
                                            <p className="font-medium">{patientDetails.user.email}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-500">Age</label>
                                            <p className="font-medium">{patientDetails.profile?.age || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm text-gray-500">Blood Type</label>
                                            <p className="font-medium">{patientDetails.medicalRecord?.bloodType || 'Unknown'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Prescriptions & History */}
                                <div>
                                    <h3 className="text-lg font-semibold mb-3">Recent Prescriptions</h3>
                                    {patientDetails.prescriptions && patientDetails.prescriptions.length > 0 ? (
                                        <div className="space-y-4">
                                            {patientDetails.prescriptions.map((script: any) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
                                                <div key={script._id} className="border rounded-lg p-4">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <p className="font-medium text-blue-600">Dr. {script.doctorId?.name}</p>
                                                            <p className="text-sm text-gray-500">{new Date(script.createdAt).toLocaleDateString()}</p>
                                                        </div>
                                                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                                            {script.diagnosis}
                                                        </span>
                                                    </div>

                                                    {/* Diagnosis & Suggestions */}
                                                    <div className="mb-3 bg-yellow-50 p-3 rounded text-sm">
                                                        <p><span className="font-semibold">Diagnosis:</span> {script.diagnosis}</p>
                                                        {script.notes && <p className="mt-1"><span className="font-semibold">Suggestions/Notes:</span> {script.notes}</p>}
                                                    </div>

                                                    <div className="space-y-2">
                                                        <p className="text-xs uppercase text-gray-500 font-semibold">Medications</p>
                                                        {script.medications.map((med: any, idx: number) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
                                                            <div key={idx} className="text-sm bg-gray-50 p-2 rounded">
                                                                <span className="font-medium">{med.name}</span> - {med.dosage} ({med.frequency})
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-500 italic">No prescription history found.</p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <p className="text-red-500 text-center">Failed to load details.</p>
                        )}

                        <div className="mt-6 flex justify-end">
                            <Button onClick={handleCloseModal} variant="outline">Close</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
