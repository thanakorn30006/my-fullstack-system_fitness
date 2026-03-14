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

    const styles = {
        wrapper: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f4f4f4', padding: '40px 20px' },
        card: { maxWidth: '450px', width: '100%', background: '#fff', padding: '40px', borderRadius: '24px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' },
        header: { textAlign: 'center', marginBottom: '30px' },
        title: { fontSize: '28px', fontWeight: 'bold', color: '#111', marginBottom: '10px' },
        inputGroup: { marginBottom: '15px' },
        label: { display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: 'bold', color: '#555' },
        input: { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd', fontSize: '15px', boxSizing: 'border-box' },
        row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' },
        button: { 
            width: '100%', padding: '15px', background: '#ff6b00', color: '#fff', border: 'none', 
            borderRadius: '10px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' 
        },
        linkText: { marginTop: '20px', textAlign: 'center', color: '#666', fontSize: '14px' }
    };

    return (
        <div style={styles.wrapper}>
            <div style={styles.card}>
                <div style={styles.header}>
                    <div style={{ fontSize: '40px' }}>🔥</div>
                    <h2 style={styles.title}>เข้าร่วมกับเรา</h2>
                    <p style={{ color: '#888' }}>สร้างบัญชีเพื่อเริ่มจองคลาสและรับสิทธิพิเศษ</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={styles.row}>
                        <div>
                            <label style={styles.label}>ชื่อ</label>
                            <input
                                type="text"
                                placeholder="ชื่อจริง"
                                value={formData.u_name}
                                onChange={(e) => setFormData({ ...formData, u_name: e.target.value })}
                                required
                                style={styles.input}
                            />
                        </div>
                        <div>
                            <label style={styles.label}>นามสกุล</label>
                            <input
                                type="text"
                                placeholder="นามสกุล"
                                value={formData.u_lastName}
                                onChange={(e) => setFormData({ ...formData, u_lastName: e.target.value })}
                                required
                                style={styles.input}
                            />
                        </div>
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>เบอร์โทรศัพท์</label>
                        <input
                            type="text"
                            placeholder="08X-XXX-XXXX"
                            value={formData.u_phone}
                            onChange={(e) => setFormData({ ...formData, u_phone: e.target.value })}
                            required
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>อีเมล</label>
                        <input
                            type="email"
                            placeholder="email@example.com"
                            value={formData.u_email}
                            onChange={(e) => setFormData({ ...formData, u_email: e.target.value })}
                            required
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>กำหนดรหัสผ่าน</label>
                        <input
                            type="password"
                            placeholder="ระบุรหัสผ่าน 6 ตัวขึ้นไป"
                            value={formData.u_password}
                            onChange={(e) => setFormData({ ...formData, u_password: e.target.value })}
                            required
                            style={styles.input}
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoading} 
                        style={{ ...styles.button, background: isLoading ? '#ccc' : '#ff6b00' }}
                    >
                        {isLoading ? 'กำลังลงทะเบียน...' : 'สมัครสมาชิกเลย'}
                    </button>
                </form>

                <p style={styles.linkText}>
                    เป็นสมาชิกอยู่แล้ว? <Link to="/login" style={{ color: '#111', fontWeight: 'bold', textDecoration: 'none' }}>เข้าสู่ระบบที่นี่</Link>
                </p>
            </div>
        </div>
    );
}