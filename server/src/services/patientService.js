import { ApiError } from '../utils/apiResponse.js';
import * as patientRepository from '../repositories/patientRepository.js';
import { recordAuditLog } from '../repositories/auditLogRepository.js';

export async function registerPatient(data, actor) {
  const patient = await patientRepository.createPatient(data, actor.id);
  await recordAuditLog({
    userId: actor.id,
    action: 'PATIENT_REGISTERED',
    entityType: 'patient',
    entityId: patient.id,
  });
  return patient;
}

export async function updatePatient(id, data, actor) {
  const existing = await patientRepository.findPatientById(id);
  if (!existing) {
    throw new ApiError(404, 'Patient not found', 'NOT_FOUND');
  }
  const updated = await patientRepository.updatePatientById(id, data);
  await recordAuditLog({
    userId: actor.id,
    action: 'PATIENT_UPDATED',
    entityType: 'patient',
    entityId: id,
  });
  return updated;
}

export async function listPatients(query) {
  const { rows, total } = await patientRepository.listPatients(query);
  return {
    rows,
    meta: {
      page: query.page,
      pageSize: query.pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.pageSize)),
    },
  };
}

// A PATIENT caller may only ever see their own record; every other role
// (ADMIN/DOCTOR/RECEPTIONIST) can see any patient — enforced here, not just
// hidden in the UI, since this is called directly from the controller.
export async function getPatientForActor(id, actor) {
  const patient = await patientRepository.findPatientById(id);
  if (!patient) {
    throw new ApiError(404, 'Patient not found', 'NOT_FOUND');
  }
  if (actor.role === 'PATIENT' && patient.user_id !== actor.id) {
    throw new ApiError(403, 'You do not have permission to view this record', 'FORBIDDEN');
  }
  return patient;
}

export async function getOwnPatientRecord(actor) {
  const patient = await patientRepository.findPatientByUserId(actor.id);
  if (!patient) {
    throw new ApiError(404, 'No patient record is linked to your account', 'NOT_FOUND');
  }
  return patient;
}
