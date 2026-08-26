import { asyncHandler } from '../utils/asyncHandler.js';
import { created, ok } from '../utils/apiResponse.js';
import { listActiveDoctors } from '../repositories/doctorRepository.js';
import * as staffService from '../services/staffService.js';
import { createDoctorSchema, updateDoctorSchema, idParamSchema } from '../validators/staffValidators.js';

export const list = asyncHandler(async (req, res) => {
  if (req.user.role === 'ADMIN' && req.query.all === 'true') {
    const doctors = await staffService.listDoctors();
    return ok(res, doctors);
  }
  const departmentId = req.query.departmentId ? Number(req.query.departmentId) : undefined;
  const doctors = await listActiveDoctors({ departmentId });
  return ok(res, doctors);
});

export const create = asyncHandler(async (req, res) => {
  const data = createDoctorSchema.parse(req.body);
  const doctor = await staffService.createDoctor(data, req.user);
  return created(res, doctor);
});

export const update = asyncHandler(async (req, res) => {
  const id = idParamSchema.parse(req.params.id);
  const data = updateDoctorSchema.parse(req.body);
  const doctor = await staffService.updateDoctor(id, data, req.user);
  return ok(res, doctor);
});
