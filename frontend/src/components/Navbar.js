import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../app/AuthContext';
import Swal from 'sweetalert2';

export default function Navbar() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        Swal.fire({
            title: 'ออกจากระบบ?',
            text: "คุณต้องการออกจากระบบใช่หรือไม่?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ff6b00',
            cancelButtonColor: '#333',
            confirmButtonText: 'ตกลง',
            cancelButtonText: 'ยกเลิก'
        }).then((result) => {
            if (result.isConfirmed) {
                logout();
                Swal.fire({ icon: 'success', title: 'ออกจากระบบแล้ว', timer: 1000, showConfirmButton: false });
                navigate('/');
            }
        });
    };

    const getLinkStyle = (path) => ({
        textDecoration: 'none',
        fontSize: '15px',
        fontWeight: '600',
        color: location.pathname === path ? '#ff6b00' : '#fff',
        padding: '8px 12px',
        transition: '0.3s'
    });

    const styles = {
        nav: {
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '0 40px', height: '70px', background: '#111', color: '#fff',
            position: 'sticky', top: 0, zIndex: 1000, boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
        },
        logo: { fontWeight: '900', fontSize: '22px', textDecoration: 'none', color: '#fff', letterSpacing: '1px' },
        navLinks: { display: 'flex', alignItems: 'center', gap: '5px' },
        userSection: {
            display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 15px',
            background: '#222', borderRadius: '50px', marginLeft: '10px', textDecoration: 'none', border: '1px solid #333'
        },
        avatar: {
            width: '30px', height: '30px', borderRadius: '50%', background: '#ff6b00',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold', color: '#fff'
        }
    };

    return (
        <nav style={styles.nav}>
            <Link to="/" style={styles.logo}>
                FITNESS <span style={{ color: '#ff6b00' }}>SYSTEM</span>
            </Link>

            <div style={styles.navLinks}>
                <Link to="/" style={getLinkStyle('/')}>หน้าแรก</Link>
                <Link to="/classes" style={getLinkStyle('/classes')}>คลาสเรียน</Link>
                <Link to="/trainers" style={getLinkStyle('/trainers')}>เทรนเนอร์</Link>
                <Link to="/packages" style={getLinkStyle('/packages')}>แพ็กเกจ</Link>

                {user ? (
                    <>
                        {/* --- ลบเมนูการจองออกเรียบร้อยแล้ว --- */}
                        
                        <Link to="/profile" style={styles.userSection}>
                            <div style={styles.avatar}>{user.u_name?.charAt(0).toUpperCase()}</div>
                            <span style={{ color: '#fff', fontSize: '14px', fontWeight: '600' }}>{user.u_name}</span>
                        </Link>

                        {user.u_role === 'ADMIN' && (
                            <Link to="/admin" style={{ ...getLinkStyle('/admin'), color: '#fff', background: '#444', borderRadius: '8px', marginLeft: '10px' }}>
                                ⚙️ แอดมิน
                            </Link>
                        )}

                        <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer', marginLeft: '10px', fontWeight: 'bold', fontSize: '13px' }}>
                            ออกจากระบบ
                        </button>
                    </>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginLeft: '10px' }}>
                        <Link to="/login" style={{ textDecoration: 'none', color: '#fff', fontWeight: 'bold', fontSize: '15px' }}>เข้าสู่ระบบ</Link>
                        <Link to="/register" style={{ textDecoration: 'none', background: '#ff6b00', color: '#fff', padding: '10px 25px', borderRadius: '50px', fontSize: '14px', fontWeight: 'bold' }}>
                            สมัครสมาชิก
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
}