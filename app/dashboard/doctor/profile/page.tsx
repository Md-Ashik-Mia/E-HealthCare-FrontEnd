'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDoctorProfile, updateDoctorProfile } from '@/services/doctorService';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { toast } from 'react-toastify';

export default function DoctorProfilePage() {
    const queryClient = useQueryClient();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        speciality: '',
        registrationNumber: '',
        degree: '',
        experienceYears: 0,
        phone: '',
        bio: '',
        consultationFee: 0,
        consultationModes: [] as string[],
        isAutoAIReplyEnabled: false,
        aiInstructions: '',
    });

    const { data: profile, isLoading } = useQuery({
        queryKey: ['doctorProfile'],
        queryFn: getDoctorProfile,
    });

    // Initialize form data when profile loads
    useEffect(() => {
        if (profile) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setFormData({
                speciality: profile.speciality || '',
                registrationNumber: profile.registrationNumber || '',
                degree: profile.degree || '',
                experienceYears: profile.experienceYears || 0,
                phone: profile.phone || '',
                bio: profile.bio || '',
                consultationFee: profile.consultationFee || 0,
                consultationModes: profile.consultationModes || [],
                isAutoAIReplyEnabled: profile.isAutoAIReplyEnabled || false,
                aiInstructions: profile.aiInstructions || '',
            });
        }
    }, [profile]);

    const updateMutation = useMutation({
        mutationFn: updateDoctorProfile,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['doctorProfile'] });
            setIsEditing(false);
            toast.success('Profile updated successfully');
        },
        onError: (error: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
            toast.error('Failed to update profile: ' + (error.response?.data?.message || error.message));
        }
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            if (name === 'isAutoAIReplyEnabled') {
                setFormData(prev => ({ ...prev, [name]: checked }));
            } else {
                // Handle consultation modes
                setFormData(prev => {
                    const modes = prev.consultationModes;
                    if (checked) {
                        return { ...prev, consultationModes: [...modes, value] };
                    } else {
                        return { ...prev, consultationModes: modes.filter(mode => mode !== value) };
                    }
                });
            }
        } else if (type === 'number') {
            setFormData(prev => ({ ...prev, [name]: Number(value) }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateMutation.mutate(formData);
    };

    if (isLoading) return <div className="flex h-full items-center justify-center">Loading...</div>;

    const getStatusBadge = (status: string) => {
        const styles = {
            approved: 'bg-green-100 text-green-800',
            pending: 'bg-yellow-100 text-yellow-800',
            rejected: 'bg-red-100 text-red-800',
        };
        return (
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Doctor Profile</h1>
                    <p className="text-gray-600">Manage your professional details and settings</p>
                </div>
                {!isEditing && (
                    <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                )}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Account Information Card */}
                <Card className="lg:col-span-1">
                    <h3 className="mb-4 text-xl font-semibold">Account Information</h3>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center text-2xl">
                                👨‍⚕️
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">{profile?.userId?.name || 'N/A'}</p>
                                <p className="text-sm text-gray-600">{profile?.userId?.email || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="border-t pt-4">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-gray-600">Status:</span>
                                {profile?.status && getStatusBadge(profile.status)}
                            </div>
                            {profile?.status === 'pending' && (
                                <p className="text-xs text-gray-500 mt-2">
                                    Your profile is pending admin approval. You&apos;ll be notified once approved.
                                </p>
                            )}
                        </div>
                    </div>
                </Card>

                {/* Profile Form */}
                <Card className="lg:col-span-2">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Professional Details Section */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Details</h3>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Speciality</label>
                                    <input
                                        type="text"
                                        name="speciality"
                                        value={formData.speciality}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-gray-900 focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
                                        placeholder="e.g., Cardiology"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Degree</label>
                                    <input
                                        type="text"
                                        name="degree"
                                        value={formData.degree}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-gray-900 focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
                                        placeholder="e.g., MBBS, MD"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Registration Number</label>
                                    <input
                                        type="text"
                                        name="registrationNumber"
                                        value={formData.registrationNumber}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-gray-900 focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
                                        placeholder="Medical registration number"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Experience (Years)</label>
                                    <input
                                        type="number"
                                        name="experienceYears"
                                        value={formData.experienceYears}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-gray-900 focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
                                        min="0"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-gray-900 focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
                                        placeholder="Contact number"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Bio / About</label>
                                    <textarea
                                        name="bio"
                                        rows={3}
                                        value={formData.bio}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-gray-900 focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
                                        placeholder="Tell patients about your experience and expertise..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Consultation Settings Section */}
                        <div className="border-t pt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Consultation Settings</h3>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Consultation Fee ($)</label>
                                    <input
                                        type="number"
                                        name="consultationFee"
                                        value={formData.consultationFee}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-gray-900 focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Consultation Modes</label>
                                    <div className="flex gap-4">
                                        {['chat', 'audio', 'video'].map(mode => (
                                            <label key={mode} className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    name="consultationModes"
                                                    value={mode}
                                                    checked={formData.consultationModes.includes(mode)}
                                                    onChange={handleChange}
                                                    disabled={!isEditing}
                                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                                                />
                                                <span className="capitalize text-gray-900">{mode}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* AI Assistant Settings Section */}
                        <div className="border-t pt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Assistant Settings</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        name="isAutoAIReplyEnabled"
                                        id="isAutoAIReplyEnabled"
                                        checked={formData.isAutoAIReplyEnabled}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                                    />
                                    <label htmlFor="isAutoAIReplyEnabled" className="text-sm font-medium text-gray-700">
                                        Enable Auto AI Reply
                                    </label>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">AI Instructions</label>
                                    <textarea
                                        name="aiInstructions"
                                        rows={3}
                                        value={formData.aiInstructions}
                                        onChange={handleChange}
                                        disabled={!isEditing}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-gray-900 focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
                                        placeholder="E.g., Be polite, ask for symptoms, do not prescribe medication..."
                                    />
                                    <p className="mt-1 text-xs text-gray-500">Instructions for the AI when replying to patients on your behalf.</p>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        {isEditing && (
                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <Button variant="outline" onClick={() => setIsEditing(false)} type="button">
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={updateMutation.isPending}>
                                    {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </div>
                        )}
                    </form>
                </Card>
            </div>
        </div>
    );
}
