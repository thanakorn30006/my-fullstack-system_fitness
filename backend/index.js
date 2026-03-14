require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import Routes (ดึงมาจากไฟล์ในระดับเดียวกันทั้งหมด)
const { router: authRoutes } = require('./auth'); // สังเกตว่าเราดึง router ออกมาจาก auth.js
const bookingRoutes = require('./booking');
const packageRoutes = require('./package');
const classRoutes = require('./classes');
const trainerRoutes = require('./trainers');

// กำหนดเส้นทาง API
app.use('/api', authRoutes);              // รวม /register, /login, /session
app.use('/api/bookings', bookingRoutes);  
app.use('/api/packages', packageRoutes);  
app.use('/api/classes', classRoutes);     
app.use('/api/trainers', trainerRoutes);  

// Start Server
// Start Server
const PORT = 5001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});