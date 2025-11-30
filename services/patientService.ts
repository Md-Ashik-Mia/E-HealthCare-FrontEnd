import { patientApi } from '@/lib/axios';

// ============================================================================
// REAL API IMPLEMENTATION
// ============================================================================

export const getPatientProfile = async () => {
  const response = await patientApi.get('/patient/profile');
  return response.data;
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
  const response = await patientApi.get(`/doctor/${doctorId}`);
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
