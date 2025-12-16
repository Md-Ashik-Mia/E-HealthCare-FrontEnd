import { patientApi } from '@/lib/axios';

// ============================================================================
// REAL API IMPLEMENTATION
// ============================================================================

export const getPatientProfile = async () => {
  const response = await patientApi.get('/patient/profile');
  const data = response.data;

  // Backend returns either a PatientProfile doc (with populated userId) or
  // { userId: {name,email}, isNewProfile: true }
  const user = data?.userId;
  const name = user?.name;
  const email = user?.email;

  return {
    ...data,
    name,
    email,
  };
};

export const getPatientAppointments = async () => {
  const response = await patientApi.get('/appointments/my');
  return response.data;
};

export const bookAppointment = async (data: {
  doctorId: string;
  scheduleId: string;
  date: string;
  time: string;
  note?: string;
}) => {
  const response = await patientApi.post('/appointments/book', data);
  return response.data;
};

export const cancelAppointment = async (appointmentId: string) => {
  const response = await patientApi.patch(`/appointments/${appointmentId}/cancel`);
  return response.data;
};

export const getDoctorAvailability = async (doctorId: string) => {
  // Backend route is mounted at /appointments
  const response = await patientApi.get(`/appointments/doctor/${doctorId}`);
  return response.data;
};

export const getApprovedDoctors = async () => {
  const response = await patientApi.get('/users/doctors/approved');
  return response.data;
};

export const getDoctorSchedule = async (doctorId: string) => {
  const response = await patientApi.get(`/appointments/doctor/${doctorId}`);
  return response.data;
};

export const updateProfile = async (data: {
  age?: string;
  bloodGroup?: string;
  gender?: string;
  phone?: string;
  address?: string;
  emergencyContact?: {
    name?: string;
    relation?: string;
    phone?: string;
  };
  healthMetrics?: {
    heartRate?: string;
    bloodPressure?: string;
    weight?: string;
    bloodGlucose?: string;
  };
}) => {
  const response = await patientApi.post('/patient/profile', data);
  return response.data;
};
