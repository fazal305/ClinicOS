import { ApiError } from '../utils/apiResponse.js';
import * as prescriptionRepository from '../repositories/prescriptionRepository.js';
import { findDoctorByUserId } from '../repositories/doctorRepository.js';
import { findPatientByUserId, findPatientById } from '../repositories/patientRepository.js';
import { recordAuditLog } from '../repositories/auditLogRepository.js';

async function assertPatientAccess(patientId, actor) {
  if (actor.role === 'PATIENT') {
    const patient = await findPatientByUserId(actor.id);
    if (!patient || patient.id !== patientId) {
      throw new ApiError(403, 'You do not have permission to view this prescription', 'FORBIDDEN');
    }
  }
}

export async function createPrescription(data, actor) {
  const patient = await findPatientById(data.patientId);
  if (!patient) {
    throw new ApiError(404, 'Patient not found', 'NOT_FOUND');
  }

  const doctor = await findDoctorByUserId(actor.id);
  if (!doctor) {
    throw new ApiError(403, 'No doctor profile is linked to your account', 'FORBIDDEN');
  }

  const prescriptionId = await prescriptionRepository.createPrescription(data, doctor.id);
  await recordAuditLog({
    userId: actor.id,
    action: 'PRESCRIPTION_CREATED',
    entityType: 'prescription',
    entityId: prescriptionId,
  });
  return prescriptionRepository.findPrescriptionById(prescriptionId);
}

export async function listForPatient(patientId, actor) {
  await assertPatientAccess(patientId, actor);
  return prescriptionRepository.listPrescriptionsByPatient(patientId);
}

export async function getById(id, actor) {
  const prescription = await prescriptionRepository.findPrescriptionById(id);
  if (!prescription) {
    throw new ApiError(404, 'Prescription not found', 'NOT_FOUND');
  }
  await assertPatientAccess(prescription.patient_id, actor);
  return prescription;
}
