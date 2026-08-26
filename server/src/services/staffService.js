import { ApiError } from '../utils/apiResponse.js';
import { hashPassword } from '../utils/password.js';
import { createUser, setUserActive } from '../repositories/userRepository.js';
import * as doctorRepository from '../repositories/doctorRepository.js';
import * as receptionistRepository from '../repositories/receptionistRepository.js';
import { recordAuditLog } from '../repositories/auditLogRepository.js';

async function provisionUser(email, initialPassword, role) {
  try {
    const passwordHash = await hashPassword(initialPassword);
    return await createUser(email, passwordHash, role);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new ApiError(409, 'An account with this email already exists', 'DUPLICATE_EMAIL');
    }
    throw error;
  }
}

export async function listDoctors() {
  return doctorRepository.listAllDoctors();
}

export async function createDoctor(data, actor) {
  const userId = await provisionUser(data.email, data.initialPassword, 'DOCTOR');
  const doctor = await doctorRepository.createDoctorForUser(userId, data);
  await recordAuditLog({ userId: actor.id, action: 'DOCTOR_CREATED', entityType: 'doctor', entityId: doctor.id });
  return doctor;
}

export async function updateDoctor(id, data, actor) {
  const existing = await doctorRepository.findDoctorById(id);
  if (!existing) {
    throw new ApiError(404, 'Doctor not found', 'NOT_FOUND');
  }
  const updated = await doctorRepository.updateDoctor(id, data);
  if (data.status !== undefined) {
    await setUserActive(existing.user_id, data.status === 'ACTIVE');
  }
  await recordAuditLog({ userId: actor.id, action: 'DOCTOR_UPDATED', entityType: 'doctor', entityId: id });
  return updated;
}

export async function listReceptionists() {
  return receptionistRepository.listAllReceptionists();
}

export async function createReceptionist(data, actor) {
  const userId = await provisionUser(data.email, data.initialPassword, 'RECEPTIONIST');
  const receptionist = await receptionistRepository.createReceptionistForUser(userId, data);
  await recordAuditLog({
    userId: actor.id,
    action: 'RECEPTIONIST_CREATED',
    entityType: 'receptionist',
    entityId: receptionist.id,
  });
  return receptionist;
}

export async function updateReceptionist(id, data, actor) {
  const existing = await receptionistRepository.findReceptionistById(id);
  if (!existing) {
    throw new ApiError(404, 'Receptionist not found', 'NOT_FOUND');
  }
  const updated = await receptionistRepository.updateReceptionist(id, data);
  if (data.status !== undefined) {
    await setUserActive(existing.user_id, data.status === 'ACTIVE');
  }
  await recordAuditLog({
    userId: actor.id,
    action: 'RECEPTIONIST_UPDATED',
    entityType: 'receptionist',
    entityId: id,
  });
  return updated;
}
