import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { packagesAPI } from '../api/client';
import { useAuth } from '../AuthContext'; // 1. เพิ่มการนำเข้า useAuth
import Swal from 'sweetalert2';

export default function PaymentPage() {
    const { packageId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth(); // 2. ดึงสถานะ user ออกมาใช้งาน
    const [pkg, setPkg] = useState(null);

    useEffect(() => {
        packagesAPI.getAll().then(res => {
            const found = res.data.find(p => p.id === parseInt(packageId));
            if (!found) navigate('/packages');
            else setPkg(found);
        });
    }, [packageId, navigate]);

    // --- 🛠 แก้ไขฟังก์ชันยืนยันการชำระเงิน ---
    const handleConfirm = async () => {
        // เช็คก่อนเลยว่า Login หรือยัง?
        if (!user) {
            Swal.fire({
                icon: 'warning',
                title: 'กรุณาเข้าสู่ระบบ',
                text: 'คุณต้องเข้าสู่ระบบก่อนจึงจะสามารถซื้อแพ็กเกจได้ครับ',
                confirmButtonColor: '#ff6b00',
                confirmButtonText: 'ไปหน้าเข้าสู่ระบบ',
                showCancelButton: true,
                cancelButtonText: 'ยกเลิก',
                borderRadius: '20px'
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate('/login'); // พาไปหน้า Login ไม่ใช่ 404
                }
            });
            return; // หยุดการทำงานตรงนี้ ไม่ให้รันโค้ดชำระเงินข้างล่าง
        }

        // ถ้า Login แล้ว ทำงานตามปกติ
        try {
            await packagesAPI.subscribe(pkg.id);
            await Swal.fire({ 
                icon: 'success', 
                title: 'ชำระเงินสำเร็จ!', 
                confirmButtonColor: '#ff6b00',
                borderRadius: '20px'
            });
            navigate('/profile');
        } catch (error) {
            Swal.fire({ 
                icon: 'error', 
                title: 'ผิดพลาด', 
                text: error.response?.data?.error || 'ชำระเงินล้มเหลว',
                confirmButtonColor: '#111'
            });
        }
    };

    if (!pkg) return <div style={{textAlign:'center', padding:'100px', fontFamily: 'Prompt'}}>กำลังโหลดข้อมูล...</div>;

    const styles = {
        container: { display:'flex', justifyContent:'center', alignItems: 'center', minHeight: '80vh', padding:'50px', fontFamily: 'Prompt' },
        card: { background:'#fff', borderRadius:'30px', boxShadow:'0 20px 50px rgba(0,0,0,0.1)', width:'450px', overflow:'hidden' },
        header: { background:'#111', color:'#fff', padding:'30px', textAlign:'center' },
        body: { padding:'40px', textAlign:'center' },
        priceBox: { background:'#fff5eb', padding:'30px', borderRadius:'20px', margin:'25px 0' },
        confirmBtn: {
            width:'100%', padding:'16px', background:'#ff6b00', color:'#fff', 
            border:'none', outline: 'none', borderRadius:'15px', 
            fontWeight:'bold', fontSize:'18px', cursor:'pointer', transition: '0.3s'
        },
        cancelBtn: {
            marginTop:'20px', background:'none', border:'none', outline: 'none', 
            color:'#bbb', cursor:'pointer', fontSize:'15px', fontWeight: '500',
            transition: '0.2s', padding: '10px'
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.header}>
                    <h2 style={{margin:0, fontSize: '24px', fontWeight: '900'}}>ยืนยันการชำระเงิน</h2>
                </div>
                <div style={styles.body}>
                    <p style={{color: '#666'}}>คุณกำลังสมัครแพ็กเกจ:</p>
                    <h3 style={{fontSize: '20px', margin: '5px 0 20px 0', fontWeight: 'bold'}}>{pkg.name}</h3>
                    <div style={styles.priceBox}>
                        <div style={{fontSize:'42px', fontWeight:'900', color:'#111'}}>
                            {parseFloat(pkg.price).toLocaleString()} <span style={{fontSize: '24px'}}>฿</span>
                        </div>
                    </div>
                    <button 
                        onClick={handleConfirm} 
                        style={styles.confirmBtn}
                        onMouseOver={(e) => e.target.style.background = '#e66000'}
                        onMouseOut={(e) => e.target.style.background = '#ff6b00'}
                    >
                        ยืนยันชำระเงิน
                    </button>
                    <button 
                        onClick={() => navigate(-1)} 
                        style={styles.cancelBtn}
                        onMouseOver={(e) => e.target.style.color = '#111'}
                        onMouseOut={(e) => e.target.style.color = '#bbb'}
                    >
                        ยกเลิก
                    </button>
                </div>
            </div>
        </div>
    );
}