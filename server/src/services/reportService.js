import * as reportRepository from '../repositories/reportRepository.js';
import * as paymentRepository from '../repositories/paymentRepository.js';

const CHART_WINDOW_DAYS = 14;

export async function getOverview() {
  const [
    todaysAppointments,
    totalPatients,
    activeDoctors,
    completedVisitsToday,
    pendingPayments,
    totalRevenue,
    appointmentsOverTime,
    patientsRegisteredOverTime,
    revenueOverTime,
    appointmentsByDoctor,
    appointmentsByDepartment,
  ] = await Promise.all([
    reportRepository.getTodaysAppointmentsCount(),
    reportRepository.getTotalPatientsCount(),
    reportRepository.getActiveDoctorsCount(),
    reportRepository.getCompletedVisitsTodayCount(),
    paymentRepository.getPendingSummary(),
    paymentRepository.getTotalRevenue(),
    reportRepository.getAppointmentsOverTime(CHART_WINDOW_DAYS),
    reportRepository.getPatientsRegisteredOverTime(CHART_WINDOW_DAYS),
    paymentRepository.getRevenueOverTime(CHART_WINDOW_DAYS),
    reportRepository.getAppointmentsByDoctor(),
    reportRepository.getAppointmentsByDepartment(),
  ]);

  return {
    cards: {
      todaysAppointments,
      totalPatients,
      activeDoctors,
      completedVisitsToday,
      pendingPaymentsCount: pendingPayments.count,
      pendingPaymentsAmount: Number(pendingPayments.amount),
      totalRevenue: Number(totalRevenue),
    },
    charts: {
      appointmentsOverTime,
      patientsRegisteredOverTime,
      revenueOverTime,
      appointmentsByDoctor,
      appointmentsByDepartment,
    },
  };
}
