import { patientApi, doctorApi } from '@/lib/axios';

// Create or update medical record
export const createOrUpdateMedicalRecord = async (patientId: string, data: {
    bloodType?: string;
    allergies?: string[];
    chronicConditions?: string[];
    pastSurgeries?: Array<{
        name: string;
        date: Date;
        notes?: string;
    }>;
    familyHistory?: string;
    currentMedications?: string[];
    vaccinations?: Array<{
        name: string;
        date: Date;
    }>;
    height?: number;
    weight?: number;
    emergencyContact?: {
        name: string;
        relationship: string;
        phone: string;
    };
}) => {
    const response = await patientApi.put(`/medical-records/patient/${patientId}`, data);
    return response.data;
};

// Get patient's medical record
export const getMedicalRecord = async (patientId: string) => {
    try {
        const response = await patientApi.get(`/medical-records/patient/${patientId}`);
        return response.data;
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
        if (error.response?.status === 404) {
            return null; // No medical record exists yet
        }
        throw error;
    }
};

// Get patient's medical record (doctor view)
export const getDoctorViewMedicalRecord = async (patientId: string) => {
    const response = await doctorApi.get(`/medical-records/patient/${patientId}`);
    return response.data;
};
