import { ApiError } from '../utils/apiResponse.js';
import * as departmentRepository from '../repositories/departmentRepository.js';
import { recordAuditLog } from '../repositories/auditLogRepository.js';

export async function listDepartments(includeInactive) {
  return includeInactive ? departmentRepository.listAllDepartments() : departmentRepository.listActiveDepartments();
}

export async function createDepartment(data, actor) {
  try {
    const department = await departmentRepository.createDepartment(data);
    await recordAuditLog({
      userId: actor.id,
      action: 'DEPARTMENT_CREATED',
      entityType: 'department',
      entityId: department.id,
    });
    return department;
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      throw new ApiError(409, 'A department with this name already exists', 'DUPLICATE_DEPARTMENT');
    }
    throw error;
  }
}

export async function updateDepartment(id, data, actor) {
  const existing = await departmentRepository.findDepartmentById(id);
  if (!existing) {
    throw new ApiError(404, 'Department not found', 'NOT_FOUND');
  }
  const updated = await departmentRepository.updateDepartment(id, data);
  await recordAuditLog({
    userId: actor.id,
    action: 'DEPARTMENT_UPDATED',
    entityType: 'department',
    entityId: id,
  });
  return updated;
}
