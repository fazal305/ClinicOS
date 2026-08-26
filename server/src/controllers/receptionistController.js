import { asyncHandler } from '../utils/asyncHandler.js';
import { created, ok } from '../utils/apiResponse.js';
import * as staffService from '../services/staffService.js';
import {
  createReceptionistSchema,
  updateReceptionistSchema,
  idParamSchema,
} from '../validators/staffValidators.js';

export const list = asyncHandler(async (req, res) => {
  const receptionists = await staffService.listReceptionists();
  return ok(res, receptionists);
});

export const create = asyncHandler(async (req, res) => {
  const data = createReceptionistSchema.parse(req.body);
  const receptionist = await staffService.createReceptionist(data, req.user);
  return created(res, receptionist);
});

export const update = asyncHandler(async (req, res) => {
  const id = idParamSchema.parse(req.params.id);
  const data = updateReceptionistSchema.parse(req.body);
  const receptionist = await staffService.updateReceptionist(id, data, req.user);
  return ok(res, receptionist);
});
