const express = require('express');
const router = express.Router();
const db = require('./db');
const { authenticateToken, requireAdmin } = require('./auth');

// ==========================================
// 1. Get active packages (แสดงแพ็กเกจที่เปิดขาย)
// ==========================================
router.get('/', (req, res) => {
    const sql = `
        SELECT pkg_id AS id, pkg_name AS name, pkg_price AS price, pkg_duration AS duration, 
        pkg_description AS description, pkg_isActive AS isActive, pkg_createdAt AS createdAt 
        FROM package WHERE pkg_isActive = true ORDER BY pkg_price ASC
    `;
    db.query(sql, (err, packages) => {
        if (err) {
            console.error('GET PACKAGES ERROR:', err);
            return res.status(500).json({ error: 'Something went wrong' });
        }
        return res.json(packages);
    });
});

// ==========================================
// 2. Admin get all packages (แอดมินดูแพ็กเกจทั้งหมด)
// ==========================================
router.get('/all', authenticateToken, requireAdmin, (req, res) => {
    const query = `
        SELECT 
            p.pkg_id AS id, p.pkg_name AS name, p.pkg_price AS price, p.pkg_duration AS duration, 
            p.pkg_description AS description, p.pkg_isActive AS isActive, p.pkg_createdAt AS createdAt,
            (SELECT COUNT(*) FROM memberpackage mp WHERE mp.pkg_id = p.pkg_id) as _count_members
        FROM package p
        ORDER BY p.pkg_price ASC
    `;
    db.query(query, (err, rows) => {
        if (err) {
            console.error('GET ALL PACKAGES ERROR:', err);
            return res.status(500).json({ error: 'Something went wrong' });
        }

        const packages = rows.map((row) => {
            const { _count_members, ...rest } = row;
            return {
                ...rest,
                isActive: !!rest.isActive,
                _count: {
                    members: parseInt(_count_members)
                }
            };
        });

        return res.json(packages);
    });
});

// ==========================================
// 3. Admin create package (แอดมินสร้างแพ็กเกจใหม่)
// ==========================================
router.post('/', authenticateToken, requireAdmin, (req, res) => {
    const { name, price, duration, description } = req.body;

    if (!name || !price || !duration) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const insertSql = `
        INSERT INTO package (pkg_name, pkg_price, pkg_duration, pkg_description, pkg_isActive)
        VALUES (?, ?, ?, ?, ?)
    `;
    db.query(insertSql, [name, parseFloat(price), parseInt(duration), description || null, true], (err, result) => {
        if (err) {
            console.error('CREATE PACKAGE ERROR:', err);
            return res.status(500).json({ error: 'Something went wrong' });
        }

        const selectSql = `
            SELECT pkg_id AS id, pkg_name AS name, pkg_price AS price, pkg_duration AS duration, 
            pkg_description AS description, pkg_isActive AS isActive, pkg_createdAt AS createdAt 
            FROM package WHERE pkg_id = ?
        `;
        db.query(selectSql, [result.insertId], (err, rows) => {
            if (err) {
                console.error('CREATE PACKAGE ERROR (SELECT):', err);
                return res.status(500).json({ error: 'Something went wrong' });
            }
            return res.json(rows[0]);
        });
    });
});

