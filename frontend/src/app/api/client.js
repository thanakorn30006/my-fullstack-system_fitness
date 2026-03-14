// ============================================================
// api/client.js — ศูนย์กลาง API calls ทุกอย่างในแอป
//
// โครงสร้าง:
//   apiClient      → axios instance ที่แนบ JWT token ทุก request อัตโนมัติ
//   authAPI        → login, register, session, users, profile
//   bookingsAPI    → จอง/ยกเลิก/ดูการจองของตัวเอง
//   classesAPI     → ดู/สร้าง/toggle/ลบ class
//   packagesAPI    → ดู/สมัคร/สร้าง/ลบ package
//   trainersAPI    → ดู/สร้าง/ลบ trainer
//
// ห้ามแก้: interceptors (ส่วนที่แนบ token อัตโนมัติ)
// ============================================================

import axios from 'axios';

// URL หลักของ Backend — เปลี่ยนตรงนี้ถ้า deploy ไปที่อื่น
const API_BASE_URL = 'http://localhost:5001/api';

// สร้าง axios instance กลาง
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ======================== Interceptors ========================

// 1. Request Interceptor: แนบ JWT token ให้ทุก request อัตโนมัติ
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 2. Response Interceptor: จัดการ Error ทั่วไป (เช่น 401 Unauthorized)
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // ถ้า API ตอบ 401 → ล้าง session แล้วเด้งไปหน้า login
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            // ป้องกันการรีเฟรชหน้าวนลูปถ้าอยู่ที่หน้า login อยู่แล้ว
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// ======================== Auth API ========================
export const authAPI = {
    register: (data) => apiClient.post('/register', data),
    login: (data) => apiClient.post('/login', data),
    getSession: () => apiClient.get('/session'),
};

// ======================== Bookings API ========================
export const bookingsAPI = {
    getMyBookings: () => apiClient.get('/bookings'),
    createBooking: (classId) => apiClient.post('/bookings', { classId }),
    cancelBooking: (id) => apiClient.delete(`/bookings/${id}`),
};

// ======================== Classes API ========================
export const classesAPI = {
    getAll: () => apiClient.get('/classes'),
    create: (data) => apiClient.post('/classes', data),      // Admin only
    update: (id, data) => apiClient.put(`/classes/${id}`, data), // Admin only
    toggle: (id) => apiClient.put(`/classes/${id}/toggle`),  // Admin only
    delete: (id) => apiClient.delete(`/classes/${id}`),      // Admin only
};

// ======================== Packages API ========================
export const packagesAPI = {
    getAll: () => apiClient.get('/packages'),                 // เฉพาะ active packages
    getAllAdmin: () => apiClient.get('/packages/all'),         // Admin only (ทุก package)
    getMyActive: () => apiClient.get('/packages/my-active'),    // package ปัจจุบันของ user
    getHistory: () => apiClient.get('/packages/history'),      // ประวัติการซื้อทั้งหมด
    create: (data) => apiClient.post('/packages', data),       // Admin only
    update: (id, data) => apiClient.put(`/packages/${id}`, data), // Admin only
    subscribe: (packageId) => apiClient.post('/packages/subscribe', { packageId }),
    delete: (id) => apiClient.delete(`/packages/${id}`),      // Admin only
};

// ======================== Trainers API ========================
export const trainersAPI = {
    getAll: () => apiClient.get('/trainers/all'),
    create: (data) => apiClient.post('/trainers/create', data), // Admin only
    update: (id, data) => apiClient.put(`/trainers/${id}`, data), // Admin only
    delete: (id) => apiClient.delete(`/trainers/${id}`),        // Admin only
};

export default apiClient;