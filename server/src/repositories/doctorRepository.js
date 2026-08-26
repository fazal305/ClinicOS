import { pool } from '../config/db.js';

export async function listActiveDoctors({ departmentId } = {}) {
  const conditions = ["d.status = 'ACTIVE'"];
  const params = [];
  if (departmentId) {
    conditions.push('d.department_id = ?');
    params.push(departmentId);
  }

  const [rows] = await pool.query(
    `SELECT d.id, d.first_name, d.last_name, d.specialization, d.department_id, dept.name AS department_name
     FROM doctors d
     LEFT JOIN departments dept ON dept.id = d.department_id
     WHERE ${conditions.join(' AND ')}
     ORDER BY d.last_name ASC, d.first_name ASC`,
    params
  );
  return rows;
}

export async function listAllDoctors() {
  const [rows] = await pool.query(
    `SELECT d.id, d.user_id, d.first_name, d.last_name, d.specialization, d.department_id, d.phone, d.status,
            dept.name AS department_name, u.email
     FROM doctors d
     LEFT JOIN departments dept ON dept.id = d.department_id
     JOIN users u ON u.id = d.user_id
     ORDER BY d.last_name ASC, d.first_name ASC`
  );
  return rows;
}

export async function findDoctorById(id) {
  const [rows] = await pool.query(
    `SELECT d.id, d.user_id, d.first_name, d.last_name, d.specialization, d.department_id, d.phone, d.status,
            dept.name AS department_name, u.email
     FROM doctors d
     LEFT JOIN departments dept ON dept.id = d.department_id
     JOIN users u ON u.id = d.user_id
     WHERE d.id = ? LIMIT 1`,
    [id]
  );
  return rows[0] ?? null;
}

export async function findDoctorByUserId(userId) {
  const [rows] = await pool.query('SELECT id FROM doctors WHERE user_id = ? LIMIT 1', [userId]);
  return rows[0] ?? null;
}

export async function createDoctorForUser(userId, data) {
  const [result] = await pool.query(
    `INSERT INTO doctors (user_id, department_id, first_name, last_name, specialization, phone)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, data.departmentId || null, data.firstName, data.lastName, data.specialization, data.phone || null]
  );
  return findDoctorById(result.insertId);
}

export async function updateDoctor(id, data) {
  const columnByKey = {
    firstName: 'first_name',
    lastName: 'last_name',
    specialization: 'specialization',
    departmentId: 'department_id',
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
  if (fields.length === 0) return findDoctorById(id);
  values.push(id);
  await pool.query(`UPDATE doctors SET ${fields.join(', ')} WHERE id = ?`, values);
  return findDoctorById(id);
}
