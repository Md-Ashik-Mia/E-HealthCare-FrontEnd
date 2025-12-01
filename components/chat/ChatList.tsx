'use client';

import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Link from 'next/link';

interface User {
    id: string;
    name: string;
    role: string;
    specialty?: string; // For doctors
    condition?: string; // For patients (mock)
}

interface ChatListProps {
    users: User[];
    basePath: string; // e.g., '/dashboard/patient/chats'
}

export default function ChatList({ users, basePath }: ChatListProps) {
    if (!users || users.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                No users found to chat with.
            </div>
        );
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {users.map((user) => (
                <Card key={user.id} className="hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-xl">
                            {user.role === 'doctor' ? '👨‍⚕️' : '👤'}
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">{user.name}</h3>
                            <p className="text-sm text-gray-500">
                                {user.specialty || user.condition || user.role}
                            </p>
                        </div>
                    </div>
                    <Link href={`${basePath}/${user.id}?name=${encodeURIComponent(user.name)}`}>
                        <Button className="w-full">Chat Now 💬</Button>
                    </Link>
                </Card>
            ))}
        </div>
    );
}
