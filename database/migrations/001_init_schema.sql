-- ClinicOS initial schema
-- MySQL 8.0+
-- All data inserted by database/seed/ is fictional demo data. No real patient information.

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- users
-- One row per login-capable account (staff AND patients with portal access).
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PATIENT') NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB;

-- ============================================================
-- refresh_tokens
-- Server-side revocable refresh tokens (supports real logout, not just client-side deletion).
-- ============================================================
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  revoked_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uq_refresh_tokens_hash (token_hash),
  KEY idx_refresh_tokens_user (user_id)
) ENGINE=InnoDB;

-- ============================================================
-- departments
-- ============================================================
CREATE TABLE IF NOT EXISTS departments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  description VARCHAR(500) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_departments_name (name)
) ENGINE=InnoDB;

-- ============================================================
-- doctors
-- ============================================================
CREATE TABLE IF NOT EXISTS doctors (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  department_id BIGINT UNSIGNED NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  specialization VARCHAR(150) NOT NULL,
  phone VARCHAR(30) NULL,
  status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_doctors_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_doctors_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
  UNIQUE KEY uq_doctors_user (user_id),
  KEY idx_doctors_department (department_id),
  KEY idx_doctors_status (status)
) ENGINE=InnoDB;

-- ============================================================
-- receptionists
-- ============================================================
CREATE TABLE IF NOT EXISTS receptionists (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(30) NULL,
  status ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_receptionists_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uq_receptionists_user (user_id)
) ENGINE=InnoDB;

-- ============================================================
-- doctor_availability
-- Recurring weekly availability windows, used for scheduling UI + conflict checks.
-- ============================================================
CREATE TABLE IF NOT EXISTS doctor_availability (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  doctor_id BIGINT UNSIGNED NOT NULL,
  day_of_week TINYINT UNSIGNED NOT NULL COMMENT '0=Sunday .. 6=Saturday',
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_availability_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
  KEY idx_availability_doctor_day (doctor_id, day_of_week),
  CONSTRAINT chk_availability_time_order CHECK (end_time > start_time)
) ENGINE=InnoDB;

-- ============================================================
-- patients
-- user_id is nullable: a patient exists as a clinic record from the moment
-- reception registers them; portal login (user_id) is granted separately.
-- ============================================================
CREATE TABLE IF NOT EXISTS patients (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  patient_code VARCHAR(20) NOT NULL,
  user_id BIGINT UNSIGNED NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE NOT NULL,
  gender ENUM('MALE', 'FEMALE', 'OTHER') NOT NULL,
  phone VARCHAR(30) NOT NULL,
  email VARCHAR(255) NULL,
  address VARCHAR(500) NULL,
  emergency_contact_name VARCHAR(150) NULL,
  emergency_contact_phone VARCHAR(30) NULL,
  blood_group ENUM('A+','A-','B+','B-','AB+','AB-','O+','O-','UNKNOWN') NOT NULL DEFAULT 'UNKNOWN',
  allergies VARCHAR(1000) NULL,
  registered_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_patients_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_patients_registered_by FOREIGN KEY (registered_by) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE KEY uq_patients_code (patient_code),
  UNIQUE KEY uq_patients_user (user_id),
  KEY idx_patients_name (last_name, first_name),
  KEY idx_patients_phone (phone)
) ENGINE=InnoDB;

-- ============================================================
-- appointments
-- ============================================================
CREATE TABLE IF NOT EXISTS appointments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  patient_id BIGINT UNSIGNED NOT NULL,
  doctor_id BIGINT UNSIGNED NOT NULL,
  department_id BIGINT UNSIGNED NULL,
  scheduled_at DATETIME NOT NULL,
  duration_minutes SMALLINT UNSIGNED NOT NULL DEFAULT 30,
  type ENUM('NEW_VISIT', 'FOLLOW_UP', 'CONSULTATION', 'PROCEDURE') NOT NULL DEFAULT 'NEW_VISIT',
  reason VARCHAR(500) NULL,
  status ENUM('SCHEDULED','CONFIRMED','WAITING','IN_PROGRESS','COMPLETED','CANCELLED','NO_SHOW') NOT NULL DEFAULT 'SCHEDULED',
  created_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_appointments_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  CONSTRAINT fk_appointments_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE RESTRICT,
  CONSTRAINT fk_appointments_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
  CONSTRAINT fk_appointments_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  KEY idx_appointments_doctor_time (doctor_id, scheduled_at),
  KEY idx_appointments_patient (patient_id),
  KEY idx_appointments_status (status),
  KEY idx_appointments_scheduled_at (scheduled_at)
) ENGINE=InnoDB;

