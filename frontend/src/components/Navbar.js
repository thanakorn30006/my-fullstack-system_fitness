import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../app/AuthContext';

export default function Navbar() {
    const { user, logout } = useAuth();
    const location = useLocation();

    // Helper to highlight active link
    const getLinkStyle = (path) => ({
        textDecoration: 'none',
        color: location.pathname === path ? '#4a545ead' : '#000',
        fontWeight: location.pathname === path ? 'bold' : 'normal'
    });

    return (
        <nav style={styles.nav}>
            <Link to="/" style={styles.logo}>
                FITNESS SYSTEM
            </Link>

            <div style={styles.navLinks}>
                <Link to="/" style={getLinkStyle('/')}>หน้าแรก</Link>
                <Link to="/classes" style={getLinkStyle('/classes')}>คลาสเรียน</Link>
                <Link to="/trainers" style={getLinkStyle('/trainers')}>เทรนเนอร์</Link>
                <Link to="/packages" style={getLinkStyle('/packages')}>แพ็กเกจ</Link>

                {user ? (
                    <>
                        <Link to="/my-bookings" style={getLinkStyle('/my-bookings')}>การจองของฉัน</Link>
                        <Link to="/profile" style={getLinkStyle('/profile')}>
                            {user.u_name}
                        </Link>

                        {user.u_role === 'ADMIN' && (
                            <Link to="/admin" style={{ ...getLinkStyle('/admin'), color: 'red' }}>
                                แอดมิน
                            </Link>
                        )}

                        <button onClick={logout} style={styles.logoutBtn}>
                            ออกจากระบบ
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" style={getLinkStyle('/login')}>เข้าสู่ระบบ</Link>
                        <Link to="/register" style={getLinkStyle('/register')}>สมัครสมาชิก</Link>
                    </>
                )}
            </div>
        </nav>
    );
}

const styles = {
    nav: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '15px 20px',
        borderBottom: '1px solid #ccc',
        background: '#fff'
    },
    logo: {
        fontWeight: 'bold',
        fontSize: '20px',
        textDecoration: 'none',
        color: '#000'
    },
    navLinks: {
        display: 'flex',
        alignItems: 'center',
        gap: '20px'
    },
    logoutBtn: {
        background: '#f8f9fa',
        border: '1px solid #ccc',
        padding: '5px 10px',
        borderRadius: '4px',
        cursor: 'pointer'
    }
};