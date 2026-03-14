'use client';

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import Layout from '../components/Layout';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ClassesPage from './pages/ClassesPage';
import MyBookingsPage from './pages/MyBookingsPage';
import PackagesPage from './pages/PackagesPage';
import AdminPage from './pages/AdminPage';
import ProfilePage from './pages/ProfilePage';
import TrainersPage from './pages/TrainersPage';
import PaymentPage from './pages/PaymentPage';

export default function App() {
  const [mounted, setMounted] = useState(false);

  // ป้องกันการทำงานของ Router บน Server Side (Hydration)
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            {/* Public */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/classes" element={<ClassesPage />} />
            <Route path="/packages" element={<PackagesPage />} />
            <Route path="/payment/:packageId" element={<PaymentPage />} />
            <Route path="/trainers" element={<TrainersPage />} />

            {/* Private */}
            <Route path="/my-bookings" element={<MyBookingsPage />} />
            <Route path="/profile" element={<ProfilePage />} />

            {/* Admin */}
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}
