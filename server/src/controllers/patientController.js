import { asyncHandler } from '../utils/asyncHandler.js';
import { created, ok } from '../utils/apiResponse.js';
import {
  registerPatientSchema,
  updatePatientSchema,
  listPatientsQuerySchema,
  patientIdParamSchema,
} from '../validators/patientValidators.js';
import * as patientService from '../services/patientService.js';

export const list = asyncHandler(async (req, res) => {
  const query = listPatientsQuerySchema.parse(req.query);
  const { rows, meta } = await patientService.listPatients(query);
  return ok(res, rows, meta);
});

export const register = asyncHandler(async (req, res) => {
  const data = registerPatientSchema.parse(req.body);
  const patient = await patientService.registerPatient(data, req.user);
  return created(res, patient);
});

export const getById = asyncHandler(async (req, res) => {
  const id = patientIdParamSchema.parse(req.params.id);
  const patient = await patientService.getPatientForActor(id, req.user);
  return ok(res, patient);
});

export const getOwn = asyncHandler(async (req, res) => {
  const patient = await patientService.getOwnPatientRecord(req.user);
  return ok(res, patient);
});

export const update = asyncHandler(async (req, res) => {
  const id = patientIdParamSchema.parse(req.params.id);
  const data = updatePatientSchema.parse(req.body);
  const patient = await patientService.updatePatient(id, data, req.user);
  return ok(res, patient);
});
