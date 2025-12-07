import axios from 'axios';

const API_URL = 'http://localhost:5000/chat';

// Helper to get token
const getAuthHeader = () => {
    let token = null;
    if (typeof window !== 'undefined') {
        token = localStorage.getItem('access_token');
    }
    return { headers: { 'x-auth-token': token } };
};

export const startConversation = async (userId: string) => {
    const response = await axios.post(`${API_URL}/start`, { userId }, getAuthHeader());
    return response.data;
};

export const getMessages = async (conversationId: string) => {
    const response = await axios.get(`${API_URL}/${conversationId}/messages`, getAuthHeader());
    return response.data;
};

export const getMyConversations = async () => {
    const response = await axios.get(`${API_URL}/my`, getAuthHeader());
    return response.data;
};
