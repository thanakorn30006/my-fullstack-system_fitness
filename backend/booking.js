const express = require('express');
const router = express.Router();
const db = require('./db');
const { authenticateToken } = require('./auth');

// ==========================================
// 1. Create booking (สร้างการจอง)
// ==========================================
router.post('/', authenticateToken, (req, res) => {
    try {
        const { classId } = req.body;
        const userId = parseInt(req.user.u_id);
        const parsedClassId = parseInt(classId);

        if (!parsedClassId || isNaN(parsedClassId)) {
            return res.status(400).json({ error: 'รหัสคลาสไม่ถูกต้อง' });
        }

        const today = new Date();
        
        // จุดที่ 1: เช็คว่า User มีแพ็กเกจที่ยังไม่หมดอายุและยัง Active อยู่หรือไม่
        const checkPackageSql = `
            SELECT mp_id FROM memberpackage 
            WHERE u_id = ? AND mp_startDate <= NOW() AND mp_endDate >= NOW() AND mp_isActive = true 
            LIMIT 1
        `;

        db.query(checkPackageSql, [userId], (err, packageRows) => {
            if (err) return res.status(500).json({ error: 'Database error (Package check)' });
            
            if (packageRows.length === 0) {
                return res.status(403).json({ error: 'คุณต้องมีแพ็กเกจสมาชิกที่ยังไม่หมดอายุจึงจะจองคลาสได้' });
            }

            // เริ่ม Transaction เพื่อป้องกันการจองเกิน (Race Condition)
            db.beginTransaction((err) => {
                if (err) return res.status(500).json({ error: 'Transaction error' });

                // จุดที่ 2: เช็คจำนวนที่ว่างและสถานะคลาส (ใช้ FOR UPDATE เพื่อล็อคแถวตอนเช็ค)
                const checkClassSql = `
                    SELECT c.*, (SELECT COUNT(*) FROM booking b WHERE b.c_id = c.c_id) as _count_bookings 
                    FROM class c WHERE c.c_id = ? FOR UPDATE
                `;
                
                db.query(checkClassSql, [parsedClassId], (err, classRows) => {
                    if (err) return db.rollback(() => res.status(500).json({ error: 'Database error (Class check)' }));

                    const fitnessClass = classRows[0];
                    if (!fitnessClass || !fitnessClass.c_isActive) {
                        return db.rollback(() => res.status(400).json({ error: 'ไม่พบคลาสเรียนนี้ หรือคลาสถูกปิดใช้งาน' }));
                    }

                    // เช็คว่าคลาสเรียนผ่านมาหรือยัง
                    if (new Date(fitnessClass.c_schedule) < today) {
                        return db.rollback(() => res.status(400).json({ error: 'ไม่สามารถจองคลาสที่ผ่านมาแล้วได้' }));
                    }

                    // เช็คว่าคลาสเต็มหรือยัง
                    if (parseInt(fitnessClass._count_bookings) >= fitnessClass.c_capacity) {
                        return db.rollback(() => res.status(400).json({ error: 'ขออภัย คลาสนี้เต็มแล้ว' }));
                    }

                    // จุดที่ 3: เช็คว่าเคยจองไปแล้วหรือยัง
                    const checkExistingSql = 'SELECT b_id FROM booking WHERE u_id = ? AND c_id = ?';
                    db.query(checkExistingSql, [userId, parsedClassId], (err, existingRows) => {
                        if (err) return db.rollback(() => res.status(500).json({ error: 'Database error (Existing check)' }));
                        
                        if (existingRows.length > 0) {
                            return db.rollback(() => res.status(400).json({ error: 'คุณได้จองคลาสนี้ไปเรียบร้อยแล้ว' }));
                        }

                        // ทำการบันทึกการจอง
                        const insertBookingSql = 'INSERT INTO booking (u_id, c_id) VALUES (?, ?)';
                        db.query(insertBookingSql, [userId, parsedClassId], (err, insertResult) => {
                            if (err) return db.rollback(() => res.status(500).json({ error: 'การจองล้มเหลว' }));
                            
                            db.commit((err) => {
                                if (err) return db.rollback(() => res.status(500).json({ error: 'Commit failed' }));
                                res.json({ message: 'จองคลาสเรียนสำเร็จ!' });
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
        
        // จุดที่แก้: เปลี่ยน b.b_createdAt เป็น b.bookingTime ให้ตรงกับ Schema
        // และ JOIN กับ trainer เพื่อเอาชื่อเทรนเนอร์มาโชว์ในหน้า MyBookings
        const sql = `
            SELECT 
                b.b_id AS id, 
                b.u_id AS userId, 
                b.c_id AS classId, 
                b.bookingTime AS createdAt,
                c.c_name AS c_name, 
                c.c_schedule AS c_schedule, 
                c.c_capacity AS c_capacity,
                t.tr_name AS trainerName
            FROM booking b 
            JOIN class c ON b.c_id = c.c_id 
            LEFT JOIN trainer t ON c.tr_id = t.tr_id
            WHERE b.u_id = ? 
            ORDER BY b.bookingTime DESC
        `;
        
        db.query(sql, [userId], (err, rows) => {
            if (err) {
                console.error('GET BOOKINGS ERROR:', err);
                return res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลการจอง' });
            }
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

        // เช็คว่าเป็นเจ้าของการจองจริงไหมก่อนลบ
        db.query('SELECT b_id AS id, u_id AS userId FROM booking WHERE b_id = ?', [bookingId], (err, bookingRows) => {
            if (err) return res.status(500).json({ error: 'Something went wrong' });
            
            const booking = bookingRows[0];
            if (!booking) {
                return res.status(404).json({ error: 'ไม่พบข้อมูลการจอง' });
            }
            
            if (booking.userId !== userId) {
                return res.status(403).json({ error: 'คุณไม่มีสิทธิ์ยกเลิกการจองของผู้อื่น' });
            }

            db.query('DELETE FROM booking WHERE b_id = ?', [bookingId], (err, result) => {
                if (err) return res.status(500).json({ error: 'ไม่สามารถยกเลิกการจองได้' });
                res.json({ message: 'ยกเลิกการจองเรียบร้อยแล้ว' });
            });
        });
    } catch (error) {
        res.status(500).json({ error: 'Server Error' });
    }
});

module.exports = router;