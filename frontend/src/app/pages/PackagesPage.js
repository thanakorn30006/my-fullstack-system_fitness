import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { packagesAPI } from '../api/client';
import { useAuth } from '../AuthContext';

export default function PackagesPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [packages, setPackages] = useState([]);
    const [activePackage, setActivePackage] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [pkgsRes, activeRes] = await Promise.all([
                packagesAPI.getAll(),
                user ? packagesAPI.getMyActive() : Promise.resolve({ data: null })
            ]);
            setPackages(pkgsRes.data);
            setActivePackage(activeRes.data);
        } catch (error) {
            alert('โหลดข้อมูลผิดพลาด');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>กำลังโหลด...</div>;

    const containerStyle = {
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '40px 20px',
    };

    return (
        <div style={containerStyle}>
            <h1 style={{ textAlign: 'center', marginBottom: '40px', borderBottom: '2px solid #eee', paddingBottom: '15px' }}>แพ็กเกจสมาชิก</h1>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px' }}>
                {packages.map(pkg => (
                    <div key={pkg.id} style={{ 
                        border: '1px solid #eee', 
                        padding: '30px', 
                        borderRadius: '12px', 
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        justifyContent: 'space-between', 
                        background: '#fff',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                    }}>
                        <div>
                            <h3 style={{ marginTop: '0', color: '#111', fontSize: '24px' }}>{pkg.name}</h3>
                            <p style={{ color: '#555', fontSize: '15px', minHeight: '60px', lineHeight: '1.6' }}>{pkg.description}</p>
                            <div style={{ margin: '25px 0', padding: '20px 0', borderTop: '1px solid #f0f0f0', borderBottom: '1px solid #f0f0f0' }}>
                                <p style={{ fontSize: '28px', color: '#000', margin: '0' }}><strong>{pkg.price.toLocaleString()} <span style={{fontSize: '16px', fontWeight: 'normal'}}>บาท</span></strong></p>
                                <p style={{ fontSize: '14px', color: '#888', margin: '5px 0 0 0' }}>ระยะเวลา {pkg.duration} วัน</p>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate(`/payment/${pkg.id}`)}
                            disabled={!!activePackage}
                            style={{ 
                                padding: '14px 20px', 
                                background: activePackage ? '#f0f0f0' : '#000', 
                                color: activePackage ? '#aaa' : '#fff', 
                                border: 'none', 
                                borderRadius: '8px', 
                                cursor: activePackage ? 'not-allowed' : 'pointer',
                                width: '100%',
                                fontWeight: 'bold',
                                fontSize: '16px',
                                transition: 'all 0.2s'
                            }}
                        >
                            {activePackage ? 'คุณมีแพ็กเกจที่ใช้งานอยู่แล้ว' : 'สมัครสมาชิก'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}