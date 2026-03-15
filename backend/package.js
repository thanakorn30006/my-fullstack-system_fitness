const express = require('express');
const router = express.Router();
const db = require('./db');
const { authenticateToken, requireAdmin } = require('./auth');

// ==========================================
// 1. Get active packages (สำหรับหน้าเลือกซื้อของ User)
// ==========================================
router.get('/', (req, res) => {
    const sql = `
        SELECT pkg_id AS id, pkg_name AS name, pkg_price AS price, pkg_duration AS duration, 
        pkg_description AS description, pkg_isActive AS isActive, pkg_createdAt AS createdAt 
        FROM package WHERE pkg_isActive = true ORDER BY pkg_price ASC
    `;
    db.query(sql, (err, packages) => {
        if (err) return res.status(500).json({ error: 'Something went wrong' });
        return res.json(packages);
    });
});

// ==========================================
// 2. Admin get all packages (สำหรับตารางในหน้า Admin)
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
        if (err) return res.status(500).json({ error: 'Something went wrong' });
        const packages = rows.map((row) => {
            const { _count_members, ...rest } = row;
            return {
                ...rest,
                isActive: !!rest.isActive,
                _count: { members: parseInt(_count_members) }
            };
        });
        return res.json(packages);
    });
});

// ==========================================
// 3. Admin create package
// ==========================================
router.post('/', authenticateToken, requireAdmin, (req, res) => {
    const { name, price, duration, description } = req.body;
    const insertSql = `INSERT INTO package (pkg_name, pkg_price, pkg_duration, pkg_description, pkg_isActive) VALUES (?, ?, ?, ?, ?)`;
    db.query(insertSql, [name, parseFloat(price), parseInt(duration), description || null, true], (err, result) => {
        if (err) {
            console.error("CREATE ERROR:", err);
            return res.status(500).json({ error: 'Something went wrong' });
        }
        const selectSql = `SELECT pkg_id AS id, pkg_name AS name, pkg_price AS price, pkg_duration AS duration FROM package WHERE pkg_id = ?`;
        db.query(selectSql, [result.insertId], (err, rows) => {
            return res.json(rows[0]);
        });
    });
});

// ==========================================
// 4. Admin update package (แก้ไข ID ป้องกันเลขเบิ้ล)
// ==========================================
router.put('/:id', authenticateToken, requireAdmin, (req, res) => {
    // 🛡️ ป้องกันบัค ID เช่น "1:1" โดยการใช้ parseInt
    const pkgId = parseInt(req.params.id.toString().replace(':', '')); 
    const { name, price, duration, description } = req.body;

    if (isNaN(pkgId)) return res.status(400).json({ error: 'Invalid ID format' });

    const sql = `
        UPDATE package 
        SET pkg_name = ?, pkg_price = ?, pkg_duration = ?, pkg_description = ? 
        WHERE pkg_id = ?
    `;
    db.query(sql, [name, parseFloat(price), parseInt(duration), description || null, pkgId], (err, result) => {
        if (err) {
            console.error("UPDATE ERROR:", err);
            return res.status(500).json({ error: 'Update failed' });
        }
        return res.json({ message: 'Updated successfully' });
    });
});

// ==========================================
// 5. Admin delete package (แก้ไข ID และเพิ่ม Log)
// ==========================================
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
    // 🛡️ ล้างค่า ID ให้เป็นตัวเลขล้วนๆ ป้องกันบัคจาก Frontend
    const pkgId = parseInt(req.params.id.toString().replace(':', ''));

    if (isNaN(pkgId)) {
        return res.status(400).json({ error: 'Invalid ID format' });
    }

    const sql = 'DELETE FROM package WHERE pkg_id = ?';
    db.query(sql, [pkgId], (err, result) => {
        if (err) {
            // พ่น Error ออกมาดูใน Terminal ว่าพังเพราะอะไร
            console.error("❌ DELETE DB ERROR:", err.message); 
            return res.status(500).json({ error: 'ไม่สามารถลบรายการนี้ได้ (Database Error)' });
        }
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'ไม่พบรายการที่ต้องการลบ' });
        }

        console.log(`✅ Deleted package ID: ${pkgId}`);
        return res.json({ message: 'Deleted successfully' });
    });
});

