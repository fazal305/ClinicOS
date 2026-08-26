import { ApiError } from '../utils/apiResponse.js';
import * as paymentRepository from '../repositories/paymentRepository.js';
import { findPatientByUserId } from '../repositories/patientRepository.js';
import { recordAuditLog } from '../repositories/auditLogRepository.js';

export async function createPayment(data, actor) {
  const payment = await paymentRepository.createPayment(data, actor.id);
  await recordAuditLog({ userId: actor.id, action: 'PAYMENT_RECORDED', entityType: 'payment', entityId: payment.id });
  return payment;
}

export async function updateStatus(id, status, actor) {
  const existing = await paymentRepository.findPaymentById(id);
  if (!existing) {
    throw new ApiError(404, 'Payment not found', 'NOT_FOUND');
  }
  const updated = await paymentRepository.updatePaymentStatus(id, status);
  await recordAuditLog({
    userId: actor.id,
    action: 'PAYMENT_STATUS_CHANGED',
    entityType: 'payment',
    entityId: id,
  });
  return updated;
}

export async function listPayments(query, actor) {
  const filters = { ...query };

  if (actor.role === 'PATIENT') {
    const patient = await findPatientByUserId(actor.id);
    filters.patientId = patient ? patient.id : -1;
  }

  const { rows, total } = await paymentRepository.listPayments(filters);
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

export async function getPaymentForActor(id, actor) {
  const payment = await paymentRepository.findPaymentById(id);
  if (!payment) {
    throw new ApiError(404, 'Payment not found', 'NOT_FOUND');
  }
  if (actor.role === 'PATIENT') {
    const patient = await findPatientByUserId(actor.id);
    if (!patient || patient.id !== payment.patient_id) {
      throw new ApiError(403, 'You do not have permission to view this payment', 'FORBIDDEN');
    }
  }
  return payment;
}
