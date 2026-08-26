// Centralized per-role navigation. Only routes that are actually implemented
// belong here — see section 27 of the project brief: no links to unbuilt pages.
export const NAV_BY_ROLE = {
  ADMIN: [
    { label: 'Dashboard', to: '/admin' },
    { label: 'Patients', to: '/patients' },
    { label: 'Appointments', to: '/appointments' },
    { label: "Today's Queue", to: '/queue' },
    { label: 'Doctors', to: '/admin/doctors' },
    { label: 'Departments', to: '/admin/departments' },
    { label: 'Receptionists', to: '/admin/receptionists' },
    { label: 'Payments', to: '/payments' },
    { label: 'Audit Log', to: '/admin/audit-log' },
  ],
  DOCTOR: [
    { label: 'Dashboard', to: '/doctor' },
    { label: 'Patients', to: '/patients' },
    { label: 'Appointments', to: '/appointments' },
    { label: "Today's Queue", to: '/queue' },
  ],
  RECEPTIONIST: [
    { label: 'Dashboard', to: '/reception' },
    { label: 'Patients', to: '/patients' },
    { label: 'Appointments', to: '/appointments' },
    { label: "Today's Queue", to: '/queue' },
    { label: 'Payments', to: '/payments' },
  ],
  PATIENT: [
    { label: 'Dashboard', to: '/patient' },
    { label: 'My Profile', to: '/patients/me' },
    { label: 'Appointments', to: '/appointments' },
    { label: 'Payments', to: '/payments' },
  ],
};

export const ROLE_LABEL = {
  ADMIN: 'Administrator',
  DOCTOR: 'Doctor',
  RECEPTIONIST: 'Receptionist',
  PATIENT: 'Patient',
};
