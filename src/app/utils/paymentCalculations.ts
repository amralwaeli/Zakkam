import type { Apartment, UtilityBill, Payment } from '../types';

export function calculateUtilityBillStatus(
  apartment: Apartment,
  bill: UtilityBill
): {
  amountPaid: number;
  amountRemaining: number;
  isPaid: boolean;
  hasDiscrepancy: boolean;
} {
  const monthPayments = apartment.payments.filter(p => p.month === bill.month);

  let totalPaid = 0;
  monthPayments.forEach(payment => {
    payment.roomPayments.forEach(rp => {
      totalPaid += rp.utilitiesPaid[bill.type] || 0;
    });
  });

  const amountRemaining = bill.amount - totalPaid;
  const isPaid = Math.abs(amountRemaining) < 0.01;
  const hasDiscrepancy = totalPaid > bill.amount;

  return {
    amountPaid: totalPaid,
    amountRemaining: Math.max(0, amountRemaining),
    isPaid,
    hasDiscrepancy,
  };
}

export function calculateRentStatus(
  apartment: Apartment,
  month: string
): {
  expectedTotal: number;
  actualTotal: number;
  roomsTotal: number;
  isPaid: boolean;
  hasDiscrepancy: boolean;
  amountRemaining: number;
} {
  const roomsTotal = apartment.rooms.reduce((sum, room) => sum + room.rent, 0);
  const expectedTotal = apartment.totalRent;

  const monthPayments = apartment.payments.filter(p => p.month === month);
  let actualTotal = 0;
  monthPayments.forEach(payment => {
    payment.roomPayments.forEach(rp => {
      actualTotal += rp.rentPaid;
    });
  });

  const amountRemaining = expectedTotal - actualTotal;
  const isPaid = Math.abs(amountRemaining) < 0.01;
  const hasDiscrepancy = roomsTotal !== expectedTotal || actualTotal > expectedTotal;

  return {
    expectedTotal,
    actualTotal,
    roomsTotal,
    isPaid,
    hasDiscrepancy,
    amountRemaining: Math.max(0, amountRemaining),
  };
}

export function updateUtilityBillsStatus(apartment: Apartment): UtilityBill[] {
  return apartment.utilityBills.map(bill => {
    const status = calculateUtilityBillStatus(apartment, bill);
    return {
      ...bill,
      isPaid: status.isPaid,
      hasDiscrepancy: status.hasDiscrepancy,
      amountPaid: status.amountPaid,
      amountRemaining: status.amountRemaining,
    };
  });
}
