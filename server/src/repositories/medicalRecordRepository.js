import { pool } from '../config/db.js';

const SELECT_FIELDS = `
  mr.id, mr.patient_id, mr.appointment_id, mr.doctor_id, mr.visit_date, mr.chief_complaint,
  mr.symptoms, mr.diagnosis, mr.clinical_notes, mr.treatment_plan, mr.follow_up_date,
  mr.created_at, mr.updated_at,
  d.first_name AS doctor_first_name, d.last_name AS doctor_last_name
`;

export async function createMedicalRecord(data, doctorId) {
  const [result] = await pool.query(
    `INSERT INTO medical_records
      (patient_id, appointment_id, doctor_id, visit_date, chief_complaint, symptoms, diagnosis, clinical_notes, treatment_plan, follow_up_date)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.patientId,
      data.appointmentId || null,
      doctorId,
      data.visitDate,
      data.chiefComplaint,
      data.symptoms || null,
      data.diagnosis,
      data.clinicalNotes || null,
      data.treatmentPlan || null,
      data.followUpDate || null,
    ]
  );
  return findMedicalRecordById(result.insertId);
}

export async function findMedicalRecordById(id) {
  const [rows] = await pool.query(
    `SELECT ${SELECT_FIELDS} FROM medical_records mr JOIN doctors d ON d.id = mr.doctor_id WHERE mr.id = ? LIMIT 1`,
    [id]
  );
  return rows[0] ?? null;
}

export async function listMedicalRecordsByPatient(patientId) {
  const [rows] = await pool.query(
    `SELECT ${SELECT_FIELDS} FROM medical_records mr JOIN doctors d ON d.id = mr.doctor_id
     WHERE mr.patient_id = ? ORDER BY mr.visit_date DESC, mr.id DESC`,
    [patientId]
  );
  return rows;
}
