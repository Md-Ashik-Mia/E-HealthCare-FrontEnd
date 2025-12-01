'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getApprovedDoctors } from '@/services/patientService';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useState } from 'react';

export default function FindDoctorPage() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSpecialty, setSelectedSpecialty] = useState('all');

    const { data: doctors, isLoading, error } = useQuery({
        queryKey: ['approvedDoctors'],
        queryFn: async () => {
            try {
                console.log('Fetching approved doctors...');
                const data = await getApprovedDoctors();
                console.log('Fetched doctors data:', data);
                return data;
            } catch (err) {
                console.error('Error fetching doctors:', err);
                throw err;
            }
        },
    });

    if (error) {
        console.error('Query error:', error);
    }

    // Extract unique specialties
    const specialties: string[] = doctors
        ? ['all', ...new Set(doctors.map((doc: any) => doc.speciality || doc.specialty).filter(Boolean))] as string[] // eslint-disable-line @typescript-eslint/no-explicit-any
        : ['all'];

    // Filter doctors based on search and specialty
    const filteredDoctors = doctors?.filter((doctor: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
        const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (doctor.speciality || doctor.specialty || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSpecialty = selectedSpecialty === 'all' ||
            (doctor.speciality || doctor.specialty) === selectedSpecialty;
        return matchesSearch && matchesSpecialty;
    });

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="text-center">
                    <div className="mb-4 inline-block h-16 w-16 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                    <p className="mt-4 text-lg font-semibold text-gray-700">Loading doctors...</p>
                    <p className="mt-2 text-sm text-gray-500">Please wait while we fetch available doctors</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Find a Doctor</h1>
                <p className="mt-2 text-gray-600">Browse our network of qualified healthcare professionals</p>
            </div>

            {/* Search and Filter */}
            <div className="grid gap-4 md:grid-cols-2">
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Search</label>
                    <input
                        type="text"
                        placeholder="Search by name or specialty..."
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">Specialty</label>
                    <select
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                        value={selectedSpecialty}
                        onChange={(e) => setSelectedSpecialty(e.target.value)}
                    >
                        {specialties.map((specialty) => (
                            <option key={specialty} value={specialty}>
                                {specialty === 'all' ? 'All Specialties' : specialty}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Results Count */}
            <div className="text-sm text-gray-600">
                Showing {filteredDoctors?.length || 0} doctor{filteredDoctors?.length !== 1 ? 's' : ''}
            </div>

            {/* Doctor Cards Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredDoctors?.map((doctor: any) => ( // eslint-disable-line @typescript-eslint/no-explicit-any
                    <Card
                        key={doctor._id || doctor.id}
                        className="group transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
                    >
                        {/* Doctor Avatar */}
                        <div className="mb-4 flex items-center gap-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-2xl text-white shadow-lg">
                                👨‍⚕️
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                    {doctor.name}
                                </h3>
                                <p className="text-sm text-gray-500">{doctor.speciality || doctor.specialty}</p>
                            </div>
                        </div>

                        {/* Doctor Details */}
                        <div className="space-y-3 border-t pt-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <span className="font-medium">📧</span>
                                <span className="truncate">{doctor.email}</span>
                            </div>

                            {doctor.degree && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <span className="font-medium">🎓</span>
                                    <span>{doctor.degree}</span>
                                </div>
                            )}

                            {doctor.experienceYears && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <span className="font-medium">⏱️</span>
                                    <span>{doctor.experienceYears} years experience</span>
                                </div>
                            )}

                            {doctor.registrationNumber && (
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <span className="font-medium">🆔</span>
                                    <span className="truncate">{doctor.registrationNumber}</span>
                                </div>
                            )}

                            {/* Consultation Fee */}
                            <div className="mt-4 flex items-center justify-between rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 p-3">
                                <span className="text-sm font-medium text-gray-700">Consultation Fee</span>
                                <span className="text-xl font-bold text-green-600">
                                    ${doctor.consultationFee || 200}
                                </span>
                            </div>

                            {/* Status Badge */}
                            <div className="flex items-center justify-between">
                                <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                                    ✓ {doctor.status || 'Available'}
                                </span>
                            </div>
                        </div>

                        {/* Action Button */}
                        <div className="mt-4">
                            <Button
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                                onClick={() => {
                                    const params = new URLSearchParams({
                                        doctorId: doctor._id || doctor.id,
                                        doctorName: doctor.name,
                                        specialty: doctor.speciality || doctor.specialty,
                                        fee: (doctor.consultationFee || 200).toString(),
                                    });
                                    router.push(`/dashboard/patient/schedule?${params.toString()}`);
                                }}
                            >
                                Book Appointment
                            </Button>
                        </div>
                    </Card>
                ))}
            </div>

            {/* No Results */}
            {filteredDoctors?.length === 0 && (
                <div className="py-12 text-center">
                    <div className="mb-4 text-6xl">🔍</div>
                    <h3 className="mb-2 text-xl font-semibold text-gray-900">No doctors found</h3>
                    <p className="text-gray-600">Try adjusting your search or filters</p>
                </div>
            )}
        </div>
    );
}
