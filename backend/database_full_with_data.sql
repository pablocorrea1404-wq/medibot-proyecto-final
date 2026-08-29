-- SQL Full Schema with 10 records per table for MediBot TFG
-- 📋 Base de Datos: medibot

-- 1. Estructura de tablas (creación)
CREATE DATABASE IF NOT EXISTS medibot DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci`;
USE medibot;

-- Tabla: patient
CREATE TABLE IF NOT EXISTS patient (
    id INT AUTO_INCREMENT NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    dni VARCHAR(20) DEFAULT NULL,
    UNIQUE (dni),
    PRIMARY KEY(id)
) ENGINE = InnoDB;

-- Tabla: staff
CREATE TABLE IF NOT EXISTS staff (
    id INT AUTO_INCREMENT NOT NULL,
    name VARCHAR(255) NOT NULL,
    specialty VARCHAR(255) NOT NULL,
    email VARCHAR(255) DEFAULT NULL,
    PRIMARY KEY(id)
) ENGINE = InnoDB;

-- Tabla: medical_service
CREATE TABLE IF NOT EXISTS medical_service (
    id INT AUTO_INCREMENT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT DEFAULT NULL,
    price DECIMAL(10, 2) NOT NULL,
    duration_minutes INT DEFAULT 30,
    PRIMARY KEY(id)
) ENGINE = InnoDB;

-- Tabla: appointment
CREATE TABLE IF NOT EXISTS appointment (
    id INT AUTO_INCREMENT NOT NULL,
    patient_id INT NOT NULL,
    staff_id INT DEFAULT NULL,
    medical_service_id INT DEFAULT NULL,
    appointment_date DATETIME NOT NULL,
    status VARCHAR(50) NOT NULL,
    google_calendar_id VARCHAR(255) DEFAULT NULL,
    notes_ia LONGTEXT DEFAULT NULL,
    PRIMARY KEY(id),
    CONSTRAINT FK_APPOINTMENT_PATIENT FOREIGN KEY (patient_id) REFERENCES patient (id),
    CONSTRAINT FK_APPOINTMENT_STAFF FOREIGN KEY (staff_id) REFERENCES staff (id),
    CONSTRAINT FK_APPOINTMENT_SERVICE FOREIGN KEY (medical_service_id) REFERENCES medical_service (id)
) ENGINE = InnoDB;

-- Tabla: stock_item
CREATE TABLE IF NOT EXISTS stock_item (
    id INT AUTO_INCREMENT NOT NULL,
    name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    min_threshold INT NOT NULL,
    PRIMARY KEY(id)
) ENGINE = InnoDB;

-- 2. Inserción de 10 registros por tabla (Datos de prueba)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE appointment;
TRUNCATE TABLE patient;
TRUNCATE TABLE staff;
TRUNCATE TABLE medical_service;
TRUNCATE TABLE stock_item;
SET FOREIGN_KEY_CHECKS = 1;

-- Patients
INSERT INTO patient (name, email, phone, dni) VALUES
('Juan Pérez', 'juan.perez@email.com', '600111222', '11111111A'),
('María García', 'maria.garcia@email.com', '600222333', '22222222B'),
('Carlos Rodríguez', 'carlos.r@email.com', '600333444', '33333333C'),
('Ana Martínez', 'ana.m@email.com', '600444555', '44444444D'),
('Luis López', 'luis.l@email.com', '600555666', '55555555E'),
('Elena Sánchez', 'elena.s@email.com', '600666777', '66666666F'),
('Jorge Ruiz', 'jorge.r@email.com', '600777888', '77777777G'),
('Laura Castro', 'laura.c@email.com', '600888999', '88888888H'),
('Pedro Jiménez', 'pedro.j@email.com', '600999000', '99999999I'),
('Sofía Torres', 'sofia.t@email.com', '600000111', '00000000J');

-- Staff
INSERT INTO staff (name, specialty, email) VALUES
('Dr. Alberto Ramos', 'Odontología General', 'alberto@medibot.com'),
('Dra. Silvia Conde', 'Ortodoncia', 'silvia@medibot.com'),
('Dr. Roberto Sanz', 'Implantología', 'roberto@medibot.com'),
('Dra. Marta Vidal', 'Odontopediatría', 'marta@medibot.com'),
('Dra. Carmen Gil', 'Periodoncia', 'carmen@medibot.com'),
('Dr. Javier Soler', 'Cirugía Oral', 'javier@medibot.com'),
('Mónica Luque', 'Higienista Dental', 'monica@medibot.com'),
('Sara Ibáñez', 'Higienista Dental', 'sara@medibot.com'),
('Pablo Correa', 'Director Jefe', 'pablo@medibot.com'),
('Elena Blanco', 'Administración', 'elena@medibot.com');

-- Medical Services
INSERT INTO medical_service (name, description, price, duration_minutes) VALUES
('Limpieza Dental', 'Limpieza profunda de sarro y pulido', 50.00, 30),
('Empaste Simple', 'Obturación de composite en una cara', 60.00, 45),
('Extracción Simple', 'Extracción de pieza dental sin cirugía', 80.00, 30),
('Ortodoncia Brackets', 'Tratamiento correctivo mensual', 120.00, 30),
('Implante Dental', 'Colocación de pieza de titanio', 800.00, 60),
('Blanqueamiento', 'Tratamiento LED en clínica', 250.00, 60),
('Revisión General', 'Examen completo y diagnóstico', 0.00, 20),
('Endodoncia', 'Tratamiento de conductos', 150.00, 90),
('Radiografía Panorámica', 'Imagen completa de la boca', 40.00, 15),
('Férula Descarga', 'Tratamiento para bruxismo', 200.00, 45);

-- Stock Items
INSERT INTO stock_item (name, quantity, min_threshold) VALUES
('Guantes Nitrilo (Caja 100)', 50, 10),
('Mascarillas Quirúrgicas (Caja)', 30, 5),
('Agujas Anestesia (Pack)', 25, 5),
('Carpules Anestesia (Pack)', 15, 3),
('Composite A2 (Jeringa)', 12, 4),
('Composite A3 (Jeringa)', 10, 4),
('Alginato (Bolsa)', 8, 2),
('Escafandras Protección', 15, 5),
('Vasos Plástico (Pack 1000)', 5, 2),
('Servilletas Paciente (Pack)', 20, 5);

-- Appointments (Random sample for 10 records)
INSERT INTO appointment (patient_id, staff_id, medical_service_id, appointment_date, status) VALUES
(1, 1, 7, '2026-04-01 10:00:00', 'confirmed'),
(2, 2, 4, '2026-04-01 11:30:00', 'pending'),
(3, 3, 5, '2026-04-01 16:00:00', 'confirmed'),
(4, 4, 1, '2026-04-02 09:00:00', 'pending'),
(5, 5, 8, '2026-04-02 12:00:00', 'confirmed'),
(6, 6, 3, '2026-04-03 10:30:00', 'confirmed'),
(7, 7, 1, '2026-04-03 13:00:00', 'pending'),
(8, 2, 4, '2026-04-04 15:30:00', 'confirmed'),
(9, 1, 2, '2026-04-05 11:00:00', 'pending'),
(10, 8, 1, '2026-04-05 17:00:00', 'confirmed');
