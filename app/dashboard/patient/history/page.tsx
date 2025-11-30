'use client';

import Card from '@/components/ui/Card';

export default function PatientHistoryPage() {
    const medicalHistory = [
        { id: 1, condition: 'Asthma', diagnosedDate: '2018-05-20', doctor: 'Dr. Sarah Smith' },
        { id: 2, condition: 'Hypertension', diagnosedDate: '2021-11-10', doctor: 'Dr. Michael Brown' },
        { id: 3, condition: 'Seasonal Allergies', diagnosedDate: '2020-03-15', doctor: 'Dr. Emily Jones' },
    ];

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-gray-900">Medical History</h1>

            <div className="grid gap-6">
                {medicalHistory.map((record) => (
                    <Card key={record.id}>
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900">{record.condition}</h3>
                                <p className="mt-2 text-sm text-gray-600">Diagnosed: {record.diagnosedDate}</p>
                                <p className="text-sm text-gray-600">Doctor: {record.doctor}</p>
                            </div>
                            <button className="text-blue-600 hover:underline">View Full Report</button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
