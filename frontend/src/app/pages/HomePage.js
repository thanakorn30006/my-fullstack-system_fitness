import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { packagesAPI } from '../api/client';

export default function HomePage() {
    const [packages, setPackages] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        packagesAPI.getAll()
            .then(res => setPackages(res.data.slice(0, 3))) // Show up to 3 packages
            .catch(err => console.error("Failed to load packages on home page", err));
    }, []);

    return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
            <h1 style={{ fontSize: '32px', marginBottom: '20px' }}>ยินดีต้อนรับสู่ Fitness System</h1>
            <p style={{ marginBottom: '30px', color: '#666' }}>ระบบจองคลาสและจัดการสมาชิกแบบเรียบง่าย</p>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '50px' }}>
                <Link to="/classes" style={{ padding: '10px 20px', background: '#000', color: '#fff', textDecoration: 'none', borderRadius: '4px' }}>
                    จองคลาสเรียน
                </Link>
                <Link to="/packages" style={{ padding: '10px 20px', border: '1px solid #000', color: '#000', textDecoration: 'none', borderRadius: '4px' }}>
                    ดูแพ็กเกจทั้งหมด
                </Link>
            </div>


        </div>
    );
}