// ==========================================
// 4. Subscribe to package (ผู้ใช้สมัครแพ็กเกจ)
// ==========================================
router.post('/subscribe', authenticateToken, (req, res) => {
    const { packageId } = req.body;
    const userId = parseInt(req.user.u_id);

    const checkPkgSql = `
        SELECT pkg_id AS id, pkg_name AS name, pkg_price AS price, pkg_duration AS duration, pkg_isActive AS isActive 
        FROM package WHERE pkg_id = ?
    `;
    db.query(checkPkgSql, [parseInt(packageId)], (err, packageRows) => {
        if (err) {
            console.error('SUBSCRIBE ERROR (CHECK PKG):', err);
            return res.status(500).json({ error: 'Something went wrong' });
        }
        
        const pkg = packageRows[0];
        if (!pkg || !pkg.isActive) {
            return res.status(404).json({ error: 'Package not found or inactive' });
        }

        const checkActiveSql = 'SELECT mp_id AS id FROM memberpackage WHERE u_id = ? AND mp_endDate >= NOW() LIMIT 1';
        db.query(checkActiveSql, [userId], (err, activePackages) => {
            if (err) {
                console.error('SUBSCRIBE ERROR (CHECK ACTIVE):', err);
                return res.status(500).json({ error: 'Something went wrong' });
            }

            if (activePackages.length > 0) {
                return res.status(400).json({ error: 'คุณยังมีแพ็กเกจที่ยังไม่หมดอายุ ไม่สามารถสมัครใหม่ได้ในขณะนี้' });
            }

            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + pkg.duration);

            const insertSql = `
                INSERT INTO memberpackage (u_id, pkg_id, mp_name, mp_price, mp_startDate, mp_endDate)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            db.query(insertSql, [userId, pkg.id, pkg.name, pkg.price, startDate, endDate], (err, result) => {
                if (err) {
                    console.error('SUBSCRIBE ERROR (INSERT):', err);
                    return res.status(500).json({ error: 'Something went wrong' });
                }

                const selectSql = `
                    SELECT mp_id AS id, u_id AS userId, pkg_id AS packageId, mp_name AS name, mp_price AS price, 
                    mp_startDate AS startDate, mp_endDate AS endDate, mp_createdAt AS createdAt 
                    FROM memberpackage WHERE mp_id = ?
                `;
                db.query(selectSql, [result.insertId], (err, newMemberPackage) => {
                    if (err) {
                        console.error('SUBSCRIBE ERROR (SELECT):', err);
                        return res.status(500).json({ error: 'Something went wrong' });
                    }
                    return res.json(newMemberPackage[0]);
                });
            });
        });
    });
});

// ==========================================
// 5. Admin update package (แอดมินแก้ไขแพ็กเกจ)
// ==========================================
router.put('/:id', authenticateToken, requireAdmin, (req, res) => {
    const packageId = parseInt(req.params.id);
    const { name, price, duration, description } = req.body;

    if (!name || !price || !duration) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const updateSql = `
        UPDATE package 
        SET pkg_name = ?, pkg_price = ?, pkg_duration = ?, pkg_description = ? 
        WHERE pkg_id = ?
    `;
    db.query(updateSql, [name, parseFloat(price), parseInt(duration), description || null, packageId], (err, result) => {
        if (err) {
            console.error('UPDATE PACKAGE ERROR:', err);
            return res.status(500).json({ error: 'Something went wrong' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Package not found' });
        }

        return res.json({ message: 'Package updated' });
    });
});

// ==========================================
// 6. Admin delete package (แอดมินลบแพ็กเกจ)
// ==========================================
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
    const packageId = parseInt(req.params.id);

    db.query('DELETE FROM package WHERE pkg_id = ?', [packageId], (err) => {
        if (err) {
            console.error('DELETE PACKAGE ERROR:', err);
            return res.status(500).json({ error: 'Something went wrong' });
        }
        return res.json({ message: 'Package deleted' });
    });
});

// ==========================================
// 6. Get my active package (ดูแพ็กเกจปัจจุบันของฉัน)
// ==========================================
router.get('/my-active', authenticateToken, (req, res) => {
    const userId = parseInt(req.user.u_id);

    const sql = `
        SELECT mp_id AS id, u_id AS userId, pkg_id AS packageId, mp_name AS name, mp_price AS price, 
        mp_startDate AS startDate, mp_endDate AS endDate, mp_createdAt AS createdAt 
        FROM memberpackage 
        WHERE u_id = ? AND mp_startDate <= NOW() AND mp_endDate >= NOW() 
        ORDER BY mp_endDate DESC LIMIT 1
    `;
    db.query(sql, [userId], (err, rows) => {
        if (err) {
            console.error('GET ACTIVE PACKAGE ERROR:', err);
            return res.status(500).json({ error: 'Something went wrong' });
        }
        return res.json(rows[0] || null);
    });
});

// ==========================================
// 7. Get subscription history (ดูประวัติการสมัครทั้งหมด)
// ==========================================
router.get('/history', authenticateToken, (req, res) => {
    const userId = parseInt(req.user.u_id);
    const sql = `
        SELECT mp_id AS id, u_id AS userId, pkg_id AS packageId, mp_name AS name, mp_price AS price, 
        mp_startDate AS startDate, mp_endDate AS endDate, mp_createdAt AS createdAt 
        FROM memberpackage WHERE u_id = ? ORDER BY mp_createdAt DESC
    `;
    db.query(sql, [userId], (err, history) => {
        if (err) {
            console.error('GET PACKAGE HISTORY ERROR:', err);
            return res.status(500).json({ error: 'Something went wrong' });
        }
        return res.json(history);
    });
});

module.exports = router;