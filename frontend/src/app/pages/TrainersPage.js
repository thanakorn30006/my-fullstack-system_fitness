import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // เพิ่มชิ้นส่วนนี้สำหรับเปลี่ยนหน้า
import { trainersAPI } from '../api/client';
import Swal from 'sweetalert2';

export default function TrainersPage() {
    const [trainers, setTrainers] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate(); // เรียกใช้งานตัวเปลี่ยนหน้า

    useEffect(() => {
        trainersAPI.getAll()
            .then(res => {
                setTrainers(res.data);
                setLoading(false);
            })
            .catch(() => {
                Swal.fire({ icon: 'error', title: 'ผิดพลาด', text: 'โหลดข้อมูลเทรนเนอร์ล้มเหลว' });
                setLoading(false);
            });
    }, []);

    const styles = {
        container: { maxWidth: '1200px', margin: '0 auto', padding: '60px 20px' },
        header: { textAlign: 'center', marginBottom: '60px' },
        title: { fontSize: '40px', fontWeight: '900', color: '#111', textTransform: 'uppercase', marginBottom: '15px' },
        subtitle: { fontSize: '18px', color: '#666', maxWidth: '600px', margin: '0 auto' },
        
        grid: { 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
            gap: '30px' 
        },
        
        card: { 
            background: '#fff', 
            borderRadius: '25px', 
            padding: '40px 30px', 
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(0,0,0,0.05)', 
            border: '1px solid #f0f0f0',
            transition: '0.3s ease',
            cursor: 'default'
        },
        
        imageCircle: { 
            width: '120px', 
            height: '120px', 
            borderRadius: '50%', 
            background: 'linear-gradient(45deg, #ff6b00, #ff8e3c)', 
            margin: '0 auto 25px',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontSize: '48px', 
            color: '#fff',
            fontWeight: 'bold',
            boxShadow: '0 8px 20px rgba(255,107,0,0.3)',
            overflow: 'hidden'
        },
        
        trainerName: { fontSize: '24px', fontWeight: 'bold', color: '#111', marginBottom: '10px' },
        specialtyBadge: { 
            display: 'inline-block',
            padding: '6px 18px', 
            background: '#fff5eb', 
            color: '#ff6b00', 
            borderRadius: '50px', 
            fontSize: '13px', 
            fontWeight: 'bold',
            marginBottom: '20px'
        },
        bioText: { 
            fontSize: '14px', 
            color: '#777', 
            lineHeight: '1.6', 
            minHeight: '60px' 
        },
        
        footer: {
            marginTop: '30px',
            paddingTop: '20px',
            borderTop: '1px solid #f5f5f5'
        },
        contactBtn: {
            background: '#111',
            color: '#fff',
            border: 'none',
            width: '100%',
            padding: '12px',
            borderRadius: '12px',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '15px',
            transition: '0.3s'
        }
    };

    if (loading) return (
        <div style={{ padding: '100px', textAlign: 'center', fontSize: '20px', color: '#666' }}>
            กำลังโหลดรายชื่อเทรนเนอร์...
        </div>
    );

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h2 style={styles.title}>EXPERT <span style={{color: '#ff6b00'}}>TRAINERS</span></h2>
                <p style={styles.subtitle}>พบกับทีมผู้เชี่ยวชาญที่จะเปลี่ยนคุณให้เป็นคนใหม่</p>
                <div style={{ width: '60px', height: '4px', background: '#ff6b00', margin: '20px auto', borderRadius: '10px' }}></div>
            </div>

            <div style={styles.grid}>
                {trainers.map(t => (
                    <div 
                        key={t.id} 
                        style={styles.card}
                        onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'translateY(-12px)';
                            e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.1)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.05)';
                        }}
                    >
                        <div style={styles.imageCircle}>
                            {t.tr_imageUrl ? (
                                <img src={t.tr_imageUrl} alt={t.name} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                            ) : (
                                t.name?.charAt(0).toUpperCase()
                            )}
                        </div>

                        <h3 style={styles.trainerName}>{t.name}</h3>
                        <div style={styles.specialtyBadge}>{t.specialty}</div>
                        
                        <p style={styles.bioText}>{t.bio || 'ยังไม่มีข้อมูลประวัติเทรนเนอร์'}</p>

                        <div style={styles.footer}>
                            <button 
                                style={styles.contactBtn}
                                /* --- จุดที่แก้ไข: เมื่อคลิก ให้ไปที่หน้าคลาสเรียนพร้อมส่ง ID ไปกรอง --- */
                                onClick={() => navigate(`/classes?trainer=${t.id}`)}
                                onMouseOver={(e) => e.target.style.background = '#ff6b00'}
                                onMouseOut={(e) => e.target.style.background = '#111'}
                            >
                                ดูคลาสที่สอน
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}