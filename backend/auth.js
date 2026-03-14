const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./db');
require('dotenv').config();

// Middleware เช็ค Token (ส่งออกไปให้ไฟล์อื่นใช้ได้ด้วย)
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = decoded;
        next();
    });
};

// 1. Register
router.post('/register', async (req, res) => {
    try {
        const { u_name, u_lastName, u_phone, u_email, u_password } = req.body;
        if (!u_name || !u_email || !u_password) {
            return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
        }

        const hashedPassword = await bcrypt.hash(u_password, 10);
        const sql = `INSERT INTO User (u_name, u_lastName, u_phone, u_email, u_password) VALUES (?, ?, ?, ?, ?)`;

        console.log('Register request body:', req.body);
        db.query(sql, [u_name, u_lastName, u_phone, u_email, hashedPassword], (err, results) => {
            if (err) {
                console.error('Registration SQL Error:', err);
                if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'อีเมลนี้ถูกใช้งานแล้ว' });
                return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการสมัครสมาชิก: ' + err.message });
            }
            res.status(201).json({ message: 'สมัครสมาชิกสำเร็จ!' });
        });
    } catch (error) {
        res.status(500).json({ error: 'Server Error' });
    }
});

// 2. Login
router.post('/login', (req, res) => {
    const { u_email, u_password } = req.body;
    if (!u_email || !u_password) return res.status(400).json({ error: 'กรุณากรอกอีเมลและรหัสผ่าน' });

    db.query(`SELECT * FROM User WHERE u_email = ?`, [u_email], async (err, results) => {
        if (err) return res.status(500).json({ error: 'Database Error' });
        if (results.length === 0) return res.status(401).json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });

        const user = results[0];
        const isMatch = await bcrypt.compare(u_password, user.u_password);
        if (!isMatch) return res.status(401).json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });

        const token = jwt.sign(
            { u_id: user.u_id, u_role: user.u_role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            message: 'เข้าสู่ระบบสำเร็จ',
            token,
            user: { u_id: user.u_id, u_name: user.u_name, u_lastName: user.u_lastName, u_role: user.u_role }
        });
    });
});

// 3. Session
router.get('/session', authenticateToken, (req, res) => {
    db.query(`SELECT u_id, u_name, u_lastName, u_email, u_role FROM User WHERE u_id = ?`, [req.user.u_id], (err, results) => {
        if (err) return res.status(500).json({ error: 'Database Error' });
        if (results.length === 0) return res.status(404).json({ error: 'ไม่พบผู้ใช้งาน' });
        res.json({ user: results[0] });
    });
});

// Middleware เช็คว่าเป็น Admin หรือไม่
const requireAdmin = (req, res, next) => {
    if (!req.user || String(req.user.u_role).toUpperCase() !== 'ADMIN') {
        return res.status(403).json({ error: 'Access denied: Admin only' });
    }
    next();
};

// ส่งออกทั้ง router และตัวเช็ค Token
module.exports = { router, authenticateToken, requireAdmin };