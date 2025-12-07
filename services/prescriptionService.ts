import { doctorApi, patientApi } from '@/lib/axios';

// Create prescription (doctor only)
export const createPrescription = async (data: {
    appointmentId: string;
    patientId: string;
    medications: Array<{
        name: string;
        dosage: string;
        frequency: string;
        duration: string;
        instructions?: string;
    }>;
    diagnosis: string;
    notes?: string;
}) => {
    const response = await doctorApi.post('/prescriptions', data);
    return response.data;
};

// Get patient's prescriptions
export const getPatientPrescriptions = async (patientId: string) => {
    const response = await patientApi.get(`/prescriptions/patient/${patientId}`);
    return response.data;
};

// Get specific prescription
export const getPrescription = async (id: string) => {
    const response = await patientApi.get(`/prescriptions/${id}`);
    return response.data;
};

// Update prescription (doctor only)
export const updatePrescription = async (id: string, data: {
    medications?: Array<{
        name: string;
        dosage: string;
        frequency: string;
        duration: string;
        instructions?: string;
    }>;
    diagnosis?: string;
    notes?: string;
}) => {
    const response = await doctorApi.put(`/prescriptions/${id}`, data);
    return response.data;
};
