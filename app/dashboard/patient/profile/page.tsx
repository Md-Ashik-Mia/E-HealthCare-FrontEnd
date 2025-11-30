'use client';

import { useSession } from 'next-auth/react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function PatientProfilePage() {
    const { data: session } = useSession();

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>

            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <h3 className="mb-4 text-xl font-semibold">Personal Information</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <label className="text-sm font-medium text-gray-600">Full Name</label>
                            <p className="mt-1 text-gray-900">John Doe</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600">Email</label>
                            <p className="mt-1 text-gray-900">patient@example.com</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600">Age</label>
                            <p className="mt-1 text-gray-900">32 years</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600">Blood Group</label>
                            <p className="mt-1 text-gray-900">O+</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600">Gender</label>
                            <p className="mt-1 text-gray-900">Male</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600">Phone</label>
                            <p className="mt-1 text-gray-900">+1 234 567 8900</p>
                        </div>
                    </div>
                    <div className="mt-6">
                        <Button>Edit Profile</Button>
                    </div>
                </Card>

                <Card>
                    <h3 className="mb-4 text-xl font-semibold">Emergency Contact</h3>
                    <div className="space-y-3">
                        <div>
                            <label className="text-sm font-medium text-gray-600">Name</label>
                            <p className="mt-1 text-gray-900">Jane Doe</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600">Relation</label>
                            <p className="mt-1 text-gray-900">Spouse</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-600">Phone</label>
                            <p className="mt-1 text-gray-900">+1 234 567 8901</p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
