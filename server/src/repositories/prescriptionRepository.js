import { pool } from '../config/db.js';

const SELECT_FIELDS = `
  p.id, p.patient_id, p.doctor_id, p.medical_record_id, p.prescribed_date, p.notes, p.created_at,
  d.first_name AS doctor_first_name, d.last_name AS doctor_last_name
`;

export async function createPrescription(data, doctorId) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [result] = await connection.query(
      `INSERT INTO prescriptions (patient_id, doctor_id, medical_record_id, prescribed_date, notes)
       VALUES (?, ?, ?, ?, ?)`,
      [data.patientId, doctorId, data.medicalRecordId || null, data.prescribedDate, data.notes || null]
    );
    const prescriptionId = result.insertId;

    for (const item of data.items) {
      await connection.query(
        `INSERT INTO prescription_items (prescription_id, medicine_name, dosage, frequency, duration, instructions)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [prescriptionId, item.medicineName, item.dosage, item.frequency, item.duration, item.instructions || null]
      );
    }

    await connection.commit();
    return prescriptionId;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function attachItems(prescriptions) {
  if (prescriptions.length === 0) return [];
  const ids = prescriptions.map((p) => p.id);
  const [items] = await pool.query(
    `SELECT id, prescription_id, medicine_name, dosage, frequency, duration, instructions
     FROM prescription_items WHERE prescription_id IN (?)`,
    [ids]
  );
  return prescriptions.map((p) => ({
    ...p,
    items: items.filter((item) => item.prescription_id === p.id),
  }));
}

export async function findPrescriptionById(id) {
  const [rows] = await pool.query(
    `SELECT ${SELECT_FIELDS} FROM prescriptions p JOIN doctors d ON d.id = p.doctor_id WHERE p.id = ? LIMIT 1`,
    [id]
  );
  if (!rows[0]) return null;
  const [withItems] = await attachItems(rows);
  return withItems;
}

export async function listPrescriptionsByPatient(patientId) {
  const [rows] = await pool.query(
    `SELECT ${SELECT_FIELDS} FROM prescriptions p JOIN doctors d ON d.id = p.doctor_id
     WHERE p.patient_id = ? ORDER BY p.prescribed_date DESC, p.id DESC`,
    [patientId]
  );
  return attachItems(rows);
}
