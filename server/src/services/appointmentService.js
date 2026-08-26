import { ApiError } from '../utils/apiResponse.js';
import * as appointmentRepository from '../repositories/appointmentRepository.js';
import { findDoctorById, findDoctorByUserId } from '../repositories/doctorRepository.js';
import { findPatientByUserId } from '../repositories/patientRepository.js';
import { recordAuditLog } from '../repositories/auditLogRepository.js';

const DOCTOR_ALLOWED_STATUSES = ['IN_PROGRESS', 'COMPLETED', 'NO_SHOW'];

async function assertNoConflict(doctorId, scheduledAt, durationMinutes, excludeId) {
  const conflict = await appointmentRepository.findOverlappingAppointment(
    doctorId,
    scheduledAt,
    durationMinutes,
    excludeId
  );
  if (conflict) {
    throw new ApiError(409, 'This doctor already has an appointment during that time', 'APPOINTMENT_CONFLICT');
  }
}

export async function createAppointment(data, actor) {
  const doctor = await findDoctorById(data.doctorId);
  if (!doctor || doctor.status !== 'ACTIVE') {
    throw new ApiError(400, 'Selected doctor is not available', 'INVALID_DOCTOR');
  }

  await assertNoConflict(data.doctorId, data.scheduledAt, data.durationMinutes);

  const appointment = await appointmentRepository.createAppointment(data, actor.id);
  await recordAuditLog({
    userId: actor.id,
    action: 'APPOINTMENT_CREATED',
    entityType: 'appointment',
    entityId: appointment.id,
  });
  return appointment;
}

export async function rescheduleAppointment(id, data, actor) {
  const existing = await appointmentRepository.findAppointmentById(id);
  if (!existing) {
    throw new ApiError(404, 'Appointment not found', 'NOT_FOUND');
  }

  const doctorId = data.doctorId ?? existing.doctor_id;
  const scheduledAt = data.scheduledAt ?? existing.scheduled_at;
  const durationMinutes = data.durationMinutes ?? existing.duration_minutes;

  const timeOrDoctorChanged =
    data.doctorId !== undefined || data.scheduledAt !== undefined || data.durationMinutes !== undefined;
  if (timeOrDoctorChanged) {
    await assertNoConflict(doctorId, scheduledAt, durationMinutes, id);
  }

  const updated = await appointmentRepository.updateAppointmentFields(id, data);
  await recordAuditLog({
    userId: actor.id,
    action: 'APPOINTMENT_RESCHEDULED',
    entityType: 'appointment',
    entityId: id,
  });
  return updated;
}

export async function updateStatus(id, status, actor) {
  const existing = await appointmentRepository.findAppointmentById(id);
  if (!existing) {
    throw new ApiError(404, 'Appointment not found', 'NOT_FOUND');
  }

  if (actor.role === 'DOCTOR') {
    const doctor = await findDoctorByUserId(actor.id);
    if (!doctor || doctor.id !== existing.doctor_id) {
      throw new ApiError(403, 'You can only update your own appointments', 'FORBIDDEN');
    }
    if (!DOCTOR_ALLOWED_STATUSES.includes(status)) {
      throw new ApiError(403, 'Doctors cannot set this status', 'FORBIDDEN');
    }
  }

  const updated = await appointmentRepository.updateAppointmentStatus(id, status);
  await recordAuditLog({
    userId: actor.id,
    action: 'APPOINTMENT_STATUS_CHANGED',
    entityType: 'appointment',
    entityId: id,
  });
  return updated;
}

export async function listAppointments(query, actor) {
  const filters = { ...query };

  if (actor.role === 'DOCTOR' && !query.patientId) {
    // Default doctor view is "my queue" (own appointments only). When a
    // specific patientId is requested (e.g. viewing that patient's history),
    // doctors may see it regardless of which doctor treated them, matching
    // the clinic's "all patients visible to all doctors" policy.
    const doctor = await findDoctorByUserId(actor.id);
    filters.doctorId = doctor ? doctor.id : -1;
  } else if (actor.role === 'PATIENT') {
    // A patient may only ever see their own appointments, regardless of
    // what patientId (if any) was requested.
    const patient = await findPatientByUserId(actor.id);
    filters.patientId = patient ? patient.id : -1;
  }

  const { rows, total } = await appointmentRepository.listAppointments(filters);
  return {
    rows,
    meta: {
      page: filters.page,
      pageSize: filters.pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / filters.pageSize)),
    },
  };
}

export async function getAppointmentForActor(id, actor) {
  const appointment = await appointmentRepository.findAppointmentById(id);
  if (!appointment) {
    throw new ApiError(404, 'Appointment not found', 'NOT_FOUND');
  }

  if (actor.role === 'DOCTOR') {
    const doctor = await findDoctorByUserId(actor.id);
    if (!doctor || doctor.id !== appointment.doctor_id) {
      throw new ApiError(403, 'You do not have permission to view this appointment', 'FORBIDDEN');
    }
  } else if (actor.role === 'PATIENT') {
    const patient = await findPatientByUserId(actor.id);
    if (!patient || patient.id !== appointment.patient_id) {
      throw new ApiError(403, 'You do not have permission to view this appointment', 'FORBIDDEN');
    }
  }

  return appointment;
}
