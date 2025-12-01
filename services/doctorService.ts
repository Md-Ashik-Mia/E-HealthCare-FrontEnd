import { doctorApi } from '@/lib/axios';

// ============================================================================
// REAL API IMPLEMENTATION
// ============================================================================

export const getDoctorProfile = async () => {
  const response = await doctorApi.get('/doctor/profile');
  return response.data;
};

export const updateDoctorProfile = async (data: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
  const response = await doctorApi.patch('/doctor/profile', data);
  return response.data;
};

export const getDoctorAppointments = async () => {
  const response = await doctorApi.get('/appointments/my');
  return response.data;
};

export const getDoctorSchedule = async () => {
  const response = await doctorApi.get('/doctor/schedule');
  return response.data;
};

export const createSchedule = async (data: {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
}) => {
  const response = await doctorApi.post('/doctor/schedule', data);
  return response.data;
};

export const deleteSchedule = async (scheduleId: string) => {
  const response = await doctorApi.delete(`/doctor/schedule/${scheduleId}`);
  return response.data;
};

export const markAppointmentAsPaid = async (appointmentId: string) => {
  const response = await doctorApi.patch(`/appointments/${appointmentId}/pay`);
  return response.data;
};

export const cancelAppointment = async (appointmentId: string) => {
  const response = await doctorApi.patch(`/appointments/${appointmentId}/cancel`);
  return response.data;
};

export const confirmAppointment = async (appointmentId: string) => {
  const response = await doctorApi.patch(`/appointments/${appointmentId}/confirm`);
  return response.data;
};

export const completeAppointment = async (appointmentId: string) => {
  const response = await doctorApi.patch(`/appointments/${appointmentId}/complete`);
  return response.data;
};

// ============================================================================
// MOCK DATA IMPLEMENTATION (Commented out - uncomment to use mock data)
// ============================================================================

/*
export const getDoctorProfile = async () => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return {
    id: '2',
    name: 'Dr. Sarah Smith',
    email: 'doctor@example.com',
    specialization: 'Cardiology',
    experience: '12 years',
    hospital: 'City General Hospital',
    rating: 4.8,
    availableDays: ['Monday', 'Wednesday', 'Friday']
  };
};

export const getDoctorAppointments = async () => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return [
    { 
      id: 1, 
      patient: 'John Doe', 
      age: 32,
      date: '2023-12-05', 
      time: '10:00 AM',
      status: 'Confirmed',
      type: 'Follow-up'
    },
    { 
      id: 3, 
      patient: 'Alice Brown', 
      age: 28,
      date: '2023-12-05', 
      time: '11:00 AM',
      status: 'Confirmed',
      type: 'New Consultation'
    }
  ];
};
*/
