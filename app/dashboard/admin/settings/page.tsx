'use client';

import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export default function AdminSettingsPage() {
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-900">System Settings</h1>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card title="General Settings">
                    <div className="space-y-4">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">Hospital Name</label>
                            <input
                                type="text"
                                defaultValue="MediCare+ Hospital"
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900"
                            />
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">Contact Email</label>
                            <input
                                type="email"
                                defaultValue="contact@medicare.com"
                                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-900"
                            />
                        </div>
                        <Button>Save Changes</Button>
                    </div>
                </Card>

                <Card title="Notification Settings">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-700">Email Notifications</span>
                            <input type="checkbox" defaultChecked className="h-5 w-5" />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-700">SMS Notifications</span>
                            <input type="checkbox" defaultChecked className="h-5 w-5" />
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-700">Push Notifications</span>
                            <input type="checkbox" className="h-5 w-5" />
                        </div>
                        <Button>Save Changes</Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
