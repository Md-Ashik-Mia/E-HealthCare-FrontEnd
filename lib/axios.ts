import axios, { type InternalAxiosRequestConfig } from "axios";

export const BASE_URL = "https://e-healthcare-backend.onrender.com";
console.log("API BASE_URL:", BASE_URL);

/**
 * Attach Authorization header from localStorage.
 * Used by patientApi, doctorApi, and adminApi.
 */
function attachAuth(
    config: InternalAxiosRequestConfig
): InternalAxiosRequestConfig {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("access_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
}

/** Public API (no auth required) - for login/register */
export const publicApi = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

/** Patient API (requires patient token) */
export const patientApi = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

/** Doctor API (requires doctor token) */
export const doctorApi = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

/** Admin API (requires admin token) */
export const adminApi = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// REQUEST interceptors - attach token to protected APIs
patientApi.interceptors.request.use(attachAuth);
doctorApi.interceptors.request.use(attachAuth);
adminApi.interceptors.request.use(attachAuth);

// RESPONSE interceptor for patient (redirect to login on 401)
patientApi.interceptors.response.use(
    (r) => r,
    (err) => {
        if (err.response?.status === 401 && typeof window !== "undefined") {
            localStorage.removeItem("access_token");
            window.location.href = "/login";
        }
        return Promise.reject(err);
    }
);

// RESPONSE interceptor for doctor (redirect to login on 401)
doctorApi.interceptors.response.use(
    (r) => r,
    (err) => {
        if (err.response?.status === 401 && typeof window !== "undefined") {
            localStorage.removeItem("access_token");
            window.location.href = "/login";
        }
        return Promise.reject(err);
    }
);

// RESPONSE interceptor for admin (redirect to login on 401)
adminApi.interceptors.response.use(
    (r) => r,
    (err) => {
        if (err.response?.status === 401 && typeof window !== "undefined") {
            localStorage.removeItem("access_token");
            window.location.href = "/login";
        }
        return Promise.reject(err);
    }
);
