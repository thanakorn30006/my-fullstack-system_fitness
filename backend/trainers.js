const express = require('express');
const router = express.Router();
const db = require('./db');

// (Optional) ถ้าต้องการให้เฉพาะ Admin ที่เพิ่ม/ลบเทรนเนอร์ได้ สามารถ Uncomment บรรทัดล่างนี้ไปใช้ได้ครับ
// const { authenticateToken, requireAdmin } = require('./auth');

// ==========================================
// 1. Get trainers (ดึงข้อมูลเทรนเนอร์ทั้งหมด)
// ==========================================
router.get('/all', (req, res) => {
    const sql = `
        SELECT tr_id AS id, tr_name AS name, tr_specialty AS specialty, 
        tr_bio AS bio, tr_imageUrl AS imageUrl, tr_createdAt AS createdAt 
        FROM trainer ORDER BY tr_createdAt DESC
    `;
    
    db.query(sql, (err, trainers) => {
        if (err) {
            console.error('GET TRAINERS error:', err);
            return res.status(500).json({ error: 'Failed' });
        }
        res.json(trainers);
    });
});

// ==========================================
// 2. Create trainer (แอดมินสร้างเทรนเนอร์ใหม่)
// ==========================================
// ตัวอย่างถ้าจะใส่เช็คสิทธิ์: router.post('/create', authenticateToken, requireAdmin, (req, res) => {
router.post('/create', (req, res) => {
    const { name, specialty, bio } = req.body;

    // เช็คข้อมูลเบื้องต้น
    if (!name || !specialty) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const insertSql = `
        INSERT INTO trainer (tr_name, tr_specialty, tr_bio, tr_imageUrl) 
        VALUES (?, ?, ?, ?)
    `;
    
    db.query(insertSql, [name, specialty, bio || null, null], (err, result) => {
        if (err) {
            console.error('CREATE TRAINER error:', err);
            return res.status(500).json({ error: 'Failed' });
        }

        const selectSql = `
            SELECT tr_id AS id, tr_name AS name, tr_specialty AS specialty, 
            tr_bio AS bio, tr_imageUrl AS imageUrl, tr_createdAt AS createdAt 
            FROM trainer WHERE tr_id = ?
        `;
        
        db.query(selectSql, [result.insertId], (err, rows) => {
            if (err) {
                console.error('CREATE TRAINER error (SELECT):', err);
                return res.status(500).json({ error: 'Failed' });
            }
            res.status(201).json(rows[0]);
        });
    });
});

// ==========================================
// 3. Update trainer (แอดมินแก้ไขข้อมูลเทรนเนอร์)
// ==========================================
router.put('/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { name, specialty, bio } = req.body;

    if (!name || !specialty) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const updateSql = `
        UPDATE trainer 
        SET tr_name = ?, tr_specialty = ?, tr_bio = ? 
        WHERE tr_id = ?
    `;
    
    db.query(updateSql, [name, specialty, bio || null, id], (err, result) => {
        if (err) {
            console.error('UPDATE TRAINER error:', err);
            return res.status(500).json({ error: 'Failed' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Trainer not found' });
        }

        res.json({ message: 'Trainer updated' });
    });
});

// ==========================================
// 4. Delete trainer (แอดมินลบเทรนเนอร์)
// ==========================================
// ตัวอย่างถ้าจะใส่เช็คสิทธิ์: router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
router.delete('/:id', (req, res) => {
    const id = parseInt(req.params.id);

    if (!id || isNaN(id)) {
        return res.status(400).json({ error: 'Invalid trainer id' });
    }

    db.query('DELETE FROM trainer WHERE tr_id = ?', [id], (err) => {
        if (err) {
            console.error('DELETE TRAINER error:', err);
            return res.status(500).json({ error: 'Failed' });
        }
        res.json({ message: 'Deleted' });
    });
});

module.exports = router;