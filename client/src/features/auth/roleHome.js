export const ROLE_HOME = {
  ADMIN: '/admin',
  DOCTOR: '/doctor',
  RECEPTIONIST: '/reception',
  PATIENT: '/patient',
};

export function homePathForRole(role) {
  return ROLE_HOME[role] || '/login';
}