// ==========================================
// 6. Subscribe to package
// ==========================================
router.post('/subscribe', authenticateToken, (req, res) => {
    const { packageId } = req.body;
    const userId = parseInt(req.user.u_id);

    const checkPkgSql = `SELECT pkg_id AS id, pkg_duration AS duration, pkg_isActive AS isActive FROM package WHERE pkg_id = ?`;
    db.query(checkPkgSql, [parseInt(packageId)], (err, packageRows) => {
        const pkg = packageRows[0];
        if (!pkg || !pkg.isActive) return res.status(404).json({ error: 'Package not found' });

        const checkActiveSql = 'SELECT mp_id FROM memberpackage WHERE u_id = ? AND mp_endDate >= NOW() LIMIT 1';
        db.query(checkActiveSql, [userId], (err, activePackages) => {
            if (err) return res.status(500).json({ error: 'DB error' });
            if (activePackages.length > 0) return res.status(400).json({ error: 'คุณยังมีแพ็กเกจที่ยังไม่หมดอายุ' });

            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + pkg.duration);

            const insertSql = `INSERT INTO memberpackage (u_id, pkg_id, mp_startDate, mp_endDate) VALUES (?, ?, ?, ?)`;
            db.query(insertSql, [userId, pkg.id, startDate, endDate], (err, result) => {
                if (err) return res.status(500).json({ error: 'Insert error' });
                
                const selectSql = `
                    SELECT mp.mp_id AS id, p.pkg_name AS name, mp.mp_startDate AS startDate, mp.mp_endDate AS endDate 
                    FROM memberpackage mp
                    JOIN package p ON mp.pkg_id = p.pkg_id
                    WHERE mp.mp_id = ?
                `;
                db.query(selectSql, [result.insertId], (err, newMP) => {
                    return res.json(newMP[0]);
                });
            });
        });
    });
});

// ==========================================
// 7. Get my active package
// ==========================================
router.get('/my-active', authenticateToken, (req, res) => {
    const userId = parseInt(req.user.u_id);
    const sql = `
        SELECT mp.mp_id AS id, mp.u_id AS userId, mp.pkg_id AS packageId, p.pkg_name AS name, p.pkg_price AS price, 
        mp.mp_startDate AS startDate, mp.mp_endDate AS endDate 
        FROM memberpackage mp
        JOIN package p ON mp.pkg_id = p.pkg_id
        WHERE mp.u_id = ? AND mp.mp_startDate <= NOW() AND mp.mp_endDate >= NOW() 
        ORDER BY mp.mp_endDate DESC LIMIT 1
    `;
    db.query(sql, [userId], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Error fetching active package' });
        return res.json(rows[0] || null);
    });
});

// ==========================================
// 8. Get subscription history
// ==========================================
router.get('/history', authenticateToken, (req, res) => {
    const userId = parseInt(req.user.u_id);
    const sql = `
        SELECT mp.mp_id AS id, p.pkg_name AS name, p.pkg_price AS price, 
        mp.mp_startDate AS startDate, mp.mp_endDate AS endDate 
        FROM memberpackage mp
        JOIN package p ON mp.pkg_id = p.pkg_id
        WHERE mp.u_id = ? 
        ORDER BY mp.mp_id DESC
    `;
    db.query(sql, [userId], (err, history) => {
        if (err) return res.status(500).json({ error: 'Error fetching history' });
        return res.json(history);
    });
});

// ==========================================
// 9. ยกเลิกแพ็กเกจปัจจุบัน
// ==========================================
router.delete('/cancel-active', authenticateToken, (req, res) => {
    const userId = parseInt(req.user.u_id);
    const sql = 'DELETE FROM memberpackage WHERE u_id = ? AND mp_endDate >= NOW()';
    
    db.query(sql, [userId], (err, result) => {
        if (err) return res.status(500).json({ error: 'ไม่สามารถยกเลิกได้' });
        return res.json({ message: 'ยกเลิกแพ็กเกจสำเร็จ' });
    });
});

module.exports = router;