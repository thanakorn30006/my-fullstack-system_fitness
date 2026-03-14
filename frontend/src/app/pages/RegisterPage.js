import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function RegisterPage() {
    const navigate = useNavigate();
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        u_name: '',
        u_lastName: '',
        u_phone: '',
        u_email: '',
        u_password: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const result = await register(
                formData.u_name,
                formData.u_lastName,
                formData.u_phone,
                formData.u_email,
                formData.u_password
            );
            if (result.success) {
                alert('สมัครสมาชิกสำเร็จ!');
                navigate('/login');
            } else {
                alert(result.error || 'ไม่สามารถสมัครได้');
            }
        } catch (error) {
            alert('เกิดข้อผิดพลาด');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
            <h2>สมัครสมาชิก</h2>
            <form onSubmit={handleSubmit}>
                {['u_name', 'u_lastName', 'u_phone', 'u_email'].map(field => (
                    <div key={field} style={{ marginBottom: '10px' }}>
                        <label>{field.replace('u_', '')}:</label><br />
                        <input
                            type={field === 'u_email' ? 'email' : 'text'}
                            value={formData[field]}
                            onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                            required
                            style={{ width: '100%', padding: '8px' }}
                        />
                    </div>
                ))}
                <div style={{ marginBottom: '15px' }}>
                    <label>รหัสผ่าน:</label><br />
                    <input
                        type="password"
                        value={formData.u_password}
                        onChange={(e) => setFormData({ ...formData, u_password: e.target.value })}
                        required
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>
                <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '10px', background: '#000', color: '#fff' }}>
                    สมัครสมาชิก
                </button>
            </form>
            <p style={{ marginTop: '15px', textAlign: 'center' }}>
                มีบัญชีอยู่แล้ว? <Link to="/login">เข้าสู่ระบบ</Link>
            </p>
        </div>
    );
}