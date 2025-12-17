'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addPatientPrivateNote, getDoctorPatients, getPatientDetails } from '@/services/doctorService';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { toast } from 'react-toastify';

export default function DoctorPatientsPage() {
    const queryClient = useQueryClient();
    const { data: patients, isLoading } = useQuery({
        queryKey: ['doctorPatients'],
        queryFn: getDoctorPatients,
    });

    const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'details' | 'history' | 'prescriptions'>('details');
    const [privateNote, setPrivateNote] = useState('');

    // Fetch full details when a patient is selected
    const { data: fullRecord, isLoading: isLoadingDetails } = useQuery({
        queryKey: ['patientDetails', selectedPatientId],
        queryFn: () => getPatientDetails(selectedPatientId!),
        enabled: !!selectedPatientId,
    });

    const addNoteMutation = useMutation({
        mutationFn: async (content: string) => {
            if (!selectedPatientId) throw new Error('No patient selected');
            return addPatientPrivateNote(selectedPatientId, content);
        },
        onSuccess: async () => {
            setPrivateNote('');
            await queryClient.invalidateQueries({ queryKey: ['patientDetails', selectedPatientId] });
            toast.success('Private note added');
        },
        onError: () => {
            toast.error('Failed to add private note');
        },
    });

    const closeInitialModal = () => {
        setSelectedPatientId(null);
        setActiveTab('details');
        setPrivateNote('');
    };

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="text-center">
                    <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                    <p className="text-gray-600">Loading patients...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Patients</h1>

            {patients && patients.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {patients.map((patient: any) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
                        <Card key={patient._id}>
                            <div className="mb-4 flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-xl">
                                    👤
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">{patient.name}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Email: {patient.email}</p>
                                </div>
                            </div>
                            <div className="space-y-2 text-sm border-t dark:border-gray-700 pt-3">
                                <p className="text-gray-600 dark:text-gray-300">Last Visit: <span className="font-medium text-gray-900 dark:text-white">{patient.lastVisit}</span></p>
                                <p className="text-gray-600 dark:text-gray-300">Condition: <span className="font-medium text-gray-900 dark:text-white">{patient.condition}</span></p>
                            </div>
                            <button
                                onClick={() => setSelectedPatientId(patient._id)}
                                className="mt-4 text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
                            >
                                View Full Record
                            </button>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card>
                    <div className="py-12 text-center">
                        <div className="mb-4 text-6xl">👥</div>
                        <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">No Patients Found</h3>
                        <p className="text-gray-600 dark:text-gray-300">Patients will appear here once they book appointments with you.</p>
                    </div>
                </Card>
            )}

            {/* Full Record Modal */}
            {selectedPatientId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl bg-white dark:bg-gray-800 p-6 shadow-xl flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Patient Record</h2>
                            <button
                                onClick={closeInitialModal}
                                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                                ✕
                            </button>
                        </div>

                        {isLoadingDetails ? (
                            <div className="flex-1 flex items-center justify-center py-12">
                                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                            </div>
                        ) : fullRecord ? (
                            <div className="space-y-6">
                                {/* Header Info */}
                                <div className="flex items-center gap-4 border-b pb-6 dark:border-gray-700">
                                    <div className="h-20 w-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-3xl">👤</div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{fullRecord.name}</h3>
                                        <p className="text-gray-600 dark:text-gray-400">{fullRecord.email}</p>
                                        <div className="mt-2 flex gap-4 text-sm text-gray-600 dark:text-gray-300">
                                            <span>Age: <span className="font-semibold text-gray-900 dark:text-white">{fullRecord.profile?.age || 'N/A'}</span></span>
                                            <span>Gender: <span className="font-semibold text-gray-900 dark:text-white">{fullRecord.profile?.gender || 'N/A'}</span></span>
                                            <span>Blood: <span className="font-semibold text-gray-900 dark:text-white">{fullRecord.profile?.bloodGroup || 'N/A'}</span></span>
                                        </div>
                                    </div>
                                </div>

                                {/* Tabs */}
                                <div className="flex border-b border-gray-200 dark:border-gray-700">
                                    <button
                                        onClick={() => setActiveTab('details')}
                                        className={`px-4 py-2 font-medium text-sm border-b-2 ${activeTab === 'details'
                                            ? 'border-blue-600 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                            }`}
                                    >
                                        Vitals & Details
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('prescriptions')}
                                        className={`px-4 py-2 font-medium text-sm border-b-2 ${activeTab === 'prescriptions'
                                            ? 'border-blue-600 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                            }`}
                                    >
                                        Prescriptions History
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('history')}
                                        className={`px-4 py-2 font-medium text-sm border-b-2 ${activeTab === 'history'
                                            ? 'border-blue-600 text-blue-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                            }`}
                                    >
                                        Medical History
                                    </button>
                                </div>

                                {/* Tab Content */}
                                <div className="min-h-[300px]">
                                    {activeTab === 'details' && (
                                        <div className="space-y-6">
                                            <div>
                                                <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Current Vitals</h4>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 border border-red-100 dark:border-red-800">
                                                        <p className="text-xs text-red-600 dark:text-red-400 font-medium uppercase">Heart Rate</p>
                                                        <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                                                            {fullRecord.healthMetrics?.heartRate || 'N/A'} <span className="text-sm font-normal text-gray-500">bpm</span>
                                                        </p>
                                                    </div>
                                                    <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-4 border border-blue-100 dark:border-blue-800">
                                                        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium uppercase">Blood Pressure</p>
                                                        <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                                                            {fullRecord.healthMetrics?.bloodPressure || 'N/A'}
                                                        </p>
                                                    </div>
                                                    <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-4 border border-green-100 dark:border-green-800">
                                                        <p className="text-xs text-green-600 dark:text-green-400 font-medium uppercase">Weight</p>
                                                        <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                                                            {fullRecord.healthMetrics?.weight || 'N/A'} <span className="text-sm font-normal text-gray-500">kg</span>
                                                        </p>
                                                    </div>
                                                    <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 p-4 border border-yellow-100 dark:border-yellow-800">
                                                        <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium uppercase">Glucose</p>
                                                        <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                                                            {fullRecord.healthMetrics?.bloodGlucose || 'N/A'} <span className="text-sm font-normal text-gray-500">mg/dL</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div>
                                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Emergency Contact</h4>
                                                    <div className="rounded-lg border p-4 bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700">
                                                        <p className="text-sm text-gray-600 dark:text-gray-300"><span className="font-medium">Name:</span> {fullRecord.emergencyContact?.name || 'N/A'}</p>
                                                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1"><span className="font-medium">Relation:</span> {fullRecord.emergencyContact?.relation || 'N/A'}</p>
                                                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1"><span className="font-medium">Phone:</span> {fullRecord.emergencyContact?.phone || 'N/A'}</p>
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Address</h4>
                                                    <div className="rounded-lg border p-4 bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700">
                                                        <p className="text-sm text-gray-600 dark:text-gray-300">{fullRecord.profile?.address || 'No address provided.'}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Doctor-only private notes */}
                                            <div>
                                                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Private Notes (Doctor only)</h4>
                                                <div className="rounded-lg border p-4 bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700 space-y-4">
                                                    <div className="space-y-3">
                                                        {fullRecord.privateNotes && fullRecord.privateNotes.length > 0 ? (
                                                            fullRecord.privateNotes.map((note: any) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
                                                                <div key={note._id} className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3">
                                                                    <p className="text-xs text-gray-500">
                                                                        {new Date(note.createdAt).toLocaleString()}
                                                                    </p>
                                                                    <p className="mt-1 text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap">
                                                                        {note.content}
                                                                    </p>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <p className="text-sm text-gray-500">No private notes yet.</p>
                                                        )}
                                                    </div>

                                                    <div className="border-t pt-4 dark:border-gray-700">
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            Add a private note
                                                        </label>
                                                        <textarea
                                                            value={privateNote}
                                                            onChange={(e) => setPrivateNote(e.target.value)}
                                                            rows={3}
                                                            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-900"
                                                            placeholder="Write your note here (only visible to you)..."
                                                        />
                                                        <div className="mt-3 flex justify-end">
                                                            <Button
                                                                onClick={() => addNoteMutation.mutate(privateNote)}
                                                                disabled={addNoteMutation.isPending || !privateNote.trim()}
                                                            >
                                                                {addNoteMutation.isPending ? 'Saving...' : 'Add Note'}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'prescriptions' && (
                                        <div className="space-y-4">
                                            {fullRecord.prescriptions && fullRecord.prescriptions.length > 0 ? (
                                                fullRecord.prescriptions.map((script: any) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
                                                    <div key={script._id} className="border rounded-lg p-4 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div>
                                                                <p className="font-semibold text-gray-900 dark:text-white text-lg">Dr. {script.doctorId?.name}</p>
                                                                <p className="text-xs text-gray-500">{new Date(script.createdAt).toLocaleDateString()}</p>
                                                            </div>
                                                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Prescription</span>
                                                        </div>
                                                        <div className="mb-3">
                                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Diagnosis:</p>
                                                            <p className="text-gray-600 dark:text-gray-400">{script.diagnosis}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Medications:</p>
                                                            <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-400 space-y-1">
                                                                {script.medications.map((med: any, idx: number) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
                                                                    <li key={idx}>{med.name} - {med.dosage} ({med.frequency} for {med.duration})</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                        {script.notes && (
                                                            <div className="mt-3 bg-yellow-50 dark:bg-yellow-900/10 p-2 rounded text-sm text-yellow-800 dark:text-yellow-200">
                                                                Note: {script.notes}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-center text-gray-500 py-8">No prescription history found.</p>
                                            )}
                                        </div>
                                    )}

                                    {activeTab === 'history' && (
                                        <div className="space-y-6">
                                            {fullRecord.medicalRecords && fullRecord.medicalRecords.length > 0 ? (
                                                fullRecord.medicalRecords.map((record: any) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
                                                    <div key={record._id} className="space-y-4">
                                                        {/* Render medical record details here - reusing structure if available, or just generic display */}
                                                        <div className="border rounded-lg p-4 dark:border-gray-700">
                                                            <p className="text-sm text-gray-500 mb-2">Updated: {new Date(record.updatedAt).toLocaleDateString()}</p>
                                                            <div className="grid md:grid-cols-2 gap-4">
                                                                <div>
                                                                    <p className="font-medium text-gray-900 dark:text-white text-sm">Allergies</p>
                                                                    <div className="flex flex-wrap gap-2 mt-1">
                                                                        {record.allergies?.map((allergy: string, i: number) => (
                                                                            <span key={i} className="px-2 py-0.5 bg-red-100 text-red-800 rounded-full text-xs">{allergy}</span>
                                                                        )) || <span className="text-gray-500 text-xs">None recorded</span>}
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium text-gray-900 dark:text-white text-sm">Chronic Conditions</p>
                                                                    <div className="flex flex-wrap gap-2 mt-1">
                                                                        {record.chronicConditions?.map((condition: string, i: number) => (
                                                                            <span key={i} className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full text-xs">{condition}</span>
                                                                        )) || <span className="text-gray-500 text-xs">None recorded</span>}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-8">
                                                    <p className="text-gray-500">No medical records found.</p>
                                                    <HelperText className="mt-2">Medical records typically include allergies, past surgeries, and vaccinations.</HelperText>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500">Failed to load patient details.</div>
                        )}

                        <div className="mt-8 flex justify-end border-t pt-4 dark:border-gray-700">
                            <Button onClick={closeInitialModal}>Close</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Helper component for empty states
function HelperText({ children, className = '' }: { children: React.ReactNode, className?: string }) {
    return <p className={`text-sm text-gray-400 dark:text-gray-500 ${className}`}>{children}</p>;
}
