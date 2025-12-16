'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Sidebar from './Sidebar';


interface DashboardLayoutProps {
    children: React.ReactNode;
    role: 'patient' | 'doctor' | 'admin';
}

export default function DashboardLayout({ children, role }: DashboardLayoutProps) {
    const { status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    if (status === 'loading') {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-center">
                    <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50 text-gray-900">
            <Sidebar role={role} />
            <main className="ml-64 flex-1 overflow-y-auto p-8">{children}</main>
        </div>
    );
}
