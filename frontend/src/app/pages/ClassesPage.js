import React, { useState, useEffect } from 'react';
import { classesAPI, bookingsAPI } from '../api/client';
import { useAuth } from '../AuthContext';

export default function ClassesPage() {
    const { user } = useAuth();
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewDate, setViewDate] = useState(new Date());

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        try {
            const response = await classesAPI.getAll();
            setClasses(response.data);
        } catch (error) {
            alert('ไม่สามารถโหลดข้อมูลคลาสได้');
        } finally {
            setLoading(false);
        }
    };

    const handleBook = async (classId) => {
        if (!user) {
            alert('กรุณาเข้าสู่ระบบก่อนจอง');
            return;
        }
        try {
            await bookingsAPI.createBooking(classId);
            alert('จองสำเร็จ!');
            fetchClasses();
        } catch (error) {
            alert(error.response?.data?.error || 'จองไม่สำเร็จ');
        }
    };

    // Calendar logic
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
    const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

    const monthNames = [
        "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
        "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
    ];

    const calendarContainerStyle = {
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '40px 20px',
    };

    const calendarHeaderStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
    };

    const dayHeaderStyle = {
        padding: '10px',
        textAlign: 'center',
        fontWeight: 'bold',
        backgroundColor: '#f8f9fa',
        border: '1px solid #eee'
    };

    const dayCellStyle = {
        minHeight: '120px',
        padding: '5px',
        border: '1px solid #eee',
        backgroundColor: '#fff',
        position: 'relative'
    };

    const renderCalendar = () => {
        const days = [];
        const dayLabels = ["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"];

        // Headers
        dayLabels.map(label => days.push(
            <div key={`header-${label}`} style={dayHeaderStyle}>{label}</div>
        ));

        // Empty cells for previous month
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<div key={`empty-${i}`} style={{ ...dayCellStyle, backgroundColor: '#fdfdfd' }}></div>);
        }

        // Days of current month
        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = new Date(year, month, d).toDateString();
            const classesOnDay = classes.filter(c => new Date(c.schedule).toDateString() === dateStr);

            days.push(
                <div key={d} style={dayCellStyle}>
                    <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '5px' }}>{d}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {classesOnDay.map(cls => {
                            const available = cls.capacity - (cls._count?.bookings || 0);
                            const isFull = available <= 0;
                            return (
                                <div key={cls.id} style={{
                                    fontSize: '11px',
                                    padding: '4px',
                                    backgroundColor: isFull ? '#ffebeb' : '#ffffffff',
                                    borderRadius: '4px',
                                    border: `1px solid ${isFull ? '#ffc4c4' : '#000000ff'}`,
                                    color: isFull ? '#cf1322' : '#000000ff'
                                }}>
                                    <strong>{cls.name}</strong>
                                    <br />
                                    {new Date(cls.schedule).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    <br />
                                    ว่าง {available}/{cls.capacity}
                                    <button
                                        onClick={() => handleBook(cls.id)}
                                        disabled={isFull}
                                        style={{
                                            display: 'block',
                                            width: '100%',
                                            marginTop: '4px',
                                            padding: '2px',
                                            fontSize: '10px',
                                            backgroundColor: isFull ? '#ccc' : '#000',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '2px',
                                            cursor: isFull ? 'not-allowed' : 'pointer'
                                        }}
                                    >
                                        {isFull ? 'เต็ม' : 'จอง'}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        }

        return days;
    };

    if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>กำลังโหลด...</div>;

    return (
        <div style={calendarContainerStyle}>
            <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>ตารางคลาสเรียน</h1>

            <div style={calendarHeaderStyle}>
                <button onClick={prevMonth} style={{ padding: '8px 16px', cursor: 'pointer' }}>เดือนก่อนหน้า</button>
                <h2 style={{ margin: 0 }}>{monthNames[month]} {year + 543}</h2>
                <button onClick={nextMonth} style={{ padding: '8px 16px', cursor: 'pointer' }}>เดือนถัดไป</button>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                borderTop: '1px solid #eee',
                borderLeft: '1px solid #eee',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
            }}>
                {renderCalendar()}
            </div>


        </div>
    );
}