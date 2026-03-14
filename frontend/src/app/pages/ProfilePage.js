import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { bookingsAPI, packagesAPI, classesAPI, trainersAPI } from '../api/client';
import { useAuth } from '../AuthContext';
import Swal from 'sweetalert2';

export default function ProfilePage() {
    const { user } = useAuth();
    const navigate = useNavigate(); 
    const [bookings, setBookings] = useState([]);
    const [history, setHistory] = useState([]);
    const [classes, setClasses] = useState([]);
    const [trainers, setTrainers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProfileData();
    }, []);

    const fetchProfileData = async () => {
        try {
            const [bRes, hRes, cRes, tRes] = await Promise.all([
                bookingsAPI.getMyBookings(),
                packagesAPI.getHistory(),
                classesAPI.getAll(),
                trainersAPI.getAll()
            ]);
            setBookings(bRes.data || []);
            setHistory(hRes.data || []);
            setClasses(cRes.data || []);
            setTrainers(tRes.data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    // แยกคลาส: กำลังจะมาถึง vs ที่จบไปแล้ว
    const now = new Date();
    const upcomingBookings = bookings.filter(b => new Date(b.c_schedule) >= now);
    const pastBookings = bookings.filter(b => new Date(b.c_schedule) < now);

    const handleCancelBooking = (id, className) => {
        Swal.fire({
            title: 'ยืนยันการยกเลิก?',
            text: `คลาส ${className} จะถูกถอนออกจากการจองของคุณ`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ff4d4f',
            cancelButtonColor: '#111',
            confirmButtonText: 'ยืนยัน',
            cancelButtonText: 'กลับ',
            borderRadius: '20px'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await bookingsAPI.cancelBooking(id);
                    Swal.fire({ icon: 'success', title: 'ยกเลิกคลาสสำเร็จ', showConfirmButton: false, timer: 1500 })
                    .then(() => fetchProfileData());
                } catch (e) {
                    Swal.fire('ผิดพลาด', 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้', 'error');
                }
            }
        });
    };

    const handleCancelPkg = () => {
        Swal.fire({
            title: 'ยกเลิกแพ็กเกจ?',
            text: "คุณจะเสียสิทธิ์การเข้าใช้งานทันที ยืนยันหรือไม่?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ff4d4f',
            cancelButtonColor: '#111',
            confirmButtonText: 'ยกเลิกแพ็กเกจ',
            cancelButtonText: 'กลับ',
            borderRadius: '20px'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await packagesAPI.cancelActive();
                    Swal.fire({ icon: 'success', title: 'ยกเลิกแพ็กเกจสำเร็จ', showConfirmButton: false, timer: 2000 })
                    .then(() => navigate('/')); // แก้ปัญหา 404 โดยการใช้ navigate
                } catch (e) {
                    Swal.fire('ผิดพลาด', 'ไม่สามารถยกเลิกแพ็กเกจได้', 'error');
                }
            }
        });
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '100px', fontSize: '20px', fontFamily: 'Prompt' }}>กำลังโหลดข้อมูล...</div>;

    const styles = {
        container: { maxWidth: '1100px', margin: '0 auto', padding: '40px 20px', fontFamily: 'Prompt' },
        headerCard: {
            background: 'linear-gradient(135deg, #111 0%, #333 100%)',
            color: '#fff', padding: '40px', borderRadius: '30px',
            display: 'flex', alignItems: 'center', gap: '30px', marginBottom: '40px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
        },
        avatar: {
            width: '100px', height: '100px', borderRadius: '50%', background: '#ff6b00',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', fontWeight: '900',
            boxShadow: '0 0 20px rgba(255,107,0,0.4)'
        },
        sectionTitle: { fontSize: '22px', fontWeight: '700', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' },
        
        // กล่อง Card (ใช้ร่วมกันทั้ง Class และ Package)
        card: (borderColor) => ({
            background: '#fff', padding: '25px', borderRadius: '20px', marginBottom: '15px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            boxShadow: '0 4px 15px rgba(0,0,0,0.03)', borderLeft: `6px solid ${borderColor}`
        }),

        // ✅ ปรับปรุงปุ่มยกเลิก ให้ไม่มีกรอบดำขัดใจแบบแน่นอน
        cancelBtn: { 
            padding: '12px 20px', background: '#fff1f0', color: '#ff4d4f', 
            borderRadius: '12px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', transition: '0.3s',
            // --- จุดที่แก้ไข: กำหนดให้ไม่มีกรอบอย่างชัดเจน ---
            border: 'none', 
            outline: 'none',
            // --- จุดที่แก้ไข: เพิ่ม box-shadow เล็กน้อยเพื่อให้ปุ่มดูเด่นขึ้น ---
            boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
        },

        historyLabel: { fontSize: '14px', color: '#888', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '60px', marginBottom: '25px' },
        historyBox: { background: '#fcfcfc', padding: '20px', borderRadius: '15px', border: '1px solid #f0f0f0' }
    };

    return (
        <div style={styles.container}>
            {/* ... (ส่วน Header เดิม) ... */}
            <div style={styles.headerCard}>
                <div style={styles.avatar}>{user?.u_name?.charAt(0).toUpperCase()}</div>
                <div>
                    <h1 style={{ margin: 0, fontSize: '30px', fontWeight: '900' }}>{user?.u_name} {user?.u_lastName}</h1>
                    <p style={{ color: '#ff6b00', fontWeight: 'bold', margin: '5px 0', textTransform: 'uppercase' }}>{user?.u_role || 'Member'}</p>
                </div>
            </div>

            {/* ... (ส่วน Upcoming Classes เดิม) ... */}
            <div style={{ marginBottom: '50px' }}>
                <h2 style={styles.sectionTitle}>🗓️ คลาสที่กำลังจะมาถึง</h2>
                {upcomingBookings.length > 0 ? upcomingBookings.map(b => {
                    const classDetail = classes.find(c => (c.id || c.c_id) == b.classId);
                    const trainer = trainers.find(t => (t.id || t.tr_id) == classDetail?.tr_id);

                    return (
                        <div key={b.id} style={styles.card('#ff6b00')}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>{b.c_name}</h3>
                                <div style={{ display: 'flex', gap: '20px', marginTop: '10px', color: '#666', fontSize: '14px' }}>
                                    <span>📅 {new Date(b.c_schedule).toLocaleDateString('th-TH', { dateStyle: 'long' })}</span>
                                    <span>🕒 {new Date(b.c_schedule).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.</span>
                                    {trainer && <span style={{ color: '#ff6b00', fontWeight: 'bold' }}>👤 ครู: {trainer.tr_name || trainer.name}</span>}
                                </div>
                            </div>
                            <button 
                                onClick={() => handleCancelBooking(b.id, b.c_name)} 
                                style={styles.cancelBtn}
                                onMouseOver={(e) => e.target.style.background = '#ffccc7'}
                                onMouseOut={(e) => e.target.style.background = '#fff1f0'}
                            >
                                ยกเลิกการจอง
                            </button>
                        </div>
                    );
                }) : <p style={{ color: '#999', textAlign: 'center', padding: '20px' }}>ยังไม่มีคลาสที่จองไว้</p>}
            </div>

            {/* ... (ส่วน Active Package เดิม) ... */}
            <div style={{ marginBottom: '50px' }}>
                <h2 style={styles.sectionTitle}>💳 แพ็กเกจที่ใช้งานอยู่</h2>
                {history.length > 0 ? history.slice(0, 1).map(pkg => (
                    <div key={pkg.id} style={styles.card('#047481')}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>{pkg.name}</h3>
                            <div style={{ display: 'flex', gap: '25px', marginTop: '10px', color: '#666', fontSize: '14px' }}>
                                <span>💰 ราคา: <strong style={{ color: '#ff6b00' }}>{parseFloat(pkg.price).toLocaleString()} ฿</strong></span>
                                <span>⌛ หมดอายุ: <strong>{new Date(pkg.endDate).toLocaleDateString('th-TH')}</strong></span>
                            </div>
                        </div>
                        <button 
                            onClick={handleCancelPkg} 
                            style={styles.cancelBtn}
                            onMouseOver={(e) => e.target.style.background = '#ffccc7'}
                            onMouseOut={(e) => e.target.style.background = '#fff1f0'}
                        >
                            ยกเลิกแพ็กเกจ
                        </button>
                    </div>
                )) : <p style={{ color: '#999', textAlign: 'center', padding: '20px' }}>คุณยังไม่มีแพ็กเกจที่ใช้งานอยู่</p>}
            </div>

            {/* ... (ส่วน History Section เดิม) ... */}
            <div style={{ borderTop: '2px solid #f5f5f5', marginTop: '60px', paddingTop: '20px' }}>
                <div style={styles.historyLabel}>📜 ประวัติการใช้งาน (History)</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                    
                    {/* ประวัติคลาส */}
                    <div style={styles.historyBox}>
                        <h4 style={{ fontSize: '16px', marginBottom: '15px' }}>คลาสที่เรียนจบแล้ว</h4>
                        {pastBookings.length > 0 ? pastBookings.map(b => (
                            <div key={b.id} style={{ padding: '12px 0', borderBottom: '1px solid #eee' }}>
                                <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{b.c_name}</div>
                                <div style={{ color: '#999', fontSize: '12px' }}>{new Date(b.c_schedule).toLocaleDateString('th-TH')}</div>
                            </div>
                        )) : <span style={{ fontSize: '13px', color: '#ccc' }}>ไม่มีประวัติการเข้าเรียน</span>}
                    </div>

                    {/* ประวัติแพ็กเกจ */}
                    <div style={styles.historyBox}>
                        <h4 style={{ fontSize: '16px', marginBottom: '15px' }}>แพ็กเกจที่เคยใช้งาน</h4>
                        {history.slice(1).length > 0 ? history.slice(1).map(h => (
                            <div key={h.id} style={{ padding: '12px 0', borderBottom: '1px solid #eee' }}>
                                <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{h.name}</div>
                                <div style={{ color: '#999', fontSize: '12px' }}>หมดอายุเมื่อ: {new Date(h.endDate).toLocaleDateString('th-TH')}</div>
                            </div>
                        )) : <span style={{ fontSize: '13px', color: '#ccc' }}>ไม่มีประวัติแพ็กเกจเก่า</span>}
                    </div>

                </div>
            </div>
        </div>
    );
}