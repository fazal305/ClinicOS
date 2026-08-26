import { pool } from '../config/db.js';

export async function listAllReceptionists() {
  const [rows] = await pool.query(
    `SELECT r.id, r.user_id, r.first_name, r.last_name, r.phone, r.status, u.email
     FROM receptionists r JOIN users u ON u.id = r.user_id
     ORDER BY r.last_name ASC, r.first_name ASC`
  );
  return rows;
}

export async function findReceptionistById(id) {
  const [rows] = await pool.query(
    `SELECT r.id, r.user_id, r.first_name, r.last_name, r.phone, r.status, u.email
     FROM receptionists r JOIN users u ON u.id = r.user_id WHERE r.id = ? LIMIT 1`,
    [id]
  );
  return rows[0] ?? null;
}

export async function createReceptionistForUser(userId, data) {
  const [result] = await pool.query(
    'INSERT INTO receptionists (user_id, first_name, last_name, phone) VALUES (?, ?, ?, ?)',
    [userId, data.firstName, data.lastName, data.phone || null]
  );
  return findReceptionistById(result.insertId);
}

export async function updateReceptionist(id, data) {
  const columnByKey = {
    firstName: 'first_name',
    lastName: 'last_name',
    phone: 'phone',
    status: 'status',
  };
  const fields = [];
  const values = [];
  for (const [key, column] of Object.entries(columnByKey)) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      fields.push(`${column} = ?`);
      values.push(data[key] === '' ? null : data[key]);
    }
  }
  if (fields.length === 0) return findReceptionistById(id);
  values.push(id);
  await pool.query(`UPDATE receptionists SET ${fields.join(', ')} WHERE id = ?`, values);
  return findReceptionistById(id);
}
