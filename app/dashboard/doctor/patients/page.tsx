'use client';

import Card from '@/components/ui/Card';

export default function DoctorPatientsPage() {
    const patients = [
        { id: 1, name: 'John Doe', age: 32, lastVisit: '2023-12-01', condition: 'Asthma' },
        { id: 2, name: 'Alice Brown', age: 28, lastVisit: '2023-12-03', condition: 'Hypertension' },
        { id: 3, name: 'Bob Smith', age: 45, lastVisit: '2023-11-28', condition: 'Diabetes' },
    ];

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-900">My Patients</h1>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {patients.map((patient) => (
                    <Card key={patient.id}>
                        <div className="mb-4 flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-xl">
                                👤
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">{patient.name}</h3>
                                <p className="text-sm text-gray-500">Age: {patient.age}</p>
                            </div>
                        </div>
                        <div className="space-y-2 text-sm">
                            <p className="text-gray-600">Last Visit: {patient.lastVisit}</p>
                            <p className="text-gray-600">Condition: {patient.condition}</p>
                        </div>
                        <button className="mt-4 text-blue-600 hover:underline">View Full Record</button>
                    </Card>
                ))}
            </div>
        </div>
    );
}
