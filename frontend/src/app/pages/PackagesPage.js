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
            // 1. โหลดแพ็กเกจทั้งหมดก่อน (อันนี้ต้องรอด)
            const pkgsRes = await packagesAPI.getAll();
            setPackages(pkgsRes.data);

            // 2. ถ้ามีการล็อกอิน ค่อยไปเช็คแพ็กเกจส่วนตัว
            if (user) {
                try {
                    const activeRes = await packagesAPI.getMyActive();
                    setActivePackage(activeRes.data);
                } catch (activeErr) {
                    // ถ้าเช็คแพ็กเกจส่วนตัวพัง (เช่น API หาไม่เจอ) ให้เงียบไว้ ไม่ต้องให้เว็บพัง
                    console.warn("ไม่พบแพ็กเกจที่กำลังใช้งาน หรือ Token มีปัญหา");
                    setActivePackage(null);
                }
            } else {
                setActivePackage(null);
            }
        } catch (error) {
            alert('ไม่สามารถเชื่อมต่อฐานข้อมูลแพ็กเกจได้');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ padding: '50px', textAlign: 'center', fontSize: '18px' }}>กำลังโหลดข้อมูลแพ็กเกจ...</div>;

    // --- ส่วนของการตกแต่ง CSS (Inline Styles) ---
    const styles = {
        container: { maxWidth: '1100px', margin: '0 auto', padding: '50px 20px', fontFamily: 'sans-serif' },
        header: { textAlign: 'center', marginBottom: '50px' },
        title: { fontSize: '36px', fontWeight: 'bold', color: '#111', marginBottom: '10px' },
        subtitle: { fontSize: '16px', color: '#666' },
        grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' },
        card: { 
            border: '1px solid #eaeaea', borderRadius: '16px', padding: '30px', 
            background: '#fff', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', 
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
        },
        cardTitle: { fontSize: '24px', fontWeight: 'bold', color: '#222', marginTop: '0' },
        cardDesc: { color: '#666', fontSize: '15px', lineHeight: '1.6', minHeight: '50px' },
        priceBox: { background: '#fafafa', padding: '20px', borderRadius: '12px', textAlign: 'center', margin: '20px 0' },
        price: { fontSize: '32px', fontWeight: 'bold', color: '#ff6b00', margin: '0' },
        duration: { fontSize: '14px', color: '#888', margin: '5px 0 0 0' },
        button: (isActive) => ({
            padding: '15px', borderRadius: '10px', border: 'none', 
            background: isActive ? '#e0e0e0' : '#ff6b00', 
            color: isActive ? '#888' : '#fff', 
            fontWeight: 'bold', fontSize: '16px', width: '100%', 
            cursor: isActive ? 'not-allowed' : 'pointer'
        })
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>แพ็กเกจสมาชิก</h1>
                <p style={styles.subtitle}>เลือกแพ็กเกจที่เหมาะสมกับเป้าหมายของคุณ เพื่อสุขภาพและรูปร่างที่ดีขึ้น</p>
            </div>
            
            <div style={styles.grid}>
                {packages.map(pkg => (
                    <div key={pkg.id} style={styles.card}>
                        <div>
                            <h3 style={styles.cardTitle}>{pkg.name}</h3>
                            <p style={styles.cardDesc}>{pkg.description}</p>
                            
                            <div style={styles.priceBox}>
                                <p style={styles.price}>{pkg.price.toLocaleString()} <span style={{fontSize: '18px', color: '#111'}}>บาท</span></p>
                                <p style={styles.duration}>ระยะเวลา {pkg.duration} วัน</p>
                            </div>
                        </div>
                        
                        <button
                            onClick={() => navigate(`/payment/${pkg.id}`)}
                            disabled={!!activePackage}
                            style={styles.button(!!activePackage)}
                        >
                            {activePackage ? 'คุณมีแพ็กเกจที่ใช้งานอยู่แล้ว' : 'สมัครสมาชิก'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}