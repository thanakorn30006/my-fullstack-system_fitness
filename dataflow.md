# เอกสารสรุปการไหลของข้อมูล (Dataflow Summary)

เอกสารนี้อธิบายถึงวิธีการที่ข้อมูลเดินทางผ่านส่วนต่างๆ ของระบบ **Fitness Management System** ตั้งแต่หน้าบ้าน (Frontend) ไปจนถึงฐานข้อมูล (Database)

## 🏗 ภาพรวมสถาปัตยกรรม (Architecture Overview)

ระบบทำงานในรูปแบบ **Client-Server Architecture**:
1.  **Frontend (Next.js/React)**: ติดต่อสื่อสารกับผู้ใช้และส่งคำขอผ่าน HTTP (Axios)
2.  **API Client (Axios)**: จัดการเรื่อง Authentication Header (JWT) และส่งข้อมูลไปยัง Backend
3.  **Backend (Express.js)**: รับคำขอ, ตรวจสอบความถูกต้อง (Validation), และจัดการ Logic ต่างๆ
4.  **Database (MySQL)**: จัดเก็บข้อมูลแบบถาวร

---

## 🔑 1. ระบบยืนยันตัวตน (Authentication Flow)

### การสมัครสมาชิก (Registration)
- **Frontend**: ผู้ใช้กรอกแบบฟอร์ม -> ส่ง `POST /api/auth/register`
- **Backend**:
    1. รับข้อมูล `u_name`, `u_email`, `u_password`
    2. ทำการ **Hash Password** ด้วย `bcrypt` (เพื่อความปลอดภัย)
    3. บันทึกข้อมูลลงตาราง `User` ในฐานข้อมูล
- **Database**: เก็บข้อมูลผู้เช้าใช้งานพร้อมรหัสผ่านที่เข้ารหัสแล้ว

### การเข้าสู่ระบบ (Login)
- **Frontend**: ผู้ใช้กรอก Email/Password -> ส่ง `POST /api/auth/login`
- **Backend**:
    1. ดึงข้อมูล User จากฐานข้อมูลด้วย Email
    2. เปรียบเทียบรหัสผ่าน (Compare Hash)
    3. หากถูกต้อง จะสร้าง **JWT (JSON Web Token)**
    4. ส่ง JWT กลับไปให้ Frontend
- **Frontend**: เก็บ JWT ไว้ใน `localStorage` และใช้แนบไปกับทุกคำขอที่ต้องใช้สิทธิ์ (Auth Headers)

---

## 📅 2. ระบบการจองคลาส (Class Booking Flow)

กระบวนการจองคลาสเรียนมีความซับซ้อนและสำคัญที่สุดในระบบ:

1.  **Frontend**: ผู้ใช้กดปุ่ม "จอง" ในหน้าปฏิทิน -> ส่ง `POST /api/bookings` พร้อม `classId`
2.  **Backend (Middleware)**: ตรวจสอบ `JWT Token` เพื่อระบุตัวตนผู้ใช้
3.  **Backend (Logic)**:
    - **Step 1**: เช็คตาราง `memberpackage` ว่าผู้ใช้มีแพ็กเกจที่ยังไม่หมดอายุหรือไม่
    - **Step 2**: เช็คตาราง `class` ว่าคลาสนั้นยังไม่เต็ม (`capacity`)
    - **Step 3 (Transaction)**: 
        - บันทึกการจองลงตาราง `booking`
        - อัปเดตสถานะจำนวนผู้จองในคลาส
4.  **Backend**: ส่งผลลัพธ์ "จองสำเร็จ" กลับไป
5.  **Frontend**: อัปเดตหน้าปฏิทินเพื่อแสดงผลที่ว่างล่าสุด

---

## ⚙️ 3. ระบบจัดการสำหรับแอดมิน (Admin Management Flow)

ระบบ CRUD (Create, Read, Update, Delete) สำหรับข้อมูลพื้นฐาน:

- **Frontend**: แอดมินจัดการข้อมูล (เช่น แก้ไขราคาแพ็กเกจ) -> ส่งคำขอ `PUT /api/package/:id`
- **Backend (Admin Guard)**: ตรวจสอบว่า `u_role` ใน Token เป็น `'ADMIN'` หรือไม่
- **Backend**: หากผ่าน จะทำการสั่ง `UPDATE` ข้อมูลในตารางที่เกี่ยวข้อง
- **Database**: ข้อมูลถูกเปลี่ยนแปลงและส่งผลต่อผู้ใช้ทุกคนในระบบทันที

---

## 📊 ผังความสัมพันธ์ข้อมูล (Entity Relationship - Simplified)

```mermaid
erDiagram
    USER ||--o{ BOOKING : makes
    USER ||--o{ MEMBERPACKAGE : subscribes
    PACKAGE ||--o{ MEMBERPACKAGE : contains
    CLASS ||--o{ BOOKING : has
    TRAINER ||--o{ CLASS : teaches
```

---
เอกสารนี้จัดทำเพื่อประกอบการส่งโปรเจกต์ เพื่อให้อาจารย์เห็นภาพรวมการทำงานเบื้องหลังของระบบทั้งหมด
