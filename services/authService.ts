import { publicApi } from '@/lib/axios';

// ============================================================================
// REAL API IMPLEMENTATION
// ============================================================================

export const loginUser = async (credentials: { email: string; password: string }) => {
  const response = await publicApi.post('/auth/login', credentials);

  // Store token in localStorage
  // NOTE: This runs on the server during NextAuth flow, so we cannot access localStorage here.
  // The token will be handled by the NextAuth session callback.
  // if (response.data.token && typeof window !== 'undefined') {
  //     localStorage.setItem('access_token', response.data.token);
  // }

  return response.data;
};

export const registerUser = async (data: {
  name: string;
  email: string;
  password: string;
  role: 'patient' | 'doctor'
}) => {
  const response = await publicApi.post('/auth/register', data);
  return response.data;
};

// ============================================================================
// MOCK DATA IMPLEMENTATION (Commented out - uncomment to use mock data)
// ============================================================================

/*
export const loginUser = async (credentials: any) => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const { email } = credentials;
  
  // Mock token
  const mockToken = 'mock-jwt-token-' + Date.now();
  
  if (email.includes('patient')) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', mockToken);
    }
    return {
      token: mockToken,
      user: {
        id: '1',
        name: 'John Doe',
        email: email,
        role: 'patient',
      }
    };
  }
  
  if (email.includes('doctor')) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', mockToken);
    }
    return {
      token: mockToken,
      user: {
        id: '2',
        name: 'Dr. Sarah Smith',
        email: email,
        role: 'doctor',
      }
    };
  }
  
  if (email.includes('admin')) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', mockToken);
    }
    return {
      token: mockToken,
      user: {
        id: '3',
        name: 'System Admin',
        email: email,
        role: 'admin',
      }
    };
  }

  throw new Error('Invalid credentials');
};

export const registerUser = async (data: any) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return { message: 'User registered successfully' };
};
*/
