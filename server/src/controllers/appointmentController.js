import { asyncHandler } from '../utils/asyncHandler.js';
import { created, ok } from '../utils/apiResponse.js';
import {
  createAppointmentSchema,
  rescheduleAppointmentSchema,
  updateStatusSchema,
  listAppointmentsQuerySchema,
  idParamSchema,
} from '../validators/appointmentValidators.js';
import * as appointmentService from '../services/appointmentService.js';

export const list = asyncHandler(async (req, res) => {
  const query = listAppointmentsQuerySchema.parse(req.query);
  const { rows, meta } = await appointmentService.listAppointments(query, req.user);
  return ok(res, rows, meta);
});

export const create = asyncHandler(async (req, res) => {
  const data = createAppointmentSchema.parse(req.body);
  const appointment = await appointmentService.createAppointment(data, req.user);
  return created(res, appointment);
});

export const getById = asyncHandler(async (req, res) => {
  const id = idParamSchema.parse(req.params.id);
  const appointment = await appointmentService.getAppointmentForActor(id, req.user);
  return ok(res, appointment);
});

export const reschedule = asyncHandler(async (req, res) => {
  const id = idParamSchema.parse(req.params.id);
  const data = rescheduleAppointmentSchema.parse(req.body);
  const appointment = await appointmentService.rescheduleAppointment(id, data, req.user);
  return ok(res, appointment);
});

export const updateStatus = asyncHandler(async (req, res) => {
  const id = idParamSchema.parse(req.params.id);
  const { status } = updateStatusSchema.parse(req.body);
  const appointment = await appointmentService.updateStatus(id, status, req.user);
  return ok(res, appointment);
});
