import { patientApi, doctorApi } from '@/lib/axios';

// Get user's notifications
export const getNotifications = async (unreadOnly = false) => {
    const response = await patientApi.get('/notifications', {
        params: { unreadOnly },
    });
    return response.data;
};

// Mark notification as read
export const markNotificationAsRead = async (id: string) => {
    const response = await patientApi.patch(`/notifications/${id}/read`);
    return response.data;
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async () => {
    const response = await patientApi.patch('/notifications/read-all');
    return response.data;
};

// Delete notification
export const deleteNotification = async (id: string) => {
    const response = await patientApi.delete(`/notifications/${id}`);
    return response.data;
};

// For doctors
export const getDoctorNotifications = async (unreadOnly = false) => {
    const response = await doctorApi.get('/notifications', {
        params: { unreadOnly },
    });
    return response.data;
};

export const markDoctorNotificationAsRead = async (id: string) => {
    const response = await doctorApi.patch(`/notifications/${id}/read`);
    return response.data;
};
