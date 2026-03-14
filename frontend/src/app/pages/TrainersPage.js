import React, { useState, useEffect } from 'react';
import { trainersAPI } from '../api/client';

export default function TrainersPage() {
    const [trainers, setTrainers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        trainersAPI.getAll().then(res => {
            setTrainers(res.data);
            setLoading(false);
        }).catch(() => alert('โหลดข้อมูลเทรนเนอร์ผิดพลาด'));
    }, []);

    if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>กำลังโหลด...</div>;

    const containerStyle = {
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '20px',
    };

    return (
        <div style={containerStyle}>
            <h2>ทีมเทรนเนอร์</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                {trainers.map(t => (
                    <div key={t.id} style={{ border: '1px solid #ccc', padding: '15px', background: '#fff' }}>
                        <div style={{ height: '150px', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' }}>
                            {t.name.charAt(0)}
                        </div>
                        <h3>{t.name}</h3>
                        <p>ความสามารถ: {t.specialty}</p>
                        <p style={{ fontSize: '12px', color: '#666' }}>{t.bio}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}