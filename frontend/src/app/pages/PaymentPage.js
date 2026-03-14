import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { packagesAPI } from '../api/client';

export default function PaymentPage() {
    const { packageId } = useParams();
    const navigate = useNavigate();
    const [pkg, setPkg] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        packagesAPI.getAll().then(res => {
            const found = res.data.find(p => p.id === parseInt(packageId));
            if (!found) {
                alert('ไม่พบข้อมูลแพ็กเกจ');
                navigate('/packages');
            } else {
                setPkg(found);
            }
        });
    }, [packageId]);

    const handleConfirm = async () => {
        setIsProcessing(true);
        try {
            await packagesAPI.subscribe(pkg.id);
            alert('ชำระเงินสำเร็จ!');
            navigate('/profile');
        } catch (error) {
            alert(error.response?.data?.error || 'เกิดข้อผิดพลาด');
        } finally {
            setIsProcessing(false);
        }
    };

    if (!pkg) return <div style={{ padding: '20px' }}>กำลังโหลดคูปอง...</div>;

    return (
        <div>
            <h2>ยืนยันการชำระเงิน</h2>
            <div>
                <p>แพ็กเกจ: <strong>{pkg.name}</strong></p>
                <p>ราคาที่ต้องชำระ: <strong>{pkg.price} บาท</strong></p>
                <p>ระยะเวลา: {pkg.duration} วัน</p>
            </div>

            <p>
                * ในระบบตัวอย่างนี้ การกดปุ่มด้านล่างจะถือว่าเป็นการชำระเงินสำเร็จทันที
            </p>

            <div>
                <button
                    onClick={handleConfirm}
                    disabled={isProcessing}
                >
                    {isProcessing ? 'กำลังประมวลผล...' : 'ยืนยันชำระเงิน'}
                </button>
                <button onClick={() => navigate(-1)}>
                    ยกเลิก
                </button>
            </div>
        </div>
    );
}