export interface Utilities {
  electricity: number;
  water: number;
  internet: number;
}

export interface Room {
  id: string;
  name: string;
  rent: number;
  tenantName?: string;
}

export interface UtilityBill {
  id: string;
  type: 'electricity' | 'water' | 'internet';
  month: string;
  amount: number;
  dueDay: number;
  isPaid: boolean;
  hasDiscrepancy: boolean;
  amountPaid: number;
  amountRemaining: number;
  screenshot?: string;
}

export interface RoomPayment {
  roomId: string;
  roomName: string;
  rentPaid: number;
  utilitiesPaid: Utilities;
}

export interface Payment {
  id?: string;
  month: string;
  paymentDate: string;
  roomPayments: RoomPayment[];
  notes?: string;
}

export interface Apartment {
  id: string;
  name: string;
  totalRent: number;
  paymentDueDayStart: number;
  paymentDueDayEnd: number;
  rooms: Room[];
  payments: Payment[];
  utilityBills: UtilityBill[];
}
