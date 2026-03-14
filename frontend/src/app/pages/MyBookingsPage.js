import React, { useState, useEffect } from 'react';
import { bookingsAPI } from '../api/client';
import { useAuth } from '../AuthContext';

export default function MyBookingsPage() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            const response = await bookingsAPI.getMyBookings();
            setBookings(response.data);
        } catch (error) {
            alert('ไม่สามารถโหลดข้อมูลการจองได้');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id) => {
        if (window.confirm('ยืนยันการยกเลิกการจอง?')) {
            try {
                await bookingsAPI.cancelBooking(id);
                alert('ยกเลิกแล้ว');
                fetchBookings();
            } catch (error) {
                alert(error.response?.data?.error || 'ยกเลิกไม่สำเร็จ');
            }
        }
    };

    if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>กำลังโหลด...</div>;

    const containerStyle = {
        maxWidth: '800px',
        margin: '0 auto',
        padding: '40px 20px',
    };

    return (
        <div style={containerStyle}>
            <h1 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px', marginBottom: '30px' }}>การจองของฉัน</h1>
            
            <table border="1" style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f8f9fa', textAlign: 'left' }}>
                        <th style={{ padding: '12px' }}>คลาส</th>
                        <th style={{ padding: '12px' }}>วันที่/เวลา</th>
                        <th style={{ padding: '12px' }}>การจัดการ</th>
                    </tr>
                </thead>
                <tbody>
                    {bookings.length > 0 ? bookings.map(b => (
                        <tr key={b.id}>
                            <td style={{ padding: '12px' }}>{b.c_name}</td>
                            <td style={{ padding: '12px' }}>{new Date(b.c_schedule).toLocaleString()}</td>
                            <td style={{ padding: '12px' }}>
                                <button onClick={() => handleCancel(b.id)}>ยกเลิก</button>
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan="3" style={{ padding: '20px', textAlign: 'center' }}>ยังไม่มีประวัติการจอง</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}