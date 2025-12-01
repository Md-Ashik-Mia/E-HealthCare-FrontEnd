'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { getPatientProfile, updateProfile } from '@/services/patientService';
import { toast } from 'react-toastify';

interface ProfileData {
    age?: string;
    bloodGroup?: string;
    gender?: string;
    phone?: string;
    address?: string;
    emergencyContact?: {
        name?: string;
        relation?: string;
        phone?: string;
    };
    isNewProfile?: boolean;
}

export default function PatientProfilePage() {
    const { data: session } = useSession();
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        age: '',
        bloodGroup: '',
        gender: '',
        phone: '',
        address: '',
        emergencyContact: {
            name: '',
            relation: '',
            phone: ''
        }
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const data = await getPatientProfile();
            setProfile(data);
            if (data && !data.isNewProfile) {
                setFormData({
                    age: data.age || '',
                    bloodGroup: data.bloodGroup || '',
                    gender: data.gender || '',
                    phone: data.phone || '',
                    address: data.address || '',
                    emergencyContact: {
                        name: data.emergencyContact?.name || '',
                        relation: data.emergencyContact?.relation || '',
                        phone: data.emergencyContact?.phone || ''
                    }
                });
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name.startsWith('ec_')) {
            const field = name.replace('ec_', '');
            setFormData(prev => ({
                ...prev,
                emergencyContact: {
                    ...prev.emergencyContact,
                    [field]: value
                }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const updated = await updateProfile(formData);
            setProfile(updated);
            setIsEditing(false);
            toast.success("Profile updated successfully!");
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("Failed to update profile.");
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
                {!isEditing && (
                    <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
                )}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <h3 className="mb-4 text-xl font-semibold">Personal Information</h3>

                    {isEditing ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                    <input
                                        type="text"
                                        value={session?.user?.name || ''}
                                        disabled
                                        className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm p-2 border text-gray-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email</label>
                                    <input
                                        type="text"
                                        value={session?.user?.email || ''}
                                        disabled
                                        className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm p-2 border text-gray-900"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Age</label>
                                    <input
                                        type="number"
                                        name="age"
                                        value={formData.age}
                                        onChange={handleChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Blood Group</label>
                                    <select
                                        name="bloodGroup"
                                        value={formData.bloodGroup}
                                        onChange={handleChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="">Select</option>
                                        {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => (
                                            <option key={bg} value={bg}>{bg}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Gender</label>
                                    <select
                                        name="gender"
                                        value={formData.gender}
                                        onChange={handleChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                                    >
                                        <option value="">Select</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Address</label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <h3 className="mt-6 mb-4 text-xl font-semibold">Emergency Contact</h3>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Name</label>
                                    <input
                                        type="text"
                                        name="ec_name"
                                        value={formData.emergencyContact.name}
                                        onChange={handleChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Relation</label>
                                    <input
                                        type="text"
                                        name="ec_relation"
                                        value={formData.emergencyContact.relation}
                                        onChange={handleChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                                    <input
                                        type="text"
                                        name="ec_phone"
                                        value={formData.emergencyContact.phone}
                                        onChange={handleChange}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <Button variant="outline" onClick={() => setIsEditing(false)} type="button">Cancel</Button>
                                <Button type="submit">Save Changes</Button>
                            </div>
                        </form>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="text-sm font-medium text-gray-600">Full Name</label>
                                <p className="mt-1 text-gray-900">{session?.user?.name || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Email</label>
                                <p className="mt-1 text-gray-900">{session?.user?.email || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Age</label>
                                <p className="mt-1 text-gray-900">{profile?.age || 'Not set'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Blood Group</label>
                                <p className="mt-1 text-gray-900">{profile?.bloodGroup || 'Not set'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Gender</label>
                                <p className="mt-1 text-gray-900">{profile?.gender || 'Not set'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Phone</label>
                                <p className="mt-1 text-gray-900">{profile?.phone || 'Not set'}</p>
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-sm font-medium text-gray-600">Address</label>
                                <p className="mt-1 text-gray-900">{profile?.address || 'Not set'}</p>
                            </div>
                        </div>
                    )}
                </Card>

                {!isEditing && (
                    <Card>
                        <h3 className="mb-4 text-xl font-semibold">Emergency Contact</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-medium text-gray-600">Name</label>
                                <p className="mt-1 text-gray-900">{profile?.emergencyContact?.name || 'Not set'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Relation</label>
                                <p className="mt-1 text-gray-900">{profile?.emergencyContact?.relation || 'Not set'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-600">Phone</label>
                                <p className="mt-1 text-gray-900">{profile?.emergencyContact?.phone || 'Not set'}</p>
                            </div>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
}
