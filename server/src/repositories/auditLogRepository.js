import { pool } from '../config/db.js';

export async function recordAuditLog({ userId, action, entityType, entityId }) {
  await pool.query(
    'INSERT INTO audit_logs (user_id, action, entity_type, entity_id) VALUES (?, ?, ?, ?)',
    [userId ?? null, action, entityType, entityId ?? null]
  );
}

export async function listAuditLogs({ page, pageSize }) {
  const offset = (page - 1) * pageSize;
  const [rows] = await pool.query(
    `SELECT al.id, al.action, al.entity_type, al.entity_id, al.created_at, u.email AS user_email
     FROM audit_logs al LEFT JOIN users u ON u.id = al.user_id
     ORDER BY al.created_at DESC, al.id DESC
     LIMIT ? OFFSET ?`,
    [pageSize, offset]
  );
  const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM audit_logs');
  return { rows, total };
}
