import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/apiResponse.js';
import { getOverview } from '../services/reportService.js';

export const overview = asyncHandler(async (req, res) => {
  const data = await getOverview();
  return ok(res, data);
});
