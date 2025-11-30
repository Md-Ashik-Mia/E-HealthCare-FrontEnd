import { adminApi } from '@/lib/axios';

// ============================================================================
// REAL API IMPLEMENTATION
// ============================================================================

export const getAdminDashboardStats = async () => {
  const response = await adminApi.get('/admin/stats');
  return response.data;
};

export const getPendingDoctors = async () => {
  const response = await adminApi.get('/admin/doctors/pending');
  return response.data;
};

export const approveDoctor = async (doctorId: string) => {
  const response = await adminApi.patch(`/admin/doctors/${doctorId}/approve`);
  return response.data;
};

export const rejectDoctor = async (doctorId: string) => {
  const response = await adminApi.patch(`/admin/doctors/${doctorId}/reject`);
  return response.data;
};

export const getAllUsers = async () => {
  const response = await adminApi.get('/users/');
  return response.data;
};

// ============================================================================
// MOCK DATA IMPLEMENTATION (Commented out - uncomment to use mock data)
// ============================================================================

/*
export const getAdminDashboardStats = async () => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return {
    totalPatients: 1240,
    totalDoctors: 85,
    pendingApprovals: 3,
    revenue: '$125,000',
    activeAppointments: 45
  };
};

export const getPendingDoctors = async () => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return [
    { 
      id: '101', 
      name: 'Dr. Michael New', 
      email: 'michael.new@example.com', 
      specialization: 'Pediatrics',
      appliedDate: '2023-11-28'
    },
    { 
      id: '102', 
      name: 'Dr. Linda Fresh', 
      email: 'linda.fresh@example.com', 
      specialization: 'Neurology',
      appliedDate: '2023-11-29'
    },
    { 
      id: '103', 
      name: 'Dr. James Young', 
      email: 'james.young@example.com', 
      specialization: 'Orthopedics',
      appliedDate: '2023-11-30'
    }
  ];
};

export const approveDoctor = async (doctorId: string) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return { success: true, message: 'Doctor approved successfully' };
};
*/
