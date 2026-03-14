import React, { useState, useEffect } from 'react';
import { classesAPI, packagesAPI, trainersAPI } from '../api/client';
import { useAuth } from '../AuthContext';

export default function AdminPage() {
    const { user } = useAuth();
    const [data, setData] = useState({ classes: [], packages: [], trainers: [] });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('classes');

    useEffect(() => {
        if (user?.u_role === 'ADMIN') {
            fetchData();
        }
    }, [user]);

    const fetchData = async () => {
        try {
            const [cRes, pRes, tRes] = await Promise.all([
                classesAPI.getAll(),
                packagesAPI.getAllAdmin(),
                trainersAPI.getAll()
            ]);
            setData({
                classes: cRes.data,
                packages: pRes.data,
                trainers: tRes.data
            });
        } catch (error) {
            console.error('Failed to load admin data', error);
        } finally {
            setLoading(false);
        }
    };

    if (user?.u_role !== 'ADMIN') return <div style={{ padding: '20px' }}>Access Denied</div>;
    if (loading) return <div style={{ padding: '20px' }}>Loading...</div>;

    // Fixed sidebar below Navbar
    const sidebarStyle = {
        width: '200px',
        borderRight: '1px solid #ddd',
        height: 'calc(100vh - 61px)', // Height minus Navbar
        padding: '20px',
        position: 'fixed',
        left: 0,
        top: '61px', // Start below Navbar
        backgroundColor: '#f8f9fa',
        zIndex: 10
    };

    const contentStyle = {
        marginLeft: '280px', // Shifted further right
        padding: '30px 60px 30px 30px', 
        marginTop: '20px',
        width: 'auto',
        flexGrow: 1
    };

    const navBtnStyle = (tab) => ({
        display: 'block',
        width: '100%',
        padding: '10px',
        marginBottom: '10px',
        textAlign: 'left',
        cursor: 'pointer',
        backgroundColor: activeTab === tab ? '#eee' : 'white',
        border: '1px solid #ccc',
        fontWeight: activeTab === tab ? 'bold' : 'normal'
    });

    return (
        <div style={{ display: 'flex' }}>
            {/* Simple Sidebar */}
            <div style={sidebarStyle}>
                <h3 style={{ marginTop: 0 }}>เมนูจัดการ</h3>
                <button style={navBtnStyle('classes')} onClick={() => setActiveTab('classes')}>จัดการคลาส</button>
                <button style={navBtnStyle('packages')} onClick={() => setActiveTab('packages')}>จัดการแพ็กเกจ</button>
                <button style={navBtnStyle('trainers')} onClick={() => setActiveTab('trainers')}>จัดการเทรนเนอร์</button>
            </div>

            {/* Content Area */}
            <div style={contentStyle}>
                <h1 style={{ marginTop: 0 }}>ระบบจัดการหลังบ้าน (Admin)</h1>
                <hr />
                {activeTab === 'classes' && <ClassesManager classes={data.classes} trainers={data.trainers} onRefresh={fetchData} />}
                {activeTab === 'packages' && <PackagesManager packages={data.packages} onRefresh={fetchData} />}
                {activeTab === 'trainers' && <TrainersManager trainers={data.trainers} onRefresh={fetchData} />}
            </div>
        </div>
    );
}

