import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { env } from '../config/env.js';

export function signAccessToken(payload) {
  return jwt.sign(payload, env.jwt.accessSecret, { expiresIn: env.jwt.accessTtl });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.jwt.accessSecret);
}

export function generateRefreshToken() {
  return crypto.randomBytes(48).toString('hex');
}

export function hashRefreshToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function refreshTtlToDate() {
  const ttl = env.jwt.refreshTtl;
  const match = /^(\d+)([smhd])$/.exec(ttl);
  const amount = match ? Number(match[1]) : 7;
  const unit = match ? match[2] : 'd';
  const unitMs = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[unit];
  return new Date(Date.now() + amount * unitMs);
}
