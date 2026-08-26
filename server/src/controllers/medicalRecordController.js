import { asyncHandler } from '../utils/asyncHandler.js';
import { created, ok } from '../utils/apiResponse.js';
import {
  createMedicalRecordSchema,
  listMedicalRecordsQuerySchema,
  idParamSchema,
} from '../validators/medicalRecordValidators.js';
import * as medicalRecordService from '../services/medicalRecordService.js';

export const create = asyncHandler(async (req, res) => {
  const data = createMedicalRecordSchema.parse(req.body);
  const record = await medicalRecordService.createMedicalRecord(data, req.user);
  return created(res, record);
});

export const list = asyncHandler(async (req, res) => {
  const { patientId } = listMedicalRecordsQuerySchema.parse(req.query);
  const records = await medicalRecordService.listForPatient(patientId, req.user);
  return ok(res, records);
});

export const getById = asyncHandler(async (req, res) => {
  const id = idParamSchema.parse(req.params.id);
  const record = await medicalRecordService.getById(id, req.user);
  return ok(res, record);
});
