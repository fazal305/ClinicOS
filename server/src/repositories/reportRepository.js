import { pool } from '../config/db.js';

export async function getTodaysAppointmentsCount() {
  const [[row]] = await pool.query('SELECT COUNT(*) AS count FROM appointments WHERE DATE(scheduled_at) = CURDATE()');
  return row.count;
}

export async function getTotalPatientsCount() {
  const [[row]] = await pool.query('SELECT COUNT(*) AS count FROM patients');
  return row.count;
}

export async function getActiveDoctorsCount() {
  const [[row]] = await pool.query("SELECT COUNT(*) AS count FROM doctors WHERE status = 'ACTIVE'");
  return row.count;
}

export async function getCompletedVisitsTodayCount() {
  const [[row]] = await pool.query(
    "SELECT COUNT(*) AS count FROM appointments WHERE status = 'COMPLETED' AND DATE(scheduled_at) = CURDATE()"
  );
  return row.count;
}

export async function getAppointmentsOverTime(days) {
  const [rows] = await pool.query(
    `SELECT DATE(scheduled_at) AS date, COUNT(*) AS count
     FROM appointments
     WHERE scheduled_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
     GROUP BY DATE(scheduled_at)
     ORDER BY date ASC`,
    [days]
  );
  return rows;
}

export async function getPatientsRegisteredOverTime(days) {
  const [rows] = await pool.query(
    `SELECT DATE(created_at) AS date, COUNT(*) AS count
     FROM patients
     WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
     GROUP BY DATE(created_at)
     ORDER BY date ASC`,
    [days]
  );
  return rows;
}

export async function getAppointmentsByDoctor() {
  const [rows] = await pool.query(
    `SELECT CONCAT('Dr. ', d.first_name, ' ', d.last_name) AS label, COUNT(a.id) AS count
     FROM doctors d
     LEFT JOIN appointments a ON a.doctor_id = d.id
     WHERE d.status = 'ACTIVE'
     GROUP BY d.id, label
     ORDER BY count DESC`
  );
  return rows;
}

export async function getAppointmentsByDepartment() {
  const [rows] = await pool.query(
    `SELECT dept.name AS label, COUNT(a.id) AS count
     FROM departments dept
     LEFT JOIN appointments a ON a.department_id = dept.id
     WHERE dept.is_active = 1
     GROUP BY dept.id, label
     ORDER BY count DESC`
  );
  return rows;
}
