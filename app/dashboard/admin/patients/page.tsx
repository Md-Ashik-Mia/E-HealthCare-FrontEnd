'use client';

import Card from '@/components/ui/Card';

export default function AdminPatientsPage() {
    const patients = [
        { id: 1, name: 'John Doe', age: 32, lastVisit: '2023-12-01', doctor: 'Dr. Sarah Smith' },
        { id: 2, name: 'Alice Brown', age: 28, lastVisit: '2023-12-03', doctor: 'Dr. Emily Jones' },
        { id: 3, name: 'Bob Smith', age: 45, lastVisit: '2023-11-28', doctor: 'Dr. Michael Brown' },
    ];

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-900">Patients Management</h1>

            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b text-sm text-gray-500">
                                <th className="pb-3">Name</th>
                                <th className="pb-3">Age</th>
                                <th className="pb-3">Last Visit</th>
                                <th className="pb-3">Assigned Doctor</th>
                                <th className="pb-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {patients.map((patient) => (
                                <tr key={patient.id}>
                                    <td className="py-4 font-medium">{patient.name}</td>
                                    <td className="py-4">{patient.age}</td>
                                    <td className="py-4">{patient.lastVisit}</td>
                                    <td className="py-4">{patient.doctor}</td>
                                    <td className="py-4">
                                        <button className="text-blue-600 hover:underline">View Details</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
