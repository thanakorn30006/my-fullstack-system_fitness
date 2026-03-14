import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { packagesAPI, bookingsAPI } from '../api/client';

export default function ProfilePage() {
    const { user } = useAuth();
    const [history, setHistory] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            Promise.all([
                packagesAPI.getHistory(),
                bookingsAPI.getMyBookings()
            ]).then(([histRes, bookRes]) => {
                setHistory(histRes.data);
                setBookings(bookRes.data);
                setLoading(false);
            }).catch(err => {
                console.error('Failed to load profile data', err);
                setLoading(false);
            });
        }
    }, [user]);

    if (!user) return <div style={{ padding: '20px', textAlign: 'center' }}>กรุณาเข้าสู่ระบบ</div>;
    if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>กำลังโหลด...</div>;

    const containerStyle = {
        maxWidth: '800px',
        margin: '0 auto',
        padding: '40px 20px',
    };

    const tableStyle = {
        width: '100%',
        borderCollapse: 'collapse',
        marginBottom: '30px',
        backgroundColor: '#fff'
    };

    const headerStyle = {
        backgroundColor: '#f8f9fa',
        textAlign: 'left'
    };

    return (
        <div style={containerStyle}>
            <h1 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px' }}>ข้อมูลส่วนตัว</h1>
            
            <div style={{ marginBottom: '40px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '4px' }}>
                <p><strong>ชื่อ-นามสกุล:</strong> {user.u_name} {user.u_lastName}</p>
                <p><strong>บทบาท:</strong> {user.u_role}</p>
            </div>

            <h3>ประวัติการจองคลาส</h3>
            <table border="1" style={tableStyle}>
                <thead>
                    <tr style={headerStyle}>
                        <th style={{ padding: '12px' }}>คลาส</th>
                        <th style={{ padding: '12px' }}>วันที่จอง</th>
                        <th style={{ padding: '12px' }}>สถานะ</th>
                    </tr>
                </thead>
                <tbody>
                    {bookings.length > 0 ? bookings.map(b => (
                        <tr key={b.id}>
                            <td style={{ padding: '12px' }}>{b.c_name}</td>
                            <td style={{ padding: '12px' }}>{new Date(b.c_schedule).toLocaleString()}</td>
                            <td style={{ padding: '12px' }}>{"ยืนยันแล้ว"}</td>
                        </tr>
                    )) : (
                        <tr><td colSpan="3" style={{ padding: '20px', textAlign: 'center' }}>ยังไม่มีประวัติการจอง</td></tr>
                    )}
                </tbody>
            </table>

            <h3>ประวัติแพ็กเกจ</h3>
            <table border="1" style={tableStyle}>
                <thead>
                    <tr style={headerStyle}>
                        <th style={{ padding: '12px' }}>แพ็กเกจ</th>
                        <th style={{ padding: '12px' }}>ราคา</th>
                        <th style={{ padding: '12px' }}>วันเริ่ม</th>
                        <th style={{ padding: '12px' }}>วันหมดอายุ</th>
                    </tr>
                </thead>
                <tbody>
                    {history.length > 0 ? history.map(h => (
                        <tr key={h.id}>
                            <td style={{ padding: '12px' }}>{h.name}</td>
                            <td style={{ padding: '12px' }}>{h.price.toLocaleString()} บ.</td>
                            <td style={{ padding: '12px' }}>{new Date(h.startDate).toLocaleDateString()}</td>
                            <td style={{ padding: '12px' }}>{new Date(h.endDate).toLocaleDateString()}</td>
                        </tr>
                    )) : (
                        <tr><td colSpan="4" style={{ padding: '20px', textAlign: 'center' }}>ยังไม่มีประวัติแพ็กเกจ</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}