# Fitness System - Fullstack Management Application

ระบบจัดการฟิตเนสแบบ Fullstack ที่รองรับการจัดการสมาชิก, คลาสเรียน, เทรนเนอร์ และแพ็กเกจสมาชิก

## 🚀 ฟีเจอร์หลัก (Key Features)

- **หน้าแรก (Home)**: แนะนำระบบและเมนูการใช้งาน
- **คลาสเรียน (Classes)**: แสดงตารางเรียนแบบปฏิทินรายเดือน (Monthly Calendar) และระบบจองคลาส
- **ทีมเทรนเนอร์ (Trainers)**: รายชื่อเทรนเนอร์ผู้เชี่ยวชาญ
- **แพ็กเกจสมาชิก (Packages)**: ระบบสมัครสมาชิกและดูแพ็กเกจ
- **โปรไฟล์สมาชิก (Profile)**: ดูข้อมูลส่วนตัว, ประวัติการจอง และแพ็กเกจที่สมัครไว้
- **ระบบแอดมิน (Admin Panel)**: 
  - จัดการคลาส (เพิ่ม/แก้ไข/ลบ)
  - จัดการแพ็กเกจ (เพิ่ม/แก้ไข/ลบ)
  - จัดการเทรนเนอร์ (เพิ่ม/แก้ไข/ลบ)

## 🛠 เทคโนโลยีที่ใช้ (Tech Stack)

### Frontend
- **Framework**: Next.js (React)
- **Routing**: React Router DOM (v7)
- **State Management**: React Context (AuthContext)
- **API Client**: Axios
- **Styling**: Tailwind CSS & Vanilla CSS

### Backend
- **Framework**: Express.js
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Token)
- **Encryption**: Bcrypt (สำหรับ Hash รหัสผ่าน)

---

## ⚙️ วิธีการติดตั้ง (Setup Instructions)

### 1. ไฟล์ฐานข้อมูล
- นำไฟล์ `schema.sql` ไปรันใน MySQL เพื่อสร้างฐานข้อมูลและตารางที่จำเป็น

### 2. ตั้งค่า Backend
1. เข้าไปที่โฟลเดอร์ `backend`
2. รันคำสั่ง `npm install` เพื่อติดตั้ง dependencies
3. สร้างไฟล์ `.env` และตั้งค่าดังนี้:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=รหัสผ่านของคุณ
   DB_NAME=system_fitness
   JWT_SECRET=your_jwt_secret_key
   PORT=5000
   ```
4. รันคำสั่ง `npm run dev` เพื่อเริ่ม Server

### 3. ตั้งค่า Frontend
1. เข้าไปที่โฟลเดอร์ `frontend`
2. รันคำสั่ง `npm install` เพื่อติดตั้ง dependencies
3. รันคำสั่ง `npm run dev` เพื่อเริ่มแอปพลิเคชัน
4. เปิด Browser ไปที่ `http://localhost:3000`

---

## 📂 โครงสร้างโปรเจกต์
- `/backend`: ส่วนของ API และการเชื่อมต่อฐานข้อมูล
- `/frontend`: ส่วนของ UI และ Logic ฝั่งหน้าบ้าน
- `schema.sql`: ไฟล์สำหรับสร้างฐานข้อมูล

---
จัดทำโดย: [ชื่อของคุณ]
