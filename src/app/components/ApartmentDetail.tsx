import { useState, useEffect } from 'react';
import { ArrowRight, Plus } from 'lucide-react';
import { RoomsList } from './RoomsList';
import { RoomForm } from './RoomForm';
import { PaymentFormNew } from './PaymentFormNew';
import { PaymentsListNew } from './PaymentsListNew';
import { UtilityBillsListNew } from './UtilityBillsListNew';
import { UtilityBillForm } from './UtilityBillForm';
import { updateUtilityBillsStatus } from '../utils/paymentCalculations';
import type { Apartment, Room, Payment, UtilityBill } from '../types';

interface ApartmentDetailProps {
  apartment: Apartment;
  onBack: () => void;
  onUpdate: (apartment: Apartment) => void;
}

export function ApartmentDetail({ apartment, onBack, onUpdate }: ApartmentDetailProps) {
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showUtilityForm, setShowUtilityForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | undefined>();
  const [activeTab, setActiveTab] = useState<'rooms' | 'utilities' | 'payments'>('rooms');

  useEffect(() => {
    const updatedBills = updateUtilityBillsStatus(apartment);
    if (JSON.stringify(updatedBills) !== JSON.stringify(apartment.utilityBills)) {
      onUpdate({ ...apartment, utilityBills: updatedBills });
    }
  }, [apartment.payments, apartment.utilityBills]);

  const handleSaveRoom = (room: Omit<Room, 'id'> & { id?: string }) => {
    const rooms = room.id
      ? apartment.rooms.map((r) => (r.id === room.id ? { ...room, id: room.id } : r))
      : [...apartment.rooms, { ...room, id: Date.now().toString() }];

    onUpdate({ ...apartment, rooms });
    setShowRoomForm(false);
    setEditingRoom(undefined);
  };

  const handleDeleteRoom = (id: string) => {
    onUpdate({
      ...apartment,
      rooms: apartment.rooms.filter((r) => r.id !== id),
    });
  };

  const handleSavePayment = (payment: { month: string; paymentDate: string; roomPayments: any[]; notes?: string }) => {
    // Check if payment for this month already exists
    const existingPaymentIndex = apartment.payments.findIndex(p => p.month === payment.month);

    let payments;
    if (existingPaymentIndex !== -1) {
      // Update existing payment for this month
      payments = apartment.payments.map((p, idx) =>
        idx === existingPaymentIndex
          ? { ...p, paymentDate: payment.paymentDate, roomPayments: payment.roomPayments, notes: payment.notes }
          : p
      );
    } else {
      // Add new payment for this month
      payments = [...apartment.payments, { ...payment, id: Date.now().toString() }];
    }

    const updatedBills = updateUtilityBillsStatus({ ...apartment, payments });
    onUpdate({ ...apartment, payments, utilityBills: updatedBills });
    setShowPaymentForm(false);
  };

  const handleDeletePayment = (id: string) => {
    const payments = apartment.payments.filter((p) => p.id !== id);
    const updatedBills = updateUtilityBillsStatus({ ...apartment, payments });
    onUpdate({ ...apartment, payments, utilityBills: updatedBills });
  };

  const handleSaveUtilityBill = (bill: any) => {
    const utilityBills = bill.id
      ? apartment.utilityBills.map((b) => (b.id === bill.id ? { ...bill, id: bill.id, isPaid: false, hasDiscrepancy: false, amountPaid: 0, amountRemaining: bill.amount } : b))
      : [...apartment.utilityBills, { ...bill, id: Date.now().toString(), isPaid: false, hasDiscrepancy: false, amountPaid: 0, amountRemaining: bill.amount }];

    // Recalculate bill statuses based on existing payments
    const updatedBills = updateUtilityBillsStatus({ ...apartment, utilityBills });
    onUpdate({ ...apartment, utilityBills: updatedBills });
    setShowUtilityForm(false);
  };

  const handleDeleteUtilityBill = (id: string) => {
    onUpdate({
      ...apartment,
      utilityBills: apartment.utilityBills.filter((b) => b.id !== id),
    });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="sticky top-0 bg-white border-b p-4 z-10" dir="rtl">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={onBack} className="p-1">
            <ArrowRight className="w-6 h-6" />
          </button>
          <h1 className="text-xl">{apartment.name}</h1>
        </div>

        <div className="bg-gray-50 p-3 rounded-lg space-y-1 text-sm">
          <p>إجمالي الإيجار: <strong>{apartment.totalRent.toFixed(2)} ر.س</strong></p>
          <p className="text-xs text-gray-600">
            {apartment.rooms.length} {apartment.rooms.length === 1 ? 'غرفة' : apartment.rooms.length === 2 ? 'غرفتان' : 'غرف'} · {apartment.payments.length} {apartment.payments.length === 1 ? 'دفعة' : apartment.payments.length === 2 ? 'دفعتان' : 'دفعات'}
          </p>
        </div>

        <div className="flex gap-1 mt-3 border-b text-sm">
          <button
            onClick={() => setActiveTab('rooms')}
            className={`flex-1 py-2 ${activeTab === 'rooms' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
          >
            الغرف
          </button>
          <button
            onClick={() => setActiveTab('utilities')}
            className={`flex-1 py-2 ${activeTab === 'utilities' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
          >
            الخدمات
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`flex-1 py-2 ${activeTab === 'payments' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'}`}
          >
            المدفوعات
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-20">
        {activeTab === 'rooms' && (
          <RoomsList
            rooms={apartment.rooms}
            onAdd={() => setShowRoomForm(true)}
            onEdit={(room) => {
              setEditingRoom(room);
              setShowRoomForm(true);
            }}
            onDelete={handleDeleteRoom}
          />
        )}
        {activeTab === 'utilities' && (
          <UtilityBillsListNew
            bills={apartment.utilityBills}
            apartment={apartment}
            onAdd={() => setShowUtilityForm(true)}
            onDelete={handleDeleteUtilityBill}
          />
        )}
        {activeTab === 'payments' && (
          <PaymentsListNew
            payments={apartment.payments}
            apartment={apartment}
            onAdd={() => setShowPaymentForm(true)}
            onDelete={handleDeletePayment}
          />
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t" dir="rtl">
        <button
          onClick={() => {
            if (activeTab === 'rooms') setShowRoomForm(true);
            else if (activeTab === 'utilities') setShowUtilityForm(true);
            else setShowPaymentForm(true);
          }}
          className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          {activeTab === 'rooms' ? 'إضافة غرفة' : activeTab === 'utilities' ? 'إضافة فاتورة' : 'تسجيل دفعة'}
        </button>
      </div>

      {showRoomForm && (
        <RoomForm
          room={editingRoom}
          onSave={handleSaveRoom}
          onCancel={() => {
            setShowRoomForm(false);
            setEditingRoom(undefined);
          }}
        />
      )}

      {showPaymentForm && (
        <PaymentFormNew
          apartment={apartment}
          onSave={handleSavePayment}
          onCancel={() => setShowPaymentForm(false)}
        />
      )}

      {showUtilityForm && (
        <UtilityBillForm
          onSave={handleSaveUtilityBill}
          onCancel={() => setShowUtilityForm(false)}
        />
      )}
    </div>
  );
}
