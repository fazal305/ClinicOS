import { pool } from '../config/db.js';

const SELECT_FIELDS = `
  a.id, a.patient_id, a.doctor_id, a.department_id, a.scheduled_at, a.duration_minutes,
  a.type, a.reason, a.status, a.created_by, a.created_at, a.updated_at,
  p.patient_code, p.first_name AS patient_first_name, p.last_name AS patient_last_name,
  d.first_name AS doctor_first_name, d.last_name AS doctor_last_name,
  dept.name AS department_name
`;

const FROM_JOINS = `
  FROM appointments a
  JOIN patients p ON p.id = a.patient_id
  JOIN doctors d ON d.id = a.doctor_id
  LEFT JOIN departments dept ON dept.id = a.department_id
`;

export async function createAppointment(data, createdBy) {
  const [result] = await pool.query(
    `INSERT INTO appointments
      (patient_id, doctor_id, department_id, scheduled_at, duration_minutes, type, reason, status, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'SCHEDULED', ?)`,
    [
      data.patientId,
      data.doctorId,
      data.departmentId || null,
      data.scheduledAt,
      data.durationMinutes,
      data.type,
      data.reason || null,
      createdBy,
    ]
  );
  return findAppointmentById(result.insertId);
}

export async function findAppointmentById(id) {
  const [rows] = await pool.query(`SELECT ${SELECT_FIELDS} ${FROM_JOINS} WHERE a.id = ? LIMIT 1`, [id]);
  return rows[0] ?? null;
}

// True when the given doctor already has a non-cancelled appointment whose
// time range overlaps [scheduledAt, scheduledAt + durationMinutes).
export async function findOverlappingAppointment(doctorId, scheduledAt, durationMinutes, excludeId) {
  const params = [doctorId, scheduledAt, durationMinutes, scheduledAt];
  let query = `
    SELECT id FROM appointments
    WHERE doctor_id = ?
      AND status NOT IN ('CANCELLED', 'NO_SHOW')
      AND scheduled_at < DATE_ADD(?, INTERVAL ? MINUTE)
      AND DATE_ADD(scheduled_at, INTERVAL duration_minutes MINUTE) > ?
  `;
  if (excludeId) {
    query += ' AND id != ?';
    params.push(excludeId);
  }
  query += ' LIMIT 1';

  const [rows] = await pool.query(query, params);
  return rows[0] ?? null;
}

export async function updateAppointmentFields(id, data) {
  const columnByKey = {
    doctorId: 'doctor_id',
    departmentId: 'department_id',
    scheduledAt: 'scheduled_at',
    durationMinutes: 'duration_minutes',
    type: 'type',
    reason: 'reason',
  };
  const fields = [];
  const values = [];
  for (const [key, column] of Object.entries(columnByKey)) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      fields.push(`${column} = ?`);
      values.push(data[key]);
    }
  }
  if (fields.length === 0) return findAppointmentById(id);
  values.push(id);
  await pool.query(`UPDATE appointments SET ${fields.join(', ')} WHERE id = ?`, values);
  return findAppointmentById(id);
}

export async function updateAppointmentStatus(id, status) {
  await pool.query('UPDATE appointments SET status = ? WHERE id = ?', [status, id]);
  return findAppointmentById(id);
}

export async function listAppointments(filters) {
  const conditions = [];
  const params = [];

  if (filters.date) {
    conditions.push('DATE(a.scheduled_at) = DATE(?)');
    params.push(filters.date);
  }
  if (filters.from) {
    conditions.push('a.scheduled_at >= ?');
    params.push(filters.from);
  }
  if (filters.to) {
    conditions.push('a.scheduled_at <= ?');
    params.push(filters.to);
  }
  if (filters.doctorId) {
    conditions.push('a.doctor_id = ?');
    params.push(filters.doctorId);
  }
  if (filters.patientId) {
    conditions.push('a.patient_id = ?');
    params.push(filters.patientId);
  }
  if (filters.departmentId) {
    conditions.push('a.department_id = ?');
    params.push(filters.departmentId);
  }
  if (filters.status) {
    conditions.push('a.status = ?');
    params.push(filters.status);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const offset = (filters.page - 1) * filters.pageSize;

  const [rows] = await pool.query(
    `SELECT ${SELECT_FIELDS} ${FROM_JOINS} ${whereClause}
     ORDER BY a.scheduled_at ASC
     LIMIT ? OFFSET ?`,
    [...params, filters.pageSize, offset]
  );

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) AS total ${FROM_JOINS} ${whereClause}`,
    params
  );

  return { rows, total };
}
