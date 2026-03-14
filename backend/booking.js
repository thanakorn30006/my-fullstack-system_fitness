const express = require('express');
const router = express.Router();
const db = require('./db');
const { authenticateToken } = require('./auth'); // ดึงตัวเช็ค Token จากไฟล์ auth.js มาใช้

// ==========================================
// 1. Create booking (สร้างการจอง)
// ==========================================
router.post('/', authenticateToken, (req, res) => {
    try {
        const { classId } = req.body;
        const userId = parseInt(req.user.u_id);
        const parsedClassId = parseInt(classId);

        if (!parsedClassId || isNaN(parsedClassId)) {
            return res.status(400).json({ error: 'Invalid classId' });
        }

        const today = new Date();
        const checkPackageSql = `SELECT mp_id FROM memberpackage WHERE u_id = ? AND mp_startDate <= ? AND mp_endDate >= ? LIMIT 1`;

        db.query(checkPackageSql, [userId, today, today], (err, packageRows) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            if (packageRows.length === 0) {
                return res.status(403).json({ error: 'You need an active package to book classes' });
            }

            db.beginTransaction((err) => {
                if (err) return res.status(500).json({ error: 'Transaction error' });

                const checkClassSql = `SELECT c.*, (SELECT COUNT(*) FROM booking b WHERE b.c_id = c.c_id) as _count_bookings FROM class c WHERE c.c_id = ? FOR UPDATE`;
                
                db.query(checkClassSql, [parsedClassId], (err, classRows) => {
                    if (err) return db.rollback(() => res.status(500).json({ error: 'Database error' }));

                    const fitnessClass = classRows[0];
                    if (!fitnessClass || !fitnessClass.c_isActive) {
                        return db.rollback(() => res.status(400).json({ error: 'Class not found or inactive' }));
                    }
                    if (new Date(fitnessClass.c_schedule) < today) {
                        return db.rollback(() => res.status(400).json({ error: 'Cannot book past classes' }));
                    }
                    if (parseInt(fitnessClass._count_bookings) >= fitnessClass.c_capacity) {
                        return db.rollback(() => res.status(400).json({ error: 'Class is full' }));
                    }

                    const checkExistingSql = 'SELECT b_id FROM booking WHERE u_id = ? AND c_id = ?';
                    db.query(checkExistingSql, [userId, parsedClassId], (err, existingRows) => {
                        if (err) return db.rollback(() => res.status(500).json({ error: 'Database error' }));
                        if (existingRows.length > 0) {
                            return db.rollback(() => res.status(400).json({ error: 'Already booked' }));
                        }

                        const insertBookingSql = 'INSERT INTO booking (u_id, c_id) VALUES (?, ?)';
                        db.query(insertBookingSql, [userId, parsedClassId], (err, insertResult) => {
                            if (err) return db.rollback(() => res.status(500).json({ error: 'Booking failed' }));
                            
                            db.commit((err) => {
                                if (err) return db.rollback(() => res.status(500).json({ error: 'Commit failed' }));
                                res.json({ message: 'Booked successfully' });
                            });
                        });
                    });
                });
            });
        });
    } catch (error) {
        res.status(500).json({ error: 'Server Error' });
    }
});

// ==========================================
// 2. Get my bookings (ดูประวัติการจอง)
// ==========================================
router.get('/', authenticateToken, (req, res) => {
    try {
        const userId = parseInt(req.user.u_id);
        const sql = `
            SELECT b.b_id AS id, b.u_id AS userId, b.c_id AS classId, b.b_createdAt AS createdAt,
                   c.c_id AS c_id, c.c_name AS c_name, c.c_schedule AS c_schedule, c.c_capacity AS c_capacity
            FROM booking b JOIN class c ON b.c_id = c.c_id WHERE b.u_id = ? ORDER BY b.b_createdAt DESC
        `;
        db.query(sql, [userId], (err, rows) => {
            if (err) return res.status(500).json({ error: 'Something went wrong' });
            res.json(rows);
        });
    } catch (error) {
        res.status(500).json({ error: 'Server Error' });
    }
});

// ==========================================
// 3. Cancel booking (ยกเลิกการจอง)
// ==========================================
router.delete('/:id', authenticateToken, (req, res) => {
    try {
        const userId = parseInt(req.user.u_id);
        const bookingId = parseInt(req.params.id);
        
        if (!bookingId || isNaN(bookingId)) {
            return res.status(400).json({ error: 'Invalid booking id' });
        }

        db.query('SELECT b_id AS id, u_id AS userId FROM booking WHERE b_id = ?', [bookingId], (err, bookingRows) => {
            if (err) return res.status(500).json({ error: 'Something went wrong' });
            
            const booking = bookingRows[0];
            if (!booking || booking.userId !== userId) {
                return res.status(403).json({ error: 'Not allowed' });
            }

            db.query('DELETE FROM booking WHERE b_id = ?', [bookingId], (err, result) => {
                if (err) return res.status(500).json({ error: 'Something went wrong' });
                res.json({ message: 'Cancelled' });
            });
        });
    } catch (error) {
        res.status(500).json({ error: 'Server Error' });
    }
});

module.exports = router;