import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const result = await login(email, password);
            if (result.success) {
                alert('เข้าสู่ระบบสำเร็จ');
                navigate('/');
            } else {
                alert(result.error || 'อีเมลหรือรหัสผ่านไม่ถูกต้อง');
            }
        } catch (error) {
            alert('เกิดข้อผิดพลาดในการเชื่อมต่อ');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
            <h2>เข้าสู่ระบบ</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label>อีเมล:</label><br />
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label>รหัสผ่าน:</label><br />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>
                <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '10px', background: '#000', color: '#fff' }}>
                    {isLoading ? 'กำลังโหลด...' : 'ตกลง'}
                </button>
            </form>
            <p style={{ marginTop: '15px', textAlign: 'center' }}>
                ยังไม่มีบัญชี? <Link to="/register">สมัครสมาชิก</Link>
            </p>
        </div>
    );
}