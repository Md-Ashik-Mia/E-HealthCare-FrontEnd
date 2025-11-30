'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { registerUser } from '@/services/authService';
import { toast } from 'react-toastify';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'patient' as 'patient' | 'doctor',
    });
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await registerUser(formData);
            toast.success(formData.role === 'doctor'
                ? 'Registration successful! Please wait for admin approval.'
                : 'Registration successful! You can now login.'
            );
            router.push('/login');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-white">
            <Card className="w-full max-w-md">
                <h2 className="mb-6 text-center text-3xl font-bold text-gray-800">Create Account</h2>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="mb-2 block text-sm font-semibold text-gray-700">Full Name</label>
                        <input
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                            type="text"
                            placeholder="Enter your full name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="mb-2 block text-sm font-semibold text-gray-700">Email Address</label>
                        <input
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                            type="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="mb-2 block text-sm font-semibold text-gray-700">Password</label>
                        <input
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                            type="password"
                            placeholder="Create a password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label className="mb-2 block text-sm font-semibold text-gray-700">Register as</label>
                        <select
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value as 'patient' | 'doctor' })}
                            required
                        >
                            <option value="patient">Patient</option>
                            <option value="doctor">Doctor</option>
                        </select>
                    </div>

                    <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                        {isLoading ? 'Creating Account...' : 'Create Account'}
                    </Button>

                    <p className="mt-4 text-center text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link href="/login" className="text-blue-600 hover:underline">
                            Login here
                        </Link>
                    </p>
                </form>
            </Card>
        </div>
    );
}
