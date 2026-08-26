import { ApiError } from '../utils/apiResponse.js';
import * as medicalRecordRepository from '../repositories/medicalRecordRepository.js';
import { findDoctorByUserId } from '../repositories/doctorRepository.js';
import { findPatientByUserId, findPatientById } from '../repositories/patientRepository.js';
import { recordAuditLog } from '../repositories/auditLogRepository.js';

async function assertPatientAccess(patientId, actor) {
  if (actor.role === 'PATIENT') {
    const patient = await findPatientByUserId(actor.id);
    if (!patient || patient.id !== patientId) {
      throw new ApiError(403, 'You do not have permission to view this record', 'FORBIDDEN');
    }
  }
}

export async function createMedicalRecord(data, actor) {
  const patient = await findPatientById(data.patientId);
  if (!patient) {
    throw new ApiError(404, 'Patient not found', 'NOT_FOUND');
  }

  const doctor = await findDoctorByUserId(actor.id);
  if (!doctor) {
    throw new ApiError(403, 'No doctor profile is linked to your account', 'FORBIDDEN');
  }

  const record = await medicalRecordRepository.createMedicalRecord(data, doctor.id);
  await recordAuditLog({
    userId: actor.id,
    action: 'MEDICAL_RECORD_CREATED',
    entityType: 'medical_record',
    entityId: record.id,
  });
  return record;
}

export async function listForPatient(patientId, actor) {
  await assertPatientAccess(patientId, actor);
  return medicalRecordRepository.listMedicalRecordsByPatient(patientId);
}

export async function getById(id, actor) {
  const record = await medicalRecordRepository.findMedicalRecordById(id);
  if (!record) {
    throw new ApiError(404, 'Medical record not found', 'NOT_FOUND');
  }
  await assertPatientAccess(record.patient_id, actor);
  return record;
}
