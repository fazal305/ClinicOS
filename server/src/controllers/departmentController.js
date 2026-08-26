import { asyncHandler } from '../utils/asyncHandler.js';
import { created, ok } from '../utils/apiResponse.js';
import { createDepartmentSchema, updateDepartmentSchema, idParamSchema } from '../validators/departmentValidators.js';
import * as departmentService from '../services/departmentService.js';

export const list = asyncHandler(async (req, res) => {
  const includeInactive = req.user.role === 'ADMIN' && req.query.all === 'true';
  const departments = await departmentService.listDepartments(includeInactive);
  return ok(res, departments);
});

export const create = asyncHandler(async (req, res) => {
  const data = createDepartmentSchema.parse(req.body);
  const department = await departmentService.createDepartment(data, req.user);
  return created(res, department);
});

export const update = asyncHandler(async (req, res) => {
  const id = idParamSchema.parse(req.params.id);
  const data = updateDepartmentSchema.parse(req.body);
  const department = await departmentService.updateDepartment(id, data, req.user);
  return ok(res, department);
});
