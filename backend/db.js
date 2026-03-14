//เชื่อมต่อฐานข้อมูลตัวเดียว แล้วให้ไฟล์อื่นดึงไปใช้

const mysql = require('mysql2');
require('dotenv').config();

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) console.error('เกิดข้อผิดพลาดในการเชื่อมต่อ MySQL:', err);
    else console.log('เชื่อมต่อฐานข้อมูล MySQL (system-fitness) สำเร็จแล้ว!');
});

module.exports = db;


