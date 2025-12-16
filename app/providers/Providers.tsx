'use client';

import { SessionProvider } from 'next-auth/react';
import { useSession } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { SocketProvider } from '@/context/SocketContext';

function AuthTokenSync() {
    const { data: session, status } = useSession();

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const token = (session?.user as any)?.accessToken as string | undefined; // eslint-disable-line @typescript-eslint/no-explicit-any

        if (status === 'authenticated' && token) {
            localStorage.setItem('access_token', token);
        }

        if (status === 'unauthenticated') {
            localStorage.removeItem('access_token');
        }
    }, [session?.user, status]);

    return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <SessionProvider>
            <AuthTokenSync />
            <QueryClientProvider client={queryClient}>
                <SocketProvider>
                    {children}
                    <ToastContainer
                        position="top-right"
                        autoClose={3000}
                        hideProgressBar={false}
                        newestOnTop={false}
                        closeOnClick
                        rtl={false}
                        pauseOnFocusLoss
                        draggable
                        pauseOnHover
                        theme="light"
                    />
                </SocketProvider>
            </QueryClientProvider>
        </SessionProvider>
    );
}
