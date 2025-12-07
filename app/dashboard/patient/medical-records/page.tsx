'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMedicalRecord, createOrUpdateMedicalRecord } from '@/services/medicalRecordService';
import { useSession } from 'next-auth/react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { toast } from 'react-toastify';

export default function PatientMedicalRecordsPage() {
    const { data: session } = useSession();
    const userId = session?.user?.id;
    const queryClient = useQueryClient();
    const [isEditing, setIsEditing] = useState(false);

    const { data: medicalRecord, isLoading } = useQuery({
        queryKey: ['medicalRecord', userId],
        queryFn: () => getMedicalRecord(userId!),
        enabled: !!userId,
    });

    const [formData, setFormData] = useState({
        bloodType: medicalRecord?.bloodType || '',
        allergies: medicalRecord?.allergies?.join(', ') || '',
        chronicConditions: medicalRecord?.chronicConditions?.join(', ') || '',
        currentMedications: medicalRecord?.currentMedications?.join(', ') || '',
        familyHistory: medicalRecord?.familyHistory || '',
        height: medicalRecord?.height || '',
        weight: medicalRecord?.weight || '',
        emergencyContactName: medicalRecord?.emergencyContact?.name || '',
        emergencyContactRelationship: medicalRecord?.emergencyContact?.relationship || '',
        emergencyContactPhone: medicalRecord?.emergencyContact?.phone || '',
    });

    const updateMutation = useMutation({
        mutationFn: () => createOrUpdateMedicalRecord(userId!, {
            bloodType: formData.bloodType,
            allergies: formData.allergies.split(',').map((a: string) => a.trim()).filter(Boolean),
            chronicConditions: formData.chronicConditions.split(',').map((c: string) => c.trim()).filter(Boolean),
            currentMedications: formData.currentMedications.split(',').map((m: string) => m.trim()).filter(Boolean),
            familyHistory: formData.familyHistory,
            height: formData.height ? Number(formData.height) : undefined,
            weight: formData.weight ? Number(formData.weight) : undefined,
            emergencyContact: {
                name: formData.emergencyContactName,
                relationship: formData.emergencyContactRelationship,
                phone: formData.emergencyContactPhone,
            },
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['medicalRecord', userId] });
            toast.success('Medical record updated successfully');
            setIsEditing(false);
        },
        onError: () => {
            toast.error('Failed to update medical record');
        },
    });

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="text-center">
                    <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                    <p className="text-gray-600">Loading medical records...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Medical Records</h1>
                    <p className="mt-2 text-gray-600">Manage your health information</p>
                </div>
                {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)}>
                        ✏️ Edit
                    </Button>
                ) : (
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsEditing(false);
                                setFormData({
                                    bloodType: medicalRecord?.bloodType || '',
                                    allergies: medicalRecord?.allergies?.join(', ') || '',
                                    chronicConditions: medicalRecord?.chronicConditions?.join(', ') || '',
                                    currentMedications: medicalRecord?.currentMedications?.join(', ') || '',
                                    familyHistory: medicalRecord?.familyHistory || '',
                                    height: medicalRecord?.height || '',
                                    weight: medicalRecord?.weight || '',
                                    emergencyContactName: medicalRecord?.emergencyContact?.name || '',
                                    emergencyContactRelationship: medicalRecord?.emergencyContact?.relationship || '',
                                    emergencyContactPhone: medicalRecord?.emergencyContact?.phone || '',
                                });
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => updateMutation.mutate()}
                            disabled={updateMutation.isPending}
                        >
                            {updateMutation.isPending ? 'Saving...' : 'Save'}
                        </Button>
                    </div>
                )}
            </div>

            <Card>
                <div className="space-y-6">
                    {/* Basic Information */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Blood Type</label>
                                {isEditing ? (
                                    <select
                                        value={formData.bloodType}
                                        onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                                    >
                                        <option value="">Select</option>
                                        <option value="A+">A+</option>
                                        <option value="A-">A-</option>
                                        <option value="B+">B+</option>
                                        <option value="B-">B-</option>
                                        <option value="AB+">AB+</option>
                                        <option value="AB-">AB-</option>
                                        <option value="O+">O+</option>
                                        <option value="O-">O-</option>
                                    </select>
                                ) : (
                                    <p className="text-gray-900">{medicalRecord?.bloodType || 'Not specified'}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
                                {isEditing ? (
                                    <input
                                        type="number"
                                        value={formData.height}
                                        onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                                    />
                                ) : (
                                    <p className="text-gray-900">{medicalRecord?.height || 'Not specified'}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                                {isEditing ? (
                                    <input
                                        type="number"
                                        value={formData.weight}
                                        onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                                    />
                                ) : (
                                    <p className="text-gray-900">{medicalRecord?.weight || 'Not specified'}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Allergies */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Allergies (comma-separated)</label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={formData.allergies}
                                onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                                placeholder="e.g., Penicillin, Peanuts"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                            />
                        ) : (
                            <p className="text-gray-900">{medicalRecord?.allergies?.join(', ') || 'None'}</p>
                        )}
                    </div>

                    {/* Chronic Conditions */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Chronic Conditions (comma-separated)</label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={formData.chronicConditions}
                                onChange={(e) => setFormData({ ...formData, chronicConditions: e.target.value })}
                                placeholder="e.g., Asthma, Diabetes"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                            />
                        ) : (
                            <p className="text-gray-900">{medicalRecord?.chronicConditions?.join(', ') || 'None'}</p>
                        )}
                    </div>

                    {/* Current Medications */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Medications (comma-separated)</label>
                        {isEditing ? (
                            <input
                                type="text"
                                value={formData.currentMedications}
                                onChange={(e) => setFormData({ ...formData, currentMedications: e.target.value })}
                                placeholder="e.g., Aspirin, Metformin"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                            />
                        ) : (
                            <p className="text-gray-900">{medicalRecord?.currentMedications?.join(', ') || 'None'}</p>
                        )}
                    </div>

                    {/* Family History */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Family History</label>
                        {isEditing ? (
                            <textarea
                                value={formData.familyHistory}
                                onChange={(e) => setFormData({ ...formData, familyHistory: e.target.value })}
                                rows={3}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                            />
                        ) : (
                            <p className="text-gray-900">{medicalRecord?.familyHistory || 'Not specified'}</p>
                        )}
                    </div>

                    {/* Emergency Contact */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.emergencyContactName}
                                        onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                                    />
                                ) : (
                                    <p className="text-gray-900">{medicalRecord?.emergencyContact?.name || 'Not specified'}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.emergencyContactRelationship}
                                        onChange={(e) => setFormData({ ...formData, emergencyContactRelationship: e.target.value })}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                                    />
                                ) : (
                                    <p className="text-gray-900">{medicalRecord?.emergencyContact?.relationship || 'Not specified'}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                {isEditing ? (
                                    <input
                                        type="tel"
                                        value={formData.emergencyContactPhone}
                                        onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900"
                                    />
                                ) : (
                                    <p className="text-gray-900">{medicalRecord?.emergencyContact?.phone || 'Not specified'}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
