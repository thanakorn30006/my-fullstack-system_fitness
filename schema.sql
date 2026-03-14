-- Create Database
CREATE DATABASE IF NOT EXISTS system_fitness;
USE system_fitness;

-- 1. Table: User
CREATE TABLE IF NOT EXISTS User (
    u_id INT AUTO_INCREMENT PRIMARY KEY,
    u_name VARCHAR(100) NOT NULL,
    u_lastName VARCHAR(100),
    u_phone VARCHAR(20),
    u_email VARCHAR(100) UNIQUE NOT NULL,
    u_password VARCHAR(255) NOT NULL,
    u_role ENUM('ADMIN', 'MEMBER') DEFAULT 'MEMBER',
    u_createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Table: Trainer
CREATE TABLE IF NOT EXISTS trainer (
    tr_id INT AUTO_INCREMENT PRIMARY KEY,
    tr_name VARCHAR(100) NOT NULL,
    tr_specialty VARCHAR(100),
    tr_bio TEXT,
    tr_imageUrl VARCHAR(255),
    tr_createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Table: Class
CREATE TABLE IF NOT EXISTS class (
    c_id INT AUTO_INCREMENT PRIMARY KEY,
    c_name VARCHAR(100) NOT NULL,
    c_description TEXT,
    c_schedule DATETIME NOT NULL,
    c_capacity INT NOT NULL,
    c_isActive BOOLEAN DEFAULT TRUE,
    tr_id INT,
    c_createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tr_id) REFERENCES trainer(tr_id) ON DELETE SET NULL
);

-- 4. Table: Package
CREATE TABLE IF NOT EXISTS package (
    pkg_id INT AUTO_INCREMENT PRIMARY KEY,
    pkg_name VARCHAR(100) NOT NULL,
    pkg_price DECIMAL(10, 2) NOT NULL,
    pkg_duration INT NOT NULL, -- Number of days
    pkg_description TEXT,
    pkg_isActive BOOLEAN DEFAULT TRUE,
    pkg_createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Table: MemberPackage (Subscriptions)
CREATE TABLE IF NOT EXISTS memberpackage (
    mp_id INT AUTO_INCREMENT PRIMARY KEY,
    u_id INT NOT NULL,
    pkg_id INT NOT NULL,
    mp_startDate DATE NOT NULL,
    mp_endDate DATE NOT NULL,
    mp_isActive BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (u_id) REFERENCES User(u_id) ON DELETE CASCADE,
    FOREIGN KEY (pkg_id) REFERENCES package(pkg_id) ON DELETE CASCADE
);

-- 6. Table: Booking
CREATE TABLE IF NOT EXISTS booking (
    b_id INT AUTO_INCREMENT PRIMARY KEY,
    u_id INT NOT NULL,
    c_id INT NOT NULL,
    bookingTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (u_id) REFERENCES User(u_id) ON DELETE CASCADE,
    FOREIGN KEY (c_id) REFERENCES class(c_id) ON DELETE CASCADE
);

-- Insert Default Admin (Optional)
-- Password is 'admin123' (Hashed via bcrypt potentially needed, but for SQL setup placeholder)
-- INSERT INTO User (u_name, u_email, u_password, u_role) VALUES ('Admin', 'admin@fitness.com', '$2b$10$YourHashedPasswordHere', 'ADMIN');
