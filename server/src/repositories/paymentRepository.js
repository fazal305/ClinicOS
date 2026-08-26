import { pool } from '../config/db.js';

const SELECT_FIELDS = `
  pay.id, pay.patient_id, pay.appointment_id, pay.amount, pay.method, pay.status, pay.paid_at,
  pay.created_by, pay.created_at,
  p.patient_code, p.first_name AS patient_first_name, p.last_name AS patient_last_name
`;
const FROM_JOINS = `FROM payments pay JOIN patients p ON p.id = pay.patient_id`;

export async function createPayment(data, createdBy) {
  const [result] = await pool.query(
    `INSERT INTO payments (patient_id, appointment_id, amount, method, status, paid_at, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      data.patientId,
      data.appointmentId || null,
      data.amount,
      data.method,
      data.status || 'PENDING',
      data.status === 'PAID' ? new Date() : null,
      createdBy,
    ]
  );
  return findPaymentById(result.insertId);
}

export async function findPaymentById(id) {
  const [rows] = await pool.query(`SELECT ${SELECT_FIELDS} ${FROM_JOINS} WHERE pay.id = ? LIMIT 1`, [id]);
  return rows[0] ?? null;
}

export async function updatePaymentStatus(id, status) {
  await pool.query('UPDATE payments SET status = ?, paid_at = ? WHERE id = ?', [
    status,
    status === 'PAID' ? new Date() : null,
    id,
  ]);
  return findPaymentById(id);
}

export async function listPayments(filters) {
  const conditions = [];
  const params = [];

  if (filters.patientId) {
    conditions.push('pay.patient_id = ?');
    params.push(filters.patientId);
  }
  if (filters.status) {
    conditions.push('pay.status = ?');
    params.push(filters.status);
  }
  if (filters.from) {
    conditions.push('pay.created_at >= ?');
    params.push(filters.from);
  }
  if (filters.to) {
    conditions.push('pay.created_at <= ?');
    params.push(filters.to);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const offset = (filters.page - 1) * filters.pageSize;

  const [rows] = await pool.query(
    `SELECT ${SELECT_FIELDS} ${FROM_JOINS} ${whereClause} ORDER BY pay.created_at DESC LIMIT ? OFFSET ?`,
    [...params, filters.pageSize, offset]
  );
  const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total ${FROM_JOINS} ${whereClause}`, params);

  return { rows, total };
}

export async function getPendingSummary() {
  const [[row]] = await pool.query(
    "SELECT COUNT(*) AS count, COALESCE(SUM(amount), 0) AS amount FROM payments WHERE status IN ('PENDING', 'PARTIAL')"
  );
  return row;
}

export async function getTotalRevenue() {
  const [[row]] = await pool.query("SELECT COALESCE(SUM(amount), 0) AS total FROM payments WHERE status = 'PAID'");
  return row.total;
}

export async function getRevenueOverTime(days) {
  const [rows] = await pool.query(
    `SELECT DATE(paid_at) AS date, COALESCE(SUM(amount), 0) AS total
     FROM payments
     WHERE status = 'PAID' AND paid_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
     GROUP BY DATE(paid_at)
     ORDER BY date ASC`,
    [days]
  );
  return rows;
}
