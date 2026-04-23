import type { Apartment } from '../types';
import { calculateRentStatus } from './paymentCalculations';

export function getApartmentStatus(apartment: Apartment): {
  hasIssues: boolean;
  missingRentPayment: boolean;
  missingUtilityBills: boolean;
  overdueUtilities: string[];
} {
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

  const rentStatus = calculateRentStatus(apartment, currentMonth);
  const missingRentPayment = currentDay > apartment.paymentDueDayEnd && !rentStatus.isPaid;

  const utilityDueDays = {
    water: 2,
    internet: 13,
    electricity: 17,
  };

  const overdueUtilities: string[] = [];

  Object.entries(utilityDueDays).forEach(([type, dueDay]) => {
    if (currentDay > dueDay) {
      const bill = apartment.utilityBills.find(
        b => b.type === type && b.month === currentMonth
      );

      // Only flag as overdue if:
      // 1. Bill doesn't exist, OR
      // 2. Bill exists but is not fully paid (isPaid = false), OR
      // 3. Bill exists and is paid but has no screenshot
      if (!bill) {
        overdueUtilities.push(type);
      } else if (!bill.isPaid || !bill.screenshot) {
        overdueUtilities.push(type);
      }
      // If bill.isPaid === true AND bill.screenshot exists, no warning
    }
  });

  const missingUtilityBills = overdueUtilities.length > 0;
  const hasIssues = missingRentPayment || missingUtilityBills;

  return {
    hasIssues,
    missingRentPayment,
    missingUtilityBills,
    overdueUtilities,
  };
}
