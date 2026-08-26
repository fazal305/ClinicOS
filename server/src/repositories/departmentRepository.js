import { pool } from '../config/db.js';

export async function listActiveDepartments() {
  const [rows] = await pool.query(
    'SELECT id, name, description, is_active FROM departments WHERE is_active = 1 ORDER BY name ASC'
  );
  return rows;
}

export async function listAllDepartments() {
  const [rows] = await pool.query(
    'SELECT id, name, description, is_active, created_at FROM departments ORDER BY name ASC'
  );
  return rows;
}

export async function findDepartmentById(id) {
  const [rows] = await pool.query('SELECT id, name, description, is_active FROM departments WHERE id = ? LIMIT 1', [
    id,
  ]);
  return rows[0] ?? null;
}

export async function createDepartment(data) {
  const [result] = await pool.query('INSERT INTO departments (name, description) VALUES (?, ?)', [
    data.name,
    data.description || null,
  ]);
  return findDepartmentById(result.insertId);
}

export async function updateDepartment(id, data) {
  const fields = [];
  const values = [];
  if (data.name !== undefined) {
    fields.push('name = ?');
    values.push(data.name);
  }
  if (data.description !== undefined) {
    fields.push('description = ?');
    values.push(data.description || null);
  }
  if (data.isActive !== undefined) {
    fields.push('is_active = ?');
    values.push(data.isActive ? 1 : 0);
  }
  if (fields.length === 0) return findDepartmentById(id);
  values.push(id);
  await pool.query(`UPDATE departments SET ${fields.join(', ')} WHERE id = ?`, values);
  return findDepartmentById(id);
}
