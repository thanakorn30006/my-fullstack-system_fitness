import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import Swal from 'sweetalert2';

export default function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const result = await login(email, password);
            if (result.success) {
                Swal.fire({ icon: 'success', title: 'ยินดีต้อนรับ!', text: 'เข้าสู่ระบบสำเร็จ', timer: 1500, showConfirmButton: false });
                navigate('/');
            } else {
                Swal.fire({ icon: 'error', title: 'เข้าสู่ระบบไม่สำเร็จ', text: result.error || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
            }
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้' });
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
            <div style={{ background: '#fff', padding: '40px', borderRadius: '20px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', width: '400px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>เข้าสู่ระบบ</h2>
                <form onSubmit={handleSubmit}>
                    <input type="email" placeholder="อีเมล" style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #ddd' }} value={email} onChange={e => setEmail(e.target.value)} required />
                    <input type="password" placeholder="รหัสผ่าน" style={{ width: '100%', padding: '12px', marginBottom: '20px', borderRadius: '8px', border: '1px solid #ddd' }} value={password} onChange={e => setPassword(e.target.value)} required />
                    <button type="submit" style={{ width: '100%', padding: '12px', background: '#111', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>ยืนยัน</button>
                </form>
                <p style={{ textAlign: 'center', marginTop: '20px' }}>ยังไม่มีบัญชี? <Link to="/register" style={{ color: '#ff6b00', textDecoration: 'none' }}>สมัครสมาชิก</Link></p>
            </div>
        </div>
    );
}