import { z } from 'zod';

export const APPOINTMENT_TYPE_OPTIONS = [
  { value: 'NEW_VISIT', label: 'New visit' },
  { value: 'FOLLOW_UP', label: 'Follow-up' },
  { value: 'CONSULTATION', label: 'Consultation' },
  { value: 'PROCEDURE', label: 'Procedure' },
];

export const STATUS_LABEL = {
  SCHEDULED: 'Scheduled',
  CONFIRMED: 'Confirmed',
  WAITING: 'Waiting',
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  NO_SHOW: 'No-show',
};

export const STATUS_TONE = {
  SCHEDULED: 'neutral',
  CONFIRMED: 'info',
  WAITING: 'warning',
  IN_PROGRESS: 'info',
  COMPLETED: 'success',
  CANCELLED: 'danger',
  NO_SHOW: 'danger',
};

export const appointmentFormSchema = z.object({
  patientId: z.coerce.number({ invalid_type_error: 'Select a patient' }).int().positive('Select a patient'),
  doctorId: z.coerce.number({ invalid_type_error: 'Select a doctor' }).int().positive('Select a doctor'),
  departmentId: z.preprocess(
    (value) => (value === '' || value === undefined ? undefined : value),
    z.coerce.number().int().positive().optional()
  ),
  date: z.string().min(1, 'Select a date'),
  time: z.string().min(1, 'Select a time'),
  durationMinutes: z.coerce.number().int().min(5).max(240).optional().default(30),
  type: z.enum(['NEW_VISIT', 'FOLLOW_UP', 'CONSULTATION', 'PROCEDURE']),
  reason: z.string().trim().max(500).optional(),
});

// Which status transitions each role may trigger from the current status,
// mirrors the server-side rule in appointmentService.js (the real boundary —
// this only decides which buttons to show).
export function getAvailableActions(status, role) {
  if (role === 'ADMIN' || role === 'RECEPTIONIST') {
    const actions = {
      SCHEDULED: [
        { label: 'Confirm', next: 'CONFIRMED' },
        { label: 'Cancel', next: 'CANCELLED', variant: 'danger' },
      ],
      CONFIRMED: [
        { label: 'Mark arrived', next: 'WAITING' },
        { label: 'No-show', next: 'NO_SHOW', variant: 'danger' },
        { label: 'Cancel', next: 'CANCELLED', variant: 'danger' },
      ],
      WAITING: [
        { label: 'Cancel', next: 'CANCELLED', variant: 'danger' },
      ],
    };
    return actions[status] || [];
  }

  if (role === 'DOCTOR') {
    // IN_PROGRESS has no quick-action here on purpose: completing a visit
    // requires documenting it first (see VisitDocumentationPage), which
    // marks the appointment COMPLETED as part of that submission.
    const actions = {
      WAITING: [{ label: 'Start visit', next: 'IN_PROGRESS' }],
      CONFIRMED: [{ label: 'No-show', next: 'NO_SHOW', variant: 'danger' }],
      SCHEDULED: [{ label: 'No-show', next: 'NO_SHOW', variant: 'danger' }],
    };
    return actions[status] || [];
  }

  return [];
}
