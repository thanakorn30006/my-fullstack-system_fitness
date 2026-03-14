import React, { useState, useEffect } from 'react';
import { classesAPI, packagesAPI, trainersAPI } from '../api/client';
import { useAuth } from '../AuthContext';
import Swal from 'sweetalert2';

export default function AdminPage() {
    const { user } = useAuth();
    const [data, setData] = useState({ classes: [], packages: [], trainers: [] });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('classes');

    useEffect(() => { 
        if (user?.u_role === 'ADMIN') fetchData(); 
    }, [user]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [cRes, pRes, tRes] = await Promise.all([
                classesAPI.getAll(), 
                packagesAPI.getAllAdmin(), 
                trainersAPI.getAll()
            ]);
            setData({ 
                classes: cRes.data || [], 
                packages: pRes.data || [], 
                trainers: tRes.data || [] 
            });
        } catch (e) { 
            console.error(e); 
        } finally { 
            setLoading(false); 
        }
    };

    // --- 🎨 Template สำหรับ Modal (สวย สม่ำเสมอ และสมมาตร) ---
    const handleOpenModal = (type, item = null) => {
        const isEdit = !!item;
        let title = isEdit ? `แก้ไข${type}` : `เพิ่ม${type}ใหม่`;
        
        // สไตล์กลางสำหรับ Input/Select ใน SweetAlert เพื่อความ Consistency
        const commonStyle = `width: 85%; margin: 12px auto; display: block; padding: 14px; border-radius: 12px; border: 1px solid #e0e0e0; font-family: 'Prompt', sans-serif; outline: none; box-sizing: border-box; font-size: 15px; background: #fafafa;`;
        const textareaStyle = `${commonStyle} height: 120px; resize: none;`;

        let html = '';
        if (type === 'คลาสเรียน') {
            html = `
                <div style="padding-top: 15px;">
                    <input id="swal-name" style="${commonStyle}" placeholder="ชื่อคลาสเรียน" value="${item?.c_name || item?.name || ''}">
                    <input id="swal-cap" type="number" style="${commonStyle}" placeholder="ความจุ (จำนวนที่นั่ง)" value="${item?.c_capacity || item?.capacity || ''}">
                    <input id="swal-date" type="datetime-local" style="${commonStyle}" value="${item?.c_schedule || item?.schedule ? new Date(item.c_schedule || item.schedule).toLocaleString('sv-SE').slice(0, 16) : ''}">
                    <select id="swal-trainer" style="${commonStyle}">
                        <option value="">-- เลือกเทรนเนอร์ --</option>
                        ${data.trainers.map(t => `
                            <option value="${t.tr_id || t.id}" ${ (item?.tr_id || item?.trainerId) == (t.tr_id || t.id) ? 'selected' : ''}>${t.tr_name || t.name}</option>
                        `).join('')}
                    </select>
                </div>
            `;
        } else if (type === 'แพ็กเกจ') {
            html = `
                <div style="padding-top: 15px;">
                    <input id="swal-name" style="${commonStyle}" placeholder="ชื่อแพ็กเกจสมาชิก" value="${item?.name || ''}">
                    <input id="swal-price" type="number" style="${commonStyle}" placeholder="ราคา (บาท)" value="${item?.price || ''}">
                    <input id="swal-duration" type="number" style="${commonStyle}" placeholder="ระยะเวลาแพ็คเกจ (วัน)" value="${item?.durationMonths || ''}">
                    <textarea id="swal-desc" style="${textareaStyle}" placeholder="ดีเทลหรือคำอธิบายแพ็กเกจ">${item?.description || ''}</textarea>
                </div>
            `;
        } else if (type === 'เทรนเนอร์') {
            html = `
                <div style="padding-top: 15px;">
                    <input id="swal-name" style="${commonStyle}" placeholder="ชื่อ-นามสกุล เทรนเนอร์" value="${item?.tr_name || item?.name || ''}">
                    <input id="swal-special" style="${commonStyle}" placeholder="ความเชี่ยวชาญพิเศษ (เช่น Boxing, Yoga)" value="${item?.tr_specialty || item?.specialty || ''}">
                    <textarea id="swal-bio" style="${textareaStyle}" placeholder="ประวัติการทำงานหรือคำแนะนำตัว">${item?.tr_bio || item?.bio || ''}</textarea>
                </div>
            `;
        }

        Swal.fire({
            title: `<span style="font-family: 'Prompt'; font-weight: 800; font-size: 24px;">${title}</span>`,
            html: html,
            showCancelButton: true,
            confirmButtonText: 'บันทึกข้อมูล',
            confirmButtonColor: '#ff6b00',
            cancelButtonText: 'ยกเลิก',
            cancelButtonColor: '#aaa',
            borderRadius: '25px',
            focusConfirm: false,
            preConfirm: () => {
                const values = { name: document.getElementById('swal-name').value };
                if (type === 'คลาสเรียน') {
                    values.capacity = document.getElementById('swal-cap').value;
                    values.schedule = document.getElementById('swal-date').value;
                    values.trainerId = document.getElementById('swal-trainer').value;
                } else if (type === 'แพ็กเกจ') {
                    values.price = document.getElementById('swal-price').value;
                    values.duration = document.getElementById('swal-duration').value;
                    values.description = document.getElementById('swal-desc').value;
                } else if (type === 'เทรนเนอร์') {
                    values.specialty = document.getElementById('swal-special').value;
                    values.bio = document.getElementById('swal-bio').value;
                }
                if (!values.name) return Swal.showValidationMessage('กรุณากรอกข้อมูลให้ครบถ้วน');
                return values;
            }
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const id = item?.id || item?.c_id || item?.tr_id;
                    if (type === 'คลาสเรียน') {
                        isEdit ? await classesAPI.update(id, result.value) : await classesAPI.create(result.value);
                    } else if (type === 'แพ็กเกจ') {
                        isEdit ? await packagesAPI.update(id, result.value) : await packagesAPI.create(result.value);
                    } else if (type === 'เทรนเนอร์') {
                        isEdit ? await trainersAPI.update(id, result.value) : await trainersAPI.create(result.value);
                    }
                    Swal.fire({ icon: 'success', title: 'บันทึกสำเร็จ!', timer: 1200, showConfirmButton: false, borderRadius: '20px' });
                    fetchData();
                } catch (e) {
                    Swal.fire({ icon: 'error', title: 'ผิดพลาด', text: 'ไม่สามารถส่งข้อมูลไปที่เซิร์ฟเวอร์ได้' });
                }
            }
        });
    };

    const handleDelete = (type, id) => {
        Swal.fire({
            title: 'ต้องการลบข้อมูลนี้?',
            text: "ข้อมูลจะถูกลบถาวรและไม่สามารถกู้คืนได้",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ff4d4f',
            confirmButtonText: 'ยืนยันการลบ',
            cancelButtonText: 'ยกเลิก',
            borderRadius: '20px'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    if (type === 'classes') await classesAPI.delete(id);
                    if (type === 'packages') await packagesAPI.delete(id);
                    if (type === 'trainers') await trainersAPI.delete(id);
                    fetchData();
                    Swal.fire({ icon:'success', title:'ลบเรียบร้อย', timer:1000, showConfirmButton:false });
                } catch (e) { Swal.fire('ผิดพลาด', 'ไม่สามารถลบรายการนี้ได้', 'error'); }
            }
        });
    };

    if (user?.u_role !== 'ADMIN') return <div style={{textAlign:'center', padding:'100px', fontFamily:'Prompt'}}>🚫 Access Denied</div>;
    if (loading) return <div style={{textAlign:'center', padding:'100px', fontFamily:'Prompt'}}>กำลังเชื่อมต่อฐานข้อมูล...</div>;

    const styles = {
        sidebarBtn: (active) => ({
            width:'100%', padding:'18px 30px', textAlign:'left', color:'#fff', 
            border:'none', outline:'none', cursor:'pointer',
            background: active ? '#ff6b00' : 'transparent', 
            fontWeight: active ? 'bold' : 'normal', transition:'0.3s'
        }),
        actionBtn: (color) => ({
            color: color, fontWeight:'bold', background:'none', border:'none', 
            outline: 'none', cursor:'pointer', marginLeft:'15px', fontSize:'14px'
        }),
        addBtn: {
            padding:'12px 25px', background:'#111', color:'#fff', 
            border:'none', outline: 'none', borderRadius:'12px', 
            fontWeight:'bold', cursor:'pointer', transition:'0.2s'
        }
    };

    return (
        <div style={{display:'flex', minHeight:'calc(100vh - 70px)', fontFamily:'Prompt'}}>
            {/* Sidebar */}
            <div style={{width:'280px', background:'#111', color:'#fff'}}>
                <div style={{padding:'40px 30px', borderBottom:'1px solid #222'}}>
                    <h3 style={{margin:0, color:'#ff6b00', letterSpacing:'1.5px', fontSize:'20px'}}>ADMIN PANEL</h3>
                </div>
                <button onClick={() => setActiveTab('classes')} style={styles.sidebarBtn(activeTab === 'classes')}>🏋️ จัดการคลาสเรียน</button>
                <button onClick={() => setActiveTab('packages')} style={styles.sidebarBtn(activeTab === 'packages')}>💳 จัดการแพ็กเกจ</button>
                <button onClick={() => setActiveTab('trainers')} style={styles.sidebarBtn(activeTab === 'trainers')}>👤 จัดการเทรนเนอร์</button>
            </div>

            {/* Main Content Area */}
            <div style={{flexGrow:1, padding:'50px', background:'#f8f9fa'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'40px'}}>
                    <h2 style={{margin:0, fontWeight:'900', fontSize:'32px', color:'#111'}}>จัดการ{activeTab === 'classes' ? 'คลาสเรียน' : activeTab === 'packages' ? 'แพ็กเกจ' : 'เทรนเนอร์'}</h2>
                    <button onClick={() => handleOpenModal(activeTab === 'classes' ? 'คลาสเรียน' : activeTab === 'packages' ? 'แพ็กเกจ' : 'เทรนเนอร์')} style={styles.addBtn} onMouseOver={(e) => e.target.style.background='#333'} onMouseOut={(e) => e.target.style.background='#111'}>
                        + เพิ่มข้อมูลใหม่
                    </button>
                </div>

                <div style={{background:'#fff', padding:'35px', borderRadius:'30px', boxShadow:'0 15px 45px rgba(0,0,0,0.04)'}}>
                    <table style={{width:'100%', borderCollapse:'collapse'}}>
                        <thead>
                            <tr style={{textAlign:'left', color:'#aaa', borderBottom:'2px solid #f5f5f5', fontSize:'14px', textTransform:'uppercase', letterSpacing:'1px'}}>
                                <th style={{padding:'15px 20px'}}>ชื่อรายการ</th>
                                {activeTab === 'classes' && <th style={{padding:'15px 20px'}}>เทรนเนอร์ผู้สอน</th>}
                                {activeTab === 'packages' && <th style={{padding:'15px 20px'}}>ราคาค่าบริการ</th>}
                                <th style={{padding:'15px 20px', textAlign:'right'}}>จัดการข้อมูล</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data[activeTab].map(item => (
                                <tr key={item.id || item.c_id || item.tr_id} style={{borderBottom:'1px solid #fcfcfc'}} onMouseOver={(e) => e.currentTarget.style.background='#fbfbfb'} onMouseOut={(e) => e.currentTarget.style.background='transparent'}>
                                    <td style={{padding:'20px', fontWeight:'700', color:'#333'}}>{item.c_name || item.name || item.tr_name}</td>
                                    
                                    {/* ✅ FIXED: ชื่อ Trainer ขึ้นแน่นอน โดยการเปรียบเทียบทั้ง ID และ trainerId */}
                                    {activeTab === 'classes' && (
                                        <td style={{padding:'20px', color:'#666'}}>
                                            {(() => {
                                                const trainer = data.trainers.find(t => (t.tr_id || t.id) == (item.tr_id || item.trainerId));
                                                return trainer ? (trainer.tr_name || trainer.name) : <span style={{color:'#ccc'}}>ยังไม่ระบุ</span>;
                                            })()}
                                        </td>
                                    )}
                                    
                                    {activeTab === 'packages' && <td style={{padding:'20px', color:'#ff6b00', fontWeight:'bold', fontSize:'16px'}}>{parseFloat(item.price).toLocaleString()} ฿</td>}
                                    
                                    <td style={{padding:'20px', textAlign:'right'}}>
                                        <button onClick={() => handleOpenModal(activeTab === 'classes' ? 'คลาสเรียน' : activeTab === 'packages' ? 'แพ็กเกจ' : 'เทรนเนอร์', item)} style={styles.actionBtn('#047481')}>แก้ไข</button>
                                        <button onClick={() => handleDelete(activeTab, item.id || item.c_id || item.tr_id)} style={styles.actionBtn('#ff4d4f')}>ลบ</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}