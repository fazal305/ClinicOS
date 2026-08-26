import { asyncHandler } from '../utils/asyncHandler.js';
import { created, ok } from '../utils/apiResponse.js';
import * as paymentService from '../services/paymentService.js';
import {
  createPaymentSchema,
  updatePaymentStatusSchema,
  listPaymentsQuerySchema,
  idParamSchema,
} from '../validators/paymentValidators.js';

export const list = asyncHandler(async (req, res) => {
  const query = listPaymentsQuerySchema.parse(req.query);
  const { rows, meta } = await paymentService.listPayments(query, req.user);
  return ok(res, rows, meta);
});

export const create = asyncHandler(async (req, res) => {
  const data = createPaymentSchema.parse(req.body);
  const payment = await paymentService.createPayment(data, req.user);
  return created(res, payment);
});

export const getById = asyncHandler(async (req, res) => {
  const id = idParamSchema.parse(req.params.id);
  const payment = await paymentService.getPaymentForActor(id, req.user);
  return ok(res, payment);
});

export const updateStatus = asyncHandler(async (req, res) => {
  const id = idParamSchema.parse(req.params.id);
  const { status } = updatePaymentStatusSchema.parse(req.body);
  const payment = await paymentService.updateStatus(id, status, req.user);
  return ok(res, payment);
});
