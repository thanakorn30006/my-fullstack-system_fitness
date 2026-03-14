const express = require('express');
const router = express.Router();
const db = require('./db');
const { authenticateToken, requireAdmin } = require('./auth');

// ==========================================
// 1. Get all classes (ดึงคลาสทั้งหมด พร้อมข้อมูลเทรนเนอร์)
// ==========================================
router.get('/', (req, res) => {
    const query = `
        SELECT 
            c.c_id AS id, 
            c.c_name AS name, 
            c.c_description AS description, 
            c.c_schedule AS schedule, 
            c.c_capacity AS capacity, 
            c.c_isActive AS isActive, 
            c.tr_id AS tr_id,
            c.c_createdAt AS createdAt,
            (SELECT COUNT(*) FROM booking b WHERE b.c_id = c.c_id) as _count_bookings,
            t.tr_id AS t_id, 
            t.tr_name AS t_name, 
            t.tr_specialty AS t_specialty, 
            t.tr_bio AS t_bio, 
            t.tr_imageUrl AS t_imageUrl, 
            t.tr_createdAt AS t_createdAt
        FROM class c
        LEFT JOIN trainer t ON c.tr_id = t.tr_id
        ORDER BY c.c_schedule ASC
    `;

    db.query(query, (err, rows) => {
        if (err) {
            console.error('GET CLASSES ERROR:', err);
            return res.status(500).json({ error: 'Something went wrong' });
        }

        // จัดรูปแบบข้อมูล (แยก object trainer ออกมาให้สวยงาม)
        const classes = rows.map((row) => {
            const {
                _count_bookings, t_id, t_name, t_specialty, t_bio, t_imageUrl, t_createdAt,
                ...rest
            } = row;

            let trainer = null;
            if (t_id) {
                trainer = {
                    id: t_id,
                    name: t_name,
                    specialty: t_specialty,
                    bio: t_bio,
                    imageUrl: t_imageUrl,
                    createdAt: t_createdAt
                };
            }

            return {
                ...rest,
                isActive: !!rest.isActive, // แปลงเป็น Boolean
                trainer,
                _count: {
                    bookings: parseInt(_count_bookings)
                }
            };
        });

        return res.json(classes);
    });
});

// ==========================================
// 2. Admin create class (แอดมินสร้างคลาสใหม่)
// ==========================================
router.post('/', authenticateToken, requireAdmin, (req, res) => {
    const { name, capacity, schedule, description, trainerId } = req.body;

    if (!name || !capacity || !schedule) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const capacityNumber = Number(capacity);
    const scheduleDate = new Date(schedule);

    if (capacityNumber <= 0) {
        return res.status(400).json({ error: 'Capacity must be greater than 0' });
    }

    // เช็คว่าเวลาที่จัดคลาสต้องเป็นอนาคต
    if (scheduleDate <= new Date()) {
        return res.status(400).json({ error: 'Schedule must be in the future' });
    }

    const insertSql = `
        INSERT INTO class (c_name, c_capacity, c_schedule, c_description, c_isActive, tr_id)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    const values = [String(name), capacityNumber, scheduleDate, description || null, true, trainerId ? Number(trainerId) : null];

    db.query(insertSql, values, (err, result) => {
        if (err) {
            console.error('CREATE CLASS ERROR:', err);
            return res.status(500).json({ error: 'Something went wrong' });
        }

        // ดึงข้อมูลคลาสที่เพิ่งสร้างส่งกลับไป
        const selectSql = `
            SELECT c_id AS id, c_name AS name, c_description AS description, c_schedule AS schedule, 
            c_capacity AS capacity, c_isActive AS isActive, tr_id AS trainerId, c_createdAt AS createdAt 
            FROM class WHERE c_id = ?
        `;
        
        db.query(selectSql, [result.insertId], (err, rows) => {
            if (err) {
                console.error('CREATE CLASS ERROR (SELECT):', err);
                return res.status(500).json({ error: 'Something went wrong' });
            }

            const newClass = rows[0];
            if (newClass) {
                newClass.isActive = !!newClass.isActive;
            }

            return res.json(newClass);
        });
    });
});

// ==========================================
// 3. Admin toggle class status (แอดมินเปิด/ปิดคลาส)
// ==========================================
router.put('/:id/toggle', authenticateToken, requireAdmin, (req, res) => {
    const classId = parseInt(req.params.id);

    db.query('SELECT c_isActive AS isActive FROM class WHERE c_id = ?', [classId], (err, classRows) => {
        if (err) {
            console.error('TOGGLE CLASS ERROR (SELECT):', err);
            return res.status(500).json({ error: 'Something went wrong' });
        }

        const fitnessClass = classRows[0];
        if (!fitnessClass) {
            return res.status(404).json({ error: 'Class not found' });
        }

        // สลับค่า isActive (ถ้า true เป็น false / ถ้า false เป็น true)
        db.query('UPDATE class SET c_isActive = ? WHERE c_id = ?', [!fitnessClass.isActive, classId], (err) => {
            if (err) {
                console.error('TOGGLE CLASS ERROR (UPDATE):', err);
                return res.status(500).json({ error: 'Something went wrong' });
            }

            const selectUpdatedSql = `
                SELECT c_id AS id, c_name AS name, c_description AS description, c_schedule AS schedule, 
                c_capacity AS capacity, c_isActive AS isActive, tr_id AS trainerId, c_createdAt AS createdAt 
                FROM class WHERE c_id = ?
            `;
            
            db.query(selectUpdatedSql, [classId], (err, updatedRows) => {
                if (err) {
                    console.error('TOGGLE CLASS ERROR (SELECT UPDATED):', err);
                    return res.status(500).json({ error: 'Something went wrong' });
                }

                const updatedClass = updatedRows[0];
                if (updatedClass) {
                    updatedClass.isActive = !!updatedClass.isActive;
                }

                return res.json(updatedClass);
            });
        });
    });
});

// ==========================================
// 4. Admin update class (แอดมินแก้ไขคลาส)
// ==========================================
router.put('/:id', authenticateToken, requireAdmin, (req, res) => {
    const classId = parseInt(req.params.id);
    const { name, capacity, schedule, description, trainerId } = req.body;

    if (!name || !capacity || !schedule) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const capacityNumber = Number(capacity);
    const scheduleDate = new Date(schedule);

    if (capacityNumber <= 0) {
        return res.status(400).json({ error: 'Capacity must be greater than 0' });
    }

    const updateSql = `
        UPDATE class 
        SET c_name = ?, c_capacity = ?, c_schedule = ?, c_description = ?, tr_id = ? 
        WHERE c_id = ?
    `;
    const values = [name, capacityNumber, scheduleDate, description || null, trainerId ? Number(trainerId) : null, classId];

    db.query(updateSql, values, (err, result) => {
        if (err) {
            console.error('UPDATE CLASS ERROR:', err);
            return res.status(500).json({ error: 'Something went wrong' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Class not found' });
        }

        return res.json({ message: 'Class updated' });
    });
});

// ==========================================
// 5. Admin delete class (แอดมินลบคลาส)
// ==========================================
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
    const classId = parseInt(req.params.id);

    db.query('DELETE FROM class WHERE c_id = ?', [classId], (err, result) => {
        if (err) {
            console.error('DELETE CLASS ERROR:', err);
            return res.status(500).json({ error: 'Something went wrong' });
        }

        return res.json({ message: 'Class deleted' });
    });
});

module.exports = router;