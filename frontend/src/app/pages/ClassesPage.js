import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { classesAPI, bookingsAPI, trainersAPI } from '../api/client';
import { useAuth } from '../AuthContext'; 
import Swal from 'sweetalert2';

export default function ClassesPage() {
    const { user } = useAuth();
    const { search } = useLocation();
    const [classes, setClasses] = useState([]);
    const [trainers, setTrainers] = useState([]);
    const [bookedIds, setBookedIds] = useState(new Set());
    const [currentDate, setCurrentDate] = useState(new Date());
    const [loading, setLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTrainer, setSelectedTrainer] = useState('');

    const today = new Date();
    const trainerFromQuery = new URLSearchParams(search).get('trainer');

    useEffect(() => {
        if (trainerFromQuery) setSelectedTrainer(trainerFromQuery);
        fetchData();
    }, [user, currentDate, trainerFromQuery]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [resClasses, resTrainers] = await Promise.all([
                classesAPI.getAll(),
                trainersAPI.getAll()
            ]);
            setClasses(resClasses.data || []);
            setTrainers(resTrainers.data || []);

            if (user) {
                const bookingRes = await bookingsAPI.getMyBookings();
                setBookedIds(new Set(bookingRes.data.map(b => b.classId)));
            }
        } catch (error) { console.error(error); } 
        finally { setLoading(false); }
    };

    // --- ระบบจองคลาสแบบ Pop-up รายละเอียด (แก้บัค NaN และชื่อเทรนเนอร์) ---
    const handleBook = (classItem) => {
        if (!user) {
            Swal.fire({ icon: 'warning', title: 'กรุณาเข้าสู่ระบบ', text: 'ต้องเข้าสู่ระบบก่อนจองคลาส', confirmButtonColor: '#ff6b00' });
            return;
        }

        // --- จุดที่แก้ไข: การค้นหาเทรนเนอร์ให้แม่นยำขึ้น ---
        // เราจะเช็คทั้ง t.tr_id และ t.id เพื่อรองรับทุกรูปแบบที่ API อาจจะส่งมา
        const trainer = trainers.find(t => 
            (t.tr_id && String(t.tr_id) === String(classItem.tr_id)) || 
            (t.id && String(t.id) === String(classItem.tr_id))
        );

        // ดึงชื่อออกมา ถ้าหาไม่เจอจริงๆ ให้ลองเช็คจากข้อมูลที่อาจจะติดมากับ classItem
        const displayName = trainer 
            ? (trainer.tr_name || trainer.name) 
            : "ไม่ระบุเทรนเนอร์";

        // คำนวณที่นั่ง (กัน NaN)
        const capacity = parseInt(classItem.c_capacity || classItem.capacity || 0);
        const bookedCount = parseInt(classItem._count?.bookings || 0);
        const remainingSeats = capacity - bookedCount;

        Swal.fire({
            title: '<span style="color: #ff6b00; font-family: Prompt">รายละเอียดการจอง</span>',
            html: `
                <div style="text-align: left; font-family: 'Prompt', sans-serif; line-height: 2;">
                    <p><strong>🏋️ คลาส:</strong> ${classItem.c_name || classItem.name}</p>
                    <p><strong>👤 เทรนเนอร์:</strong> <span style="color: #ff6b00; font-weight: bold;">${displayName}</span></p>
                    <p><strong>🕒 เวลา:</strong> ${new Date(classItem.c_schedule || classItem.schedule).toLocaleString('th-TH', { dateStyle: 'long', timeStyle: 'short' })} น.</p>
                    <p><strong>🪑 ที่ว่างคงเหลือ:</strong> ${remainingSeats} ที่นั่ง</p>
                </div>
            `,
            icon: 'info',
            showCancelButton: true,
            confirmButtonColor: '#111',
            cancelButtonColor: '#888',
            confirmButtonText: 'ยืนยันการจอง',
            cancelButtonText: 'ยกเลิก',
            borderRadius: '20px'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await bookingsAPI.createBooking(classItem.id || classItem.c_id);
                    Swal.fire({ icon: 'success', title: 'จองสำเร็จ!', text: 'เจอกันที่ยิมนะครับ!', timer: 2000, showConfirmButton: false });
                    fetchData();
                } catch (error) {
                    Swal.fire({ icon: 'error', title: 'จองไม่สำเร็จ', text: error.response?.data?.error || 'เกิดข้อผิดพลาด' });
                }
            }
        });
    };

    const filteredClasses = useMemo(() => {
        return classes.filter(c => {
            const className = (c.c_name || c.name || "").toString();
            const matchesSearch = className.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesTrainer = selectedTrainer === '' || c.tr_id == selectedTrainer;
            return matchesSearch && matchesTrainer;
        });
    }, [classes, searchTerm, selectedTrainer]);

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const dayNames = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];

    const styles = {
        filterSection: { display: 'flex', gap: '20px', marginBottom: '40px', flexWrap: 'wrap' },
        filterBox: { background: '#fff', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', flex: 1, minWidth: '300px' },
        input: { width: '100%', padding: '12px', marginTop: '8px', borderRadius: '10px', border: '1px solid #ddd', outline: 'none', fontFamily: 'Prompt' },
        calendarGrid: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridAutoRows: 'minmax(130px, auto)', gap: '1px', background: '#eee', border: '1px solid #eee', borderRadius: '25px', overflow: 'hidden' }
    };

    if (loading && classes.length === 0) return <div style={{ textAlign: 'center', padding: '100px', fontFamily: 'Prompt' }}>กำลังโหลดข้อมูล...</div>;

    return (
        <div style={{ padding: '40px', maxWidth: '1400px', margin: '0 auto', fontFamily: 'Prompt' }}>
            
            <div style={styles.filterSection}>
                <div style={styles.filterBox}>
                    <label style={{ fontWeight: 'bold', color: '#666' }}>🔍 ค้นหาคลาสเรียน</label>
                    <input style={styles.input} placeholder="พิมพ์ชื่อคลาส..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <div style={styles.filterBox}>
                    <label style={{ fontWeight: 'bold', color: '#666' }}>👤 เลือกเทรนเนอร์</label>
                    <select style={styles.input} value={selectedTrainer} onChange={(e) => setSelectedTrainer(e.target.value)}>
                        <option value="">เทรนเนอร์ทั้งหมด</option>
                        {trainers.map(t => <option key={t.id || t.tr_id} value={t.id || t.tr_id}>{t.tr_name || t.name}</option>)}
                    </select>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginBottom: '30px' }}>
                <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} style={{ background: '#eee', border: 'none', padding: '10px 15px', borderRadius: '10px', cursor: 'pointer' }}>←</button>
                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>{currentDate.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' })}</h2>
                <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} style={{ background: '#eee', border: 'none', padding: '10px 15px', borderRadius: '10px', cursor: 'pointer' }}>→</button>
            </div>

            <div style={styles.calendarGrid}>
                {dayNames.map(day => <div key={day} style={{ textAlign: 'center', padding: '15px', fontWeight: 'bold', background: '#fdfdfd', fontSize: '14px', color: '#555' }}>{day}</div>)}
                {[...Array(firstDayOfMonth)].map((_, i) => <div key={i} style={{ background: '#fff' }} />)}
                {[...Array(daysInMonth)].map((_, i) => {
                    const day = i + 1;
                    const isToday = day === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();
                    const dayClasses = filteredClasses.filter(c => {
                        const d = new Date(c.c_schedule || c.schedule);
                        return d.getDate() === day && d.getMonth() === currentDate.getMonth();
                    });

                    return (
                        <div key={day} style={{ background: '#fff', padding: '12px', border: isToday ? '2px solid #ff6b00' : 'none', minHeight: '130px' }}>
                            <div style={{ fontWeight: 'bold', fontSize: '14px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: isToday ? '#ff6b00' : 'transparent', color: isToday ? '#fff' : '#bbb', marginBottom: '10px' }}>{day}</div>
                            {dayClasses.map(c => {
                                const isBooked = bookedIds.has(c.id || c.c_id);
                                return (
                                    <div key={c.id || c.c_id} style={{ background: isBooked ? '#f5f5f5' : '#fff8f2', borderLeft: `4px solid ${isBooked ? '#ddd' : '#ff6b00'}`, padding: '10px', borderRadius: '10px', marginBottom: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' }}>
                                        <div style={{ fontSize: '12px', fontWeight: '700', color: isBooked ? '#aaa' : '#111' }}>{c.c_name || c.name}</div>
                                        <div style={{ fontSize: '10px', color: '#888', marginTop: '4px' }}>🕒 {new Date(c.c_schedule || c.schedule).getHours()}:00 น.</div>
                                        <button onClick={() => !isBooked && handleBook(c)} disabled={isBooked} style={{ width: '100%', marginTop: '8px', padding: '6px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', border: 'none', background: isBooked ? '#eee' : '#111', color: isBooked ? '#bbb' : '#fff', cursor: isBooked ? 'not-allowed' : 'pointer' }}>{isBooked ? '✓ จองแล้ว' : 'จองคลาส'}</button>
                                    </div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}