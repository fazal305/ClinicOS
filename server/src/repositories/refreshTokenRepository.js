import { pool } from '../config/db.js';

export async function storeRefreshToken(userId, tokenHash, expiresAt) {
  await pool.query(
    'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
    [userId, tokenHash, expiresAt]
  );
}

export async function findActiveRefreshToken(tokenHash) {
  const [rows] = await pool.query(
    `SELECT id, user_id, expires_at, revoked_at FROM refresh_tokens
     WHERE token_hash = ? AND revoked_at IS NULL AND expires_at > NOW() LIMIT 1`,
    [tokenHash]
  );
  return rows[0] ?? null;
}

export async function revokeRefreshToken(tokenHash) {
  await pool.query('UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = ?', [tokenHash]);
}

export async function revokeAllForUser(userId) {
  await pool.query('UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = ? AND revoked_at IS NULL', [userId]);
}
