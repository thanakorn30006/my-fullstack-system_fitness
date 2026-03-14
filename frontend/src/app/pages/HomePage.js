import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { packagesAPI } from '../api/client';

export default function HomePage() {
    const [packages, setPackages] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        packagesAPI.getAll()
            .then(res => setPackages(res.data.slice(0, 3))) // ดึงมาแค่ 3 ตัวอย่าง
            .catch(err => console.error("Failed to load packages on home page", err));
    }, []);

    // --- สไตล์การตกแต่ง ---
    const styles = {
        container: { fontFamily: 'sans-serif', backgroundColor: '#fff', minHeight: '100vh' },
        
        // 1. Hero Section (ส่วนหัว)
        hero: {
            height: '70vh',
            background: 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.8)), url("https://images.unsplash.com/photo-1534438327276-14e5300c3a48?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80")', // ภาพพื้นหลังยิมเท่ๆ
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: '#fff',
            textAlign: 'center',
            padding: '0 20px'
        },
        heroTitle: { fontSize: '56px', fontWeight: '900', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '2px' },
        heroSubtitle: { fontSize: '20px', marginBottom: '40px', color: '#ccc', maxWidth: '600px' },
        btnGroup: { display: 'flex', gap: '20px' },
        primaryBtn: { padding: '15px 35px', background: '#ff6b00', color: '#fff', textDecoration: 'none', borderRadius: '50px', fontWeight: 'bold', fontSize: '18px', transition: '0.3s', boxShadow: '0 4px 15px rgba(255,107,0,0.4)' },
        secondaryBtn: { padding: '15px 35px', border: '2px solid #fff', color: '#fff', textDecoration: 'none', borderRadius: '50px', fontWeight: 'bold', fontSize: '18px', transition: '0.3s' },

        // 2. Featured Section (ส่วนโชว์แพ็กเกจ)
        section: { padding: '80px 20px', maxWidth: '1200px', margin: '0 auto' },
        sectionTitle: { textAlign: 'center', fontSize: '32px', fontWeight: 'bold', marginBottom: '50px', position: 'relative', paddingBottom: '15px' },
        grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' },
        
        // การ์ดแพ็กเกจขนาดจิ๋ว (Preview Card)
        miniCard: {
            padding: '30px', borderRadius: '20px', background: '#fff', border: '1px solid #eee', textAlign: 'center',
            boxShadow: '0 10px 20px rgba(0,0,0,0.05)', transition: '0.3s'
        },
        pkgName: { fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' },
        pkgPrice: { fontSize: '28px', color: '#ff6b00', fontWeight: 'bold', marginBottom: '15px' },
        pkgDesc: { fontSize: '14px', color: '#666', marginBottom: '20px', height: '40px', overflow: 'hidden' }
    };

    return (
        <div style={styles.container}>
            {/* --- HERO SECTION --- */}
            <header style={styles.hero}>
                <h1 style={styles.heroTitle}>NO PAIN, <span style={{color: '#ff6b00'}}>NO GAIN</span></h1>
                <p style={styles.heroSubtitle}>
                    ยกระดับการออกกำลังกายของคุณด้วยระบบจัดการฟิตเนสที่ทันสมัยที่สุด 
                    จองคลาสออนไลน์ได้ง่ายๆ พร้อมเทรนเนอร์มืออาชีพดูแล
                </p>
                <div style={styles.btnGroup}>
                    <Link to="/classes" style={styles.primaryBtn} 
                        onMouseOver={(e) => e.target.style.transform = 'translateY(-5px)'}
                        onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}>
                        จองคลาสเรียน
                    </Link>
                    <Link to="/packages" style={styles.secondaryBtn}
                        onMouseOver={(e) => { e.target.style.background = '#fff'; e.target.style.color = '#000'; }}
                        onMouseOut={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#fff'; }}>
                        ดูแพ็กเกจ
                    </Link>
                </div>
            </header>

            {/* --- PACKAGES PREVIEW SECTION --- */}
            <section style={styles.section}>
                <h2 style={styles.sectionTitle}>
                    แพ็กเกจยอดนิยม
                    <div style={{width: '60px', h: '4px', background: '#ff6b00', position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', height: '4px', borderRadius: '2px'}}></div>
                </h2>
                
                <div style={styles.grid}>
                    {packages.map(pkg => (
                        <div key={pkg.id} style={styles.miniCard}
                            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
                            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                            <h3 style={styles.pkgName}>{pkg.name}</h3>
                            <p style={styles.pkgDesc}>{pkg.description}</p>
                            <p style={styles.pkgPrice}>{pkg.price.toLocaleString()} <span style={{fontSize: '16px'}}>฿</span></p>
                            <Link to="/packages" style={{color: '#ff6b00', fontWeight: 'bold', textDecoration: 'none', fontSize: '14px'}}>ดูรายละเอียดเพิ่มเติม &rarr;</Link>
                        </div>
                    ))}
                </div>

                <div style={{textAlign: 'center', marginTop: '50px'}}>
                    <p style={{color: '#888', marginBottom: '20px'}}>เริ่มสร้างรูปร่างที่สมบูรณ์แบบได้ตั้งแต่วันนี้</p>
                    <Link to="/packages" style={{color: '#111', fontWeight: 'bold', fontSize: '18px'}}>ดูแพ็กเกจทั้งหมดทั้งหมดที่นี่</Link>
                </div>
            </section>

            {/* --- FOOTER (Optional) --- */}
            <footer style={{padding: '40px 20px', textAlign: 'center', backgroundColor: '#111', color: '#666', fontSize: '14px'}}>
                &copy; 2026 Fitness System. PSU Hat Yai Project.
            </footer>
        </div>
    );
}