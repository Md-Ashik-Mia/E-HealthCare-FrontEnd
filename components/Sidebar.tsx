'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LogoutButton from './LogoutButton';

interface SidebarLink {
    href: string;
    label: string;
    icon?: string;
}

export default function Sidebar({ role }: { role: 'patient' | 'doctor' | 'admin' }) {
    const pathname = usePathname();

    const patientLinks: SidebarLink[] = [
        { href: '/dashboard/patient', label: 'Dashboard', icon: '🏠' },
        { href: '/dashboard/patient/find-doctor', label: 'Find Doctor', icon: '🔍' },
        { href: '/dashboard/patient/appointments', label: 'Appointments', icon: '📅' },
        { href: '/dashboard/patient/history', label: 'Medical History', icon: '📋' },
        { href: '/dashboard/patient/chats', label: 'Chats', icon: '💬' },
        { href: '/dashboard/patient/profile', label: 'Profile', icon: '👤' },
    ];

    const doctorLinks: SidebarLink[] = [
        { href: '/dashboard/doctor', label: 'Dashboard', icon: '🏠' },
        { href: '/dashboard/doctor/appointments', label: 'Appointments', icon: '📅' },
        { href: '/dashboard/doctor/patients', label: 'My Patients', icon: '👥' },
        { href: '/dashboard/doctor/schedule', label: 'Schedule', icon: '🗓️' },
        { href: '/dashboard/doctor/chats', label: 'Chats', icon: '💬' },
    ];

    const adminLinks: SidebarLink[] = [
        { href: '/dashboard/admin', label: 'Dashboard', icon: '🏠' },
        { href: '/dashboard/admin/doctors', label: 'Doctors', icon: '👨‍⚕️' },
        { href: '/dashboard/admin/patients', label: 'Patients', icon: '👥' },
        { href: '/dashboard/admin/settings', label: 'Settings', icon: '⚙️' },
    ];

    const links = role === 'patient' ? patientLinks : role === 'doctor' ? doctorLinks : adminLinks;
    const title = role === 'patient' ? 'Patient Portal' : role === 'doctor' ? 'Doctor Portal' : 'Admin Portal';

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-gray-900 text-white">
            <div className="flex h-16 items-center justify-center border-b border-gray-800">
                <h1 className="text-xl font-bold">{title}</h1>
            </div>
            <nav className="mt-6 px-4">
                <ul className="space-y-2">
                    {links.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    className={`flex items-center gap-3 rounded px-4 py-2 transition-colors ${isActive
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                        }`}
                                >
                                    {link.icon && <span>{link.icon}</span>}
                                    <span>{link.label}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>
            <div className="absolute bottom-0 w-full border-t border-gray-800 p-4">
                <LogoutButton />
            </div>
        </aside>
    );
}