function ClassesManager({ classes, trainers, onRefresh }) {
    const [form, setForm] = useState({ name: '', capacity: 20, schedule: '', description: '', trainerId: '' });
    const [editingId, setEditingId] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await classesAPI.update(editingId, form);
                alert('แก้ไขสำเร็จ');
            } else {
                await classesAPI.create(form);
                alert('บันทึกสำเร็จ');
            }
            onRefresh();
            resetForm();
        } catch (err) { alert(err.response?.data?.error || 'Error'); }
    };

    const resetForm = () => {
        setForm({ name: '', capacity: 20, schedule: '', description: '', trainerId: '' });
        setEditingId(null);
    };

    const handleEdit = (c) => {
        setEditingId(c.id);
        // Format date for datetime-local input
        const date = new Date(c.schedule);
        const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
        setForm({
            name: c.name,
            capacity: c.capacity,
            schedule: localDate,
            description: c.description || '',
            trainerId: c.trainerId || ''
        });
    };

    return (
        <div>
            <h2>จัดการคลาส</h2>
            <form onSubmit={handleSubmit} style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ccc', backgroundColor: '#fff' }}>
                <h3 style={{ marginTop: 0 }}>{editingId ? 'แก้ไขข้อมูลคลาส' : 'เพิ่มคลาสใหม่'}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                    <div>
                        <label>ชื่อคลาส:</label><br />
                        <input style={{ width: '100%' }} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                    </div>
                    <div>
                        <label>ความจุ:</label><br />
                        <input style={{ width: '100%' }} type="number" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} required />
                    </div>
                    <div>
                        <label>เวลา:</label><br />
                        <input style={{ width: '100%' }} type="datetime-local" value={form.schedule} onChange={e => setForm({ ...form, schedule: e.target.value })} required />
                    </div>
                    <div>
                        <label>เทรนเนอร์:</label><br />
                        <select style={{ width: '100%' }} value={form.trainerId} onChange={e => setForm({ ...form, trainerId: e.target.value })} required>
                            <option value="">เลือกเทรนเนอร์</option>
                            {trainers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>
                </div>
                <div style={{ marginTop: '20px' }}>
                    <button type="submit">{editingId ? 'บันทึกการแก้ไข' : 'ตกลง'}</button>
                    {editingId && <button type="button" onClick={resetForm} style={{ marginLeft: '10px' }}>ยกเลิก</button>}
                </div>
            </form>

            <table border="1" style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f2f2f2', textAlign: 'left' }}>
                        <th style={{ padding: '10px' }}>คลาส</th>
                        <th style={{ padding: '10px' }}>เวลา</th>
                        <th style={{ padding: '10px' }}>จองแล้ว/ความจุ</th>
                        <th style={{ padding: '10px' }}>สถานะ</th>
                        <th style={{ padding: '10px' }}>จัดการ</th>
                    </tr>
                </thead>
                <tbody>
                    {classes.map(c => (
                        <tr key={c.id}>
                            <td style={{ padding: '10px' }}>{c.name}</td>
                            <td style={{ padding: '10px' }}>{new Date(c.schedule).toLocaleString()}</td>
                            <td style={{ padding: '10px' }}>{c._count?.bookings || 0}/{c.capacity}</td>
                            <td style={{ padding: '10px' }}>{c.isActive ? 'เปิด' : 'ปิด'}</td>
                            <td style={{ padding: '10px' }}>
                                <button onClick={() => handleEdit(c)}>แก้ไข</button>
                                <button onClick={() => classesAPI.toggle(c.id).then(onRefresh)} style={{ marginLeft: '5px' }}>สลับสถานะ</button>
                                <button onClick={() => window.confirm('ลบ?') && classesAPI.delete(c.id).then(onRefresh)} style={{ marginLeft: '5px' }}>ลบ</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function PackagesManager({ packages, onRefresh }) {
    const [form, setForm] = useState({ name: '', price: '', duration: 30, description: '' });
    const [editingId, setEditingId] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await packagesAPI.update(editingId, form);
                alert('แก้ไขสำเร็จ');
            } else {
                await packagesAPI.create(form);
                alert('สมัครสำเร็จ');
            }
            onRefresh();
            resetForm();
        } catch (err) { alert(err.response?.data?.error || 'Error'); }
    };

    const resetForm = () => {
        setForm({ name: '', price: '', duration: 30, description: '' });
        setEditingId(null);
    };

    const handleEdit = (p) => {
        setEditingId(p.id);
        setForm({
            name: p.name,
            price: p.price,
            duration: p.duration,
            description: p.description || ''
        });
    };

    return (
        <div>
            <h2>จัดการแพ็กเกจ</h2>
            <form onSubmit={handleSubmit} style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ccc', backgroundColor: '#fff' }}>
                <h3 style={{ marginTop: 0 }}>{editingId ? 'แก้ไขข้อมูลแพ็กเกจ' : 'เพิ่มแพ็กเกจ'}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                    <div>
                        <label>ชื่อ:</label><br />
                        <input style={{ width: '100%' }} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                    </div>
                    <div>
                        <label>ราคา:</label><br />
                        <input style={{ width: '100%' }} type="number" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
                    </div>
                    <div>
                        <label>วัน:</label><br />
                        <input style={{ width: '100%' }} type="number" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} required />
                    </div>
                </div>
                <div style={{ marginTop: '20px' }}>
                    <button type="submit">{editingId ? 'บันทึกการแก้ไข' : 'ตกลง'}</button>
                    {editingId && <button type="button" onClick={resetForm} style={{ marginLeft: '10px' }}>ยกเลิก</button>}
                </div>
            </form>

            <table border="1" style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f2f2f2', textAlign: 'left' }}>
                        <th style={{ padding: '10px' }}>ชื่อแพ็กเกจ</th>
                        <th style={{ padding: '10px' }}>ราคา (บาท)</th>
                        <th style={{ padding: '10px' }}>ระยะเวลา (วัน)</th>
                        <th style={{ padding: '10px' }}>จัดการ</th>
                    </tr>
                </thead>
                <tbody>
                    {packages.map(p => (
                        <tr key={p.id}>
                            <td style={{ padding: '10px' }}>{p.name}</td>
                            <td style={{ padding: '10px' }}>{p.price.toLocaleString()}</td>
                            <td style={{ padding: '10px' }}>{p.duration}</td>
                            <td style={{ padding: '10px' }}>
                                <button onClick={() => handleEdit(p)}>แก้ไข</button>
                                <button onClick={() => window.confirm('ลบ?') && packagesAPI.delete(p.id).then(onRefresh)} style={{ marginLeft: '5px', color: 'red' }}>ลบแพ็กเกจ</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function TrainersManager({ trainers, onRefresh }) {
    const [form, setForm] = useState({ name: '', specialty: '', bio: '' });
    const [editingId, setEditingId] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await trainersAPI.update(editingId, form);
                alert('แก้ไขสำเร็จ');
            } else {
                await trainersAPI.create(form);
                alert('สำเร็จ');
            }
            onRefresh();
            resetForm();
        } catch (err) { alert(err.response?.data?.error || 'Error'); }
    };

    const resetForm = () => {
        setForm({ name: '', specialty: '', bio: '' });
        setEditingId(null);
    };

    const handleEdit = (t) => {
        setEditingId(t.id);
        setForm({
            name: t.name,
            specialty: t.specialty,
            bio: t.bio || ''
        });
    };

    return (
        <div>
            <h2>จัดการเทรนเนอร์</h2>
            <form onSubmit={handleSubmit} style={{ marginBottom: '30px', padding: '20px', border: '1px solid #ccc', backgroundColor: '#fff' }}>
                <h3 style={{ marginTop: 0 }}>{editingId ? 'แก้ไขข้อมูลเทรนเนอร์' : 'เพิ่มเทรนเนอร์'}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                    <div>
                        <label>ชื่อ:</label><br />
                        <input style={{ width: '100%' }} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                    </div>
                    <div>
                        <label>งาน:</label><br />
                        <input style={{ width: '100%' }} value={form.specialty} onChange={e => setForm({ ...form, specialty: e.target.value })} required />
                    </div>
                </div>
                <div style={{ marginTop: '20px' }}>
                    <button type="submit">{editingId ? 'บันทึกการแก้ไข' : 'ตกลง'}</button>
                    {editingId && <button type="button" onClick={resetForm} style={{ marginLeft: '10px' }}>ยกเลิก</button>}
                </div>
            </form>

            <table border="1" style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#fff' }}>
                <thead>
                    <tr style={{ backgroundColor: '#f2f2f2', textAlign: 'left' }}>
                        <th style={{ padding: '10px' }}>ชื่อ-นามสกุล</th>
                        <th style={{ padding: '10px' }}>ความเชี่ยวชาญ</th>
                        <th style={{ padding: '10px' }}>จัดการ</th>
                    </tr>
                </thead>
                <tbody>
                    {trainers.map(t => (
                        <tr key={t.id}>
                            <td style={{ padding: '10px' }}>{t.name}</td>
                            <td style={{ padding: '10px' }}>{t.specialty}</td>
                            <td style={{ padding: '10px' }}>
                                <button onClick={() => handleEdit(t)}>แก้ไข</button>
                                <button onClick={() => window.confirm('ลบ?') && trainersAPI.delete(t.id).then(onRefresh)} style={{ marginLeft: '5px', color: 'red' }}>ลบข้อมูล</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