-- ============================================================
-- medical_records
-- ============================================================
CREATE TABLE IF NOT EXISTS medical_records (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  patient_id BIGINT UNSIGNED NOT NULL,
  appointment_id BIGINT UNSIGNED NULL,
  doctor_id BIGINT UNSIGNED NOT NULL,
  visit_date DATE NOT NULL,
  chief_complaint VARCHAR(500) NOT NULL,
  symptoms TEXT NULL,
  diagnosis VARCHAR(500) NOT NULL,
  clinical_notes TEXT NULL,
  treatment_plan TEXT NULL,
  follow_up_date DATE NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_records_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  CONSTRAINT fk_records_appointment FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL,
  CONSTRAINT fk_records_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE RESTRICT,
  KEY idx_records_patient (patient_id),
  KEY idx_records_doctor (doctor_id),
  KEY idx_records_followup (follow_up_date)
) ENGINE=InnoDB;

-- ============================================================
-- prescriptions
-- ============================================================
CREATE TABLE IF NOT EXISTS prescriptions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  patient_id BIGINT UNSIGNED NOT NULL,
  doctor_id BIGINT UNSIGNED NOT NULL,
  medical_record_id BIGINT UNSIGNED NULL,
  prescribed_date DATE NOT NULL,
  notes VARCHAR(1000) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_prescriptions_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  CONSTRAINT fk_prescriptions_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE RESTRICT,
  CONSTRAINT fk_prescriptions_record FOREIGN KEY (medical_record_id) REFERENCES medical_records(id) ON DELETE SET NULL,
  KEY idx_prescriptions_patient (patient_id),
  KEY idx_prescriptions_doctor (doctor_id)
) ENGINE=InnoDB;

-- ============================================================
-- prescription_items
-- ============================================================
CREATE TABLE IF NOT EXISTS prescription_items (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  prescription_id BIGINT UNSIGNED NOT NULL,
  medicine_name VARCHAR(200) NOT NULL,
  dosage VARCHAR(100) NOT NULL,
  frequency VARCHAR(100) NOT NULL,
  duration VARCHAR(100) NOT NULL,
  instructions VARCHAR(500) NULL,
  CONSTRAINT fk_items_prescription FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE CASCADE,
  KEY idx_items_prescription (prescription_id)
) ENGINE=InnoDB;

-- ============================================================
-- payments
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  patient_id BIGINT UNSIGNED NOT NULL,
  appointment_id BIGINT UNSIGNED NULL,
  amount DECIMAL(10,2) NOT NULL,
  method ENUM('CASH','CARD','BANK_TRANSFER','OTHER') NOT NULL,
  status ENUM('PENDING','PAID','PARTIAL','REFUNDED') NOT NULL DEFAULT 'PENDING',
  paid_at DATETIME NULL,
  created_by BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_payments_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  CONSTRAINT fk_payments_appointment FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL,
  CONSTRAINT fk_payments_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT chk_payments_amount CHECK (amount >= 0),
  KEY idx_payments_patient (patient_id),
  KEY idx_payments_status (status),
  KEY idx_payments_created_at (created_at)
) ENGINE=InnoDB;

-- ============================================================
-- audit_logs
-- Deliberately excludes clinical content: only who/what/when.
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id BIGINT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_audit_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  KEY idx_audit_entity (entity_type, entity_id),
  KEY idx_audit_created_at (created_at)
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;
