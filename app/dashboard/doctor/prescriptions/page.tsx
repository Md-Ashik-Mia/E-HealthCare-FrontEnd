'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDoctorAppointments } from '@/services/doctorService';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { createPrescription } from '@/services/prescriptionService';
import { toast } from 'react-toastify';

export default function DoctorPrescriptionsPage() {
    const [selectedAppointment, setSelectedAppointment] = useState<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any
    const [showForm, setShowForm] = useState(false);
    const [medications, setMedications] = useState([
        { name: '', dosage: '', frequency: '', duration: '', instructions: '' }
    ]);
    const [diagnosis, setDiagnosis] = useState('');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data: appointments, isLoading } = useQuery({
        queryKey: ['doctorAppointments'],
        queryFn: getDoctorAppointments,
    });

    const addMedication = () => {
        setMedications([...medications, { name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
    };

    const removeMedication = (index: number) => {
        setMedications(medications.filter((_, i) => i !== index));
    };

    const updateMedication = (index: number, field: string, value: string) => {
        const updated = [...medications];
        updated[index] = { ...updated[index], [field]: value };
        setMedications(updated);
    };

    const handleSubmit = async () => {
        if (!selectedAppointment) return;
        if (!diagnosis.trim()) {
            toast.error('Please enter a diagnosis');
            return;
        }
        if (medications.some(m => !m.name || !m.dosage || !m.frequency || !m.duration)) {
            toast.error('Please fill in all medication fields');
            return;
        }

        setIsSubmitting(true);
        try {
            await createPrescription({
                appointmentId: selectedAppointment._id,
                patientId: selectedAppointment.patientId || selectedAppointment.userId,
                medications: medications.filter(m => m.name),
                diagnosis,
                notes,
            });
            toast.success('Prescription created successfully');
            setShowForm(false);
            setSelectedAppointment(null);
            setMedications([{ name: '', dosage: '', frequency: '', duration: '', instructions: '' }]);
            setDiagnosis('');
            setNotes('');
        } catch {
            toast.error('Failed to create prescription');
        } finally {
            setIsSubmitting(false);
        }
    };

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

    if (showForm && selectedAppointment) {
        return (
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Create Prescription</h1>
                        <p className="mt-2 text-gray-600">
                            Patient: {selectedAppointment.patientName || 'Unknown'}
                        </p>
                    </div>
                    <Button variant="outline" onClick={() => setShowForm(false)}>
                        ← Back
                    </Button>
                </div>

                <Card>
                    <div className="space-y-6">
                        {/* Diagnosis */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Diagnosis <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={diagnosis}
                                onChange={(e) => setDiagnosis(e.target.value)}
                                rows={3}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                                placeholder="Enter diagnosis..."
                            />
                        </div>

                        {/* Medications */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Medications</h3>
                                <Button size="sm" onClick={addMedication}>
                                    + Add Medication
                                </Button>
                            </div>
                            <div className="space-y-4">
                                {medications.map((med, index) => (
                                    <div key={index} className="rounded-lg border border-gray-200 p-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Medication Name <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={med.name}
                                                    onChange={(e) => updateMedication(index, 'name', e.target.value)}
                                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                                                    placeholder="e.g., Amoxicillin"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Dosage <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={med.dosage}
                                                    onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                                                    placeholder="e.g., 500mg"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Frequency <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={med.frequency}
                                                    onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                                                    placeholder="e.g., 3 times daily"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Duration <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    value={med.duration}
                                                    onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                                                    placeholder="e.g., 7 days"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Instructions
                                                </label>
                                                <input
                                                    type="text"
                                                    value={med.instructions}
                                                    onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                                                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                                                    placeholder="e.g., Take with food"
                                                />
                                            </div>
                                        </div>
                                        {medications.length > 1 && (
                                            <button
                                                onClick={() => removeMedication(index)}
                                                className="mt-2 text-sm text-red-600 hover:text-red-700"
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Additional Notes
                            </label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={3}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                                placeholder="Any additional instructions or notes..."
                            />
                        </div>

                        {/* Submit */}
                        <div className="flex gap-2">
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="flex-1"
                            >
                                {isSubmitting ? 'Creating...' : 'Create Prescription'}
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Prescriptions</h1>
                <p className="mt-2 text-gray-600">Create prescriptions for your patients</p>
            </div>

            <Card title="Recent Appointments">
                {appointments && appointments.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b text-sm text-gray-500">
                                    <th className="pb-3">Patient</th>
                                    <th className="pb-3">Date</th>
                                    <th className="pb-3">Time</th>
                                    <th className="pb-3">Status</th>
                                    <th className="pb-3">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {appointments.map((apt: any) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
                                    <tr key={apt._id}>
                                        <td className="py-4 font-medium text-gray-900">
                                            {apt.patientName || 'Unknown'}
                                        </td>
                                        <td className="py-4 text-gray-600">{apt.date}</td>
                                        <td className="py-4 text-gray-600">{apt.time}</td>
                                        <td className="py-4">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${apt.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                                    apt.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-gray-100 text-gray-800'
                                                }`}>
                                                {apt.status}
                                            </span>
                                        </td>
                                        <td className="py-4">
                                            <Button
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedAppointment(apt);
                                                    setShowForm(true);
                                                }}
                                            >
                                                Create Prescription
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="py-12 text-center">
                        <div className="mb-4 text-6xl">📅</div>
                        <h3 className="mb-2 text-xl font-semibold text-gray-900">No Appointments</h3>
                        <p className="text-gray-600">You don&apos;t have any appointments yet.</p>
                    </div>
                )}
            </Card>
        </div>
    );
}
