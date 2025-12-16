'use client';

import { signOut } from 'next-auth/react';

export default function LogoutButton() {
    const handleLogout = () => {
        // Clear token from localStorage
        if (typeof window !== 'undefined') {
            localStorage.removeItem('access_token');
        }
        signOut({ callbackUrl: '/login' });
    };

    return (
        <button
            onClick={handleLogout}
            className="w-full rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
            Logout
        </button>
    );
}
