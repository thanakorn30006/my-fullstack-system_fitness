import React, { useState, useEffect } from 'react';
import { bookingsAPI } from '../api/client';
import Swal from 'sweetalert2';

export default function MyBookingsPage() {
    const [bookings, setBookings] = useState([]);

    useEffect(() => { fetchBookings(); }, []);

    const fetchBookings = async () => {
        const response = await bookingsAPI.getMyBookings();
        setBookings(response.data);
    };

    const handleCancel = (id) => {
        Swal.fire({
            title: 'ยกเลิกการจอง?',
            text: "ต้องการยกเลิกคลาสนี้ใช่หรือไม่?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ff4d4f',
            cancelButtonColor: '#333',
            confirmButtonText: 'ยืนยันยกเลิก',
            cancelButtonText: 'กลับ'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await bookingsAPI.cancelBooking(id);
                    Swal.fire({ icon: 'success', title: 'ยกเลิกสำเร็จ', timer: 1500, showConfirmButton: false });
                    fetchBookings();
                } catch (e) { Swal.fire('Error', 'ยกเลิกไม่สำเร็จ', 'error'); }
            }
        });
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '50px 20px' }}>
            <h1 style={{ textAlign: 'center' }}>การจองของฉัน</h1>
            {bookings.map(b => (
                <div key={b.id} style={{ background: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                    <div>
                        <h3 style={{ margin: 0 }}>{b.c_name}</h3>
                        <p style={{ margin: '5px 0', color: '#666' }}>{new Date(b.c_schedule).toLocaleString('th-TH')}</p>
                    </div>
                    <button onClick={() => handleCancel(b.id)} style={{ padding: '10px 15px', background: '#fff1f0', color: '#ff4d4f', border: '1px solid #ffccc7', borderRadius: '8px', fontWeight: 'bold' }}>ยกเลิก</button>
                </div>
            ))}
        </div>
    );
}