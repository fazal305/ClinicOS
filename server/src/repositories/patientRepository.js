import { pool } from '../config/db.js';

const SORT_COLUMNS = {
  name: 'last_name, first_name',
  created_at: 'created_at',
  date_of_birth: 'date_of_birth',
};

export async function generateNextPatientCode() {
  const [rows] = await pool.query(
    "SELECT patient_code FROM patients WHERE patient_code LIKE 'PT-%' ORDER BY id DESC LIMIT 1"
  );
  if (rows.length === 0) return 'PT-0001';
  const lastNumber = Number(rows[0].patient_code.split('-')[1]) || 0;
  return `PT-${String(lastNumber + 1).padStart(4, '0')}`;
}

export async function createPatient(data, registeredBy) {
  const patientCode = await generateNextPatientCode();
  const [result] = await pool.query(
    `INSERT INTO patients
      (patient_code, first_name, last_name, date_of_birth, gender, phone, email, address,
       emergency_contact_name, emergency_contact_phone, blood_group, allergies, registered_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      patientCode,
      data.firstName,
      data.lastName,
      data.dateOfBirth,
      data.gender,
      data.phone,
      data.email || null,
      data.address || null,
      data.emergencyContactName || null,
      data.emergencyContactPhone || null,
      data.bloodGroup || 'UNKNOWN',
      data.allergies || null,
      registeredBy,
    ]
  );
  return findPatientById(result.insertId);
}

export async function updatePatientById(id, data) {
  const fields = [];
  const values = [];
  const columnByKey = {
    firstName: 'first_name',
    lastName: 'last_name',
    dateOfBirth: 'date_of_birth',
    gender: 'gender',
    phone: 'phone',
    email: 'email',
    address: 'address',
    emergencyContactName: 'emergency_contact_name',
    emergencyContactPhone: 'emergency_contact_phone',
    bloodGroup: 'blood_group',
    allergies: 'allergies',
  };

  for (const [key, column] of Object.entries(columnByKey)) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      fields.push(`${column} = ?`);
      values.push(data[key] || null);
    }
  }

  if (fields.length === 0) return findPatientById(id);

  values.push(id);
  await pool.query(`UPDATE patients SET ${fields.join(', ')} WHERE id = ?`, values);
  return findPatientById(id);
}

export async function findPatientById(id) {
  const [rows] = await pool.query('SELECT * FROM patients WHERE id = ? LIMIT 1', [id]);
  return rows[0] ?? null;
}

export async function findPatientByUserId(userId) {
  const [rows] = await pool.query('SELECT * FROM patients WHERE user_id = ? LIMIT 1', [userId]);
  return rows[0] ?? null;
}

export async function listPatients({ search, page, pageSize, sortBy, sortDir }) {
  const conditions = [];
  const params = [];

  if (search) {
    conditions.push(
      '(patient_code LIKE ? OR CONCAT(first_name, " ", last_name) LIKE ? OR phone LIKE ? OR email LIKE ?)'
    );
    const like = `%${search}%`;
    params.push(like, like, like, like);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const orderColumn = SORT_COLUMNS[sortBy] || SORT_COLUMNS.created_at;
  const direction = sortDir === 'asc' ? 'ASC' : 'DESC';
  const offset = (page - 1) * pageSize;

  const [rows] = await pool.query(
    `SELECT id, patient_code, first_name, last_name, date_of_birth, gender, phone, email, blood_group, created_at
     FROM patients ${whereClause}
     ORDER BY ${orderColumn} ${direction}
     LIMIT ? OFFSET ?`,
    [...params, pageSize, offset]
  );

  const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM patients ${whereClause}`, params);

  return { rows, total };
}
