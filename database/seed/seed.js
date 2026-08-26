// ClinicOS demo seed data.
// Every name, contact detail, and record below is fictional and generated
// solely for local development / portfolio demonstration purposes.
// Do NOT put real patient or staff information in this file.

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const SEED_PASSWORD = process.env.SEED_DEMO_PASSWORD || 'Demo@12345';

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'clinicos_app',
    password: process.env.DB_PASSWORD || 'dev_password_change_me',
    database: process.env.DB_NAME || 'clinicos',
  });

  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 12);

  console.log('Seeding departments...');
  const departments = [
    ['General Medicine', 'Primary and preventive care for all ages.'],
    ['Cardiology', 'Diagnosis and treatment of heart conditions.'],
    ['Dermatology', 'Skin, hair, and nail conditions.'],
    ['Pediatrics', 'Medical care for infants, children, and adolescents.'],
    ['Orthopedics', 'Musculoskeletal system, bones, and joints.'],
  ];
  const departmentIds = {};
  for (const [name, description] of departments) {
    const [result] = await connection.query(
      'INSERT INTO departments (name, description) VALUES (?, ?) ON DUPLICATE KEY UPDATE description = VALUES(description)',
      [name, description]
    );
    const [rows] = await connection.query('SELECT id FROM departments WHERE name = ?', [name]);
    departmentIds[name] = rows[0].id;
  }

  async function upsertUser(email, role) {
    await connection.query(
      'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE role = VALUES(role)',
      [email, passwordHash, role]
    );
    const [rows] = await connection.query('SELECT id FROM users WHERE email = ?', [email]);
    return rows[0].id;
  }

  console.log('Seeding admin...');
  await upsertUser('admin@clinicos.demo', 'ADMIN');

  console.log('Seeding doctors...');
  const doctorSeeds = [
    { email: 'dr.hassan@clinicos.demo', first: 'Ayesha', last: 'Hassan', spec: 'General Physician', dept: 'General Medicine' },
    { email: 'dr.raza@clinicos.demo', first: 'Bilal', last: 'Raza', spec: 'Cardiologist', dept: 'Cardiology' },
    { email: 'dr.khan@clinicos.demo', first: 'Sara', last: 'Khan', spec: 'Pediatrician', dept: 'Pediatrics' },
  ];
  for (const d of doctorSeeds) {
    const userId = await upsertUser(d.email, 'DOCTOR');
    await connection.query(
      `INSERT INTO doctors (user_id, department_id, first_name, last_name, specialization, phone)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE first_name = VALUES(first_name), last_name = VALUES(last_name)`,
      [userId, departmentIds[d.dept], d.first, d.last, d.spec, '+92 300 0000000']
    );
    const [[doctorRow]] = await connection.query('SELECT id FROM doctors WHERE user_id = ?', [userId]);
    // Mon-Fri 9:00-17:00 availability
    for (let day = 1; day <= 5; day += 1) {
      const [[existing]] = await connection.query(
        'SELECT id FROM doctor_availability WHERE doctor_id = ? AND day_of_week = ?',
        [doctorRow.id, day]
      );
      if (!existing) {
        await connection.query(
          'INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?)',
          [doctorRow.id, day, '09:00:00', '17:00:00']
        );
      }
    }
  }

  console.log('Seeding receptionist...');
  const receptionistUserId = await upsertUser('reception@clinicos.demo', 'RECEPTIONIST');
  await connection.query(
    `INSERT INTO receptionists (user_id, first_name, last_name, phone) VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE first_name = VALUES(first_name)`,
    [receptionistUserId, 'Fatima', 'Noor', '+92 300 1111111']
  );

  console.log('Seeding demo patient with portal login...');
  const patientUserId = await upsertUser('patient@clinicos.demo', 'PATIENT');
  const [[existingPatient]] = await connection.query('SELECT id FROM patients WHERE user_id = ?', [patientUserId]);
  if (!existingPatient) {
    await connection.query(
      `INSERT INTO patients
        (patient_code, user_id, first_name, last_name, date_of_birth, gender, phone, email, address,
         emergency_contact_name, emergency_contact_phone, blood_group, allergies, registered_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'PT-0001',
        patientUserId,
        'Usman',
        'Tariq',
        '1994-03-12',
        'MALE',
        '+92 300 2222222',
        'patient@clinicos.demo',
        '12 Demo Street, Model Town, Lahore',
        'Nadia Tariq',
        '+92 300 3333333',
        'O+',
        'Penicillin',
        receptionistUserId,
      ]
    );
  }

  console.log('\nSeed complete. Demo accounts (all use the same password):');
  console.log(`  Password for all accounts: ${SEED_PASSWORD}`);
  console.log('  admin@clinicos.demo        (ADMIN)');
  console.log('  dr.hassan@clinicos.demo    (DOCTOR - General Medicine)');
  console.log('  dr.raza@clinicos.demo      (DOCTOR - Cardiology)');
  console.log('  dr.khan@clinicos.demo      (DOCTOR - Pediatrics)');
  console.log('  reception@clinicos.demo    (RECEPTIONIST)');
  console.log('  patient@clinicos.demo      (PATIENT)');

  await connection.end();
}

main().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
