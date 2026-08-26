import { asyncHandler } from '../utils/asyncHandler.js';
import { created, ok } from '../utils/apiResponse.js';
import {
  createPrescriptionSchema,
  listPrescriptionsQuerySchema,
  idParamSchema,
} from '../validators/prescriptionValidators.js';
import * as prescriptionService from '../services/prescriptionService.js';

export const create = asyncHandler(async (req, res) => {
  const data = createPrescriptionSchema.parse(req.body);
  const prescription = await prescriptionService.createPrescription(data, req.user);
  return created(res, prescription);
});

export const list = asyncHandler(async (req, res) => {
  const { patientId } = listPrescriptionsQuerySchema.parse(req.query);
  const prescriptions = await prescriptionService.listForPatient(patientId, req.user);
  return ok(res, prescriptions);
});

export const getById = asyncHandler(async (req, res) => {
  const id = idParamSchema.parse(req.params.id);
  const prescription = await prescriptionService.getById(id, req.user);
  return ok(res, prescription);
});
