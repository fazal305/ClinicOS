import { pool } from '../config/db.js';

export async function createUser(email, passwordHash, role) {
  const [result] = await pool.query('INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)', [
    email,
    passwordHash,
    role,
  ]);
  return result.insertId;
}

export async function setUserActive(userId, isActive) {
  await pool.query('UPDATE users SET is_active = ? WHERE id = ?', [isActive ? 1 : 0, userId]);
}

export async function findUserByEmail(email) {
  const [rows] = await pool.query(
    'SELECT id, email, password_hash, role, is_active FROM users WHERE email = ? LIMIT 1',
    [email]
  );
  return rows[0] ?? null;
}

export async function findUserById(id) {
  const [rows] = await pool.query(
    'SELECT id, email, role, is_active, created_at FROM users WHERE id = ? LIMIT 1',
    [id]
  );
  return rows[0] ?? null;
}

export async function getProfileForUser(userId, role) {
  if (role === 'DOCTOR') {
    const [rows] = await pool.query(
      `SELECT d.id, d.first_name, d.last_name, d.specialization, d.department_id, dept.name AS department_name
       FROM doctors d LEFT JOIN departments dept ON dept.id = d.department_id
       WHERE d.user_id = ? LIMIT 1`,
      [userId]
    );
    return rows[0] ?? null;
  }
  if (role === 'RECEPTIONIST') {
    const [rows] = await pool.query(
      'SELECT id, first_name, last_name, phone FROM receptionists WHERE user_id = ? LIMIT 1',
      [userId]
    );
    return rows[0] ?? null;
  }
  if (role === 'PATIENT') {
    const [rows] = await pool.query(
      'SELECT id, patient_code, first_name, last_name FROM patients WHERE user_id = ? LIMIT 1',
      [userId]
    );
    return rows[0] ?? null;
  }
  return null;
}
