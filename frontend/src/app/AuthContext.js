import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from './api/client';

// สร้าง Context
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // เช็ค Session ตอนเปิดเว็บ
    useEffect(() => {
        const token = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (token && savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (error) {
                console.error('Failed to parse user from localStorage', error);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    // ฟังก์ชันเข้าสู่ระบบ
    const login = async (email, password) => {
        try {
            const response = await authAPI.login({ u_email: email, u_password: password });
            const { token, user } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            setUser(user);

            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Login failed'
            };
        }
    };

    // ฟังก์ชันสมัครสมาชิก
    const register = async (name, lastName, phone, email, password) => {
        try {
            await authAPI.register({
                u_name: name,
                u_lastName: lastName,
                u_phone: phone,
                u_email: email,
                u_password: password
            });
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || 'Registration failed'
            };
        }
    };

    // ฟังก์ชันออกจากระบบ
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const value = {
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
    };

    return (
        <AuthContext.Provider value={value}>
            {/* ป้องกันหน้าเว็บกระพริบก่อนโหลด session เสร็จ */}
            {!loading && children}
        </AuthContext.Provider>
    );
};

// Hook สำหรับเรียกใช้งาน
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};