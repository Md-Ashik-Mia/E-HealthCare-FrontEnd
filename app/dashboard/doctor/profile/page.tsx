'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDoctorProfile, updateDoctorProfile } from '@/services/doctorService';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { toast } from 'react-toastify';

export default function DoctorProfilePage() {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
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

    useEffect(() => {
        if (profile) {
            setFormData({
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
            toast.success('Profile updated successfully');
        },
        onError: (error: any) => {
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
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateMutation.mutate(formData);
    };

    if (isLoading) return <div className="p-8 text-center">Loading profile...</div>;

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Doctor Profile</h1>
                <p className="text-gray-600">Manage your professional details and settings</p>
            </div>

            <Card>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Bio */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Bio / Specialization Details</label>
                        <textarea
                            name="bio"
                            rows={4}
                            value={formData.bio}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Tell patients about your experience..."
                        />
                    </div>

                    {/* Consultation Fee */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Consultation Fee ($)</label>
                        <input
                            type="number"
                            name="consultationFee"
                            value={formData.consultationFee}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                    </div>

                    {/* Consultation Modes */}
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
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="capitalize text-gray-900">{mode}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="border-t pt-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">AI Assistant Settings</h3>

                        {/* Auto AI Reply */}
                        <div className="flex items-center gap-2 mb-4">
                            <input
                                type="checkbox"
                                name="isAutoAIReplyEnabled"
                                id="isAutoAIReplyEnabled"
                                checked={formData.isAutoAIReplyEnabled}
                                onChange={handleChange}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label htmlFor="isAutoAIReplyEnabled" className="text-sm font-medium text-gray-700">
                                Enable Auto AI Reply
                            </label>
                        </div>

                        {/* AI Instructions */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700">AI Instructions</label>
                            <textarea
                                name="aiInstructions"
                                rows={3}
                                value={formData.aiInstructions}
                                onChange={handleChange}
                                className="mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="E.g., Be polite, ask for symptoms, do not prescribe medication..."
                            />
                            <p className="mt-1 text-xs text-gray-500">Instructions for the AI when replying to patients on your behalf.</p>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={updateMutation.isPending}>
                            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
