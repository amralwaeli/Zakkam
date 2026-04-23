import { useState } from 'react';
import { X } from 'lucide-react';
import type { Apartment, RoomPayment } from '../types';

interface PaymentFormNewProps {
  apartment: Apartment;
  onSave: (payment: { month: string; paymentDate: string; roomPayments: RoomPayment[]; notes?: string }) => void;
  onCancel: () => void;
}

export function PaymentFormNew({ apartment, onSave, onCancel }: PaymentFormNewProps) {
  const today = new Date().toISOString().split('T')[0];
  const currentMonth = new Date().toISOString().substring(0, 7);

  const [month, setMonth] = useState(currentMonth);
  const [paymentDate, setPaymentDate] = useState(today);
  const [notes, setNotes] = useState('');

  // Check if editing existing payment or creating new
  const existingPayment = apartment.payments.find(p => p.month === month);

  const [roomPayments, setRoomPayments] = useState<RoomPayment[]>(
    apartment.rooms.map(room => {
      const existingRoomPayment = existingPayment?.roomPayments.find(rp => rp.roomId === room.id);
      return existingRoomPayment || {
        roomId: room.id,
        roomName: room.name,
        rentPaid: 0,
        utilitiesPaid: {
          electricity: 0,
          water: 0,
          internet: 0,
        },
      };
    })
  );

  // Update room payments when month changes
  const handleMonthChange = (newMonth: string) => {
    setMonth(newMonth);
    const monthPayment = apartment.payments.find(p => p.month === newMonth);

    setRoomPayments(apartment.rooms.map(room => {
      const existingRoomPayment = monthPayment?.roomPayments.find(rp => rp.roomId === room.id);
      return existingRoomPayment || {
        roomId: room.id,
        roomName: room.name,
        rentPaid: 0,
        utilitiesPaid: {
          electricity: 0,
          water: 0,
          internet: 0,
        },
      };
    }));

    if (monthPayment) {
      setPaymentDate(monthPayment.paymentDate);
      setNotes(monthPayment.notes || '');
    } else {
      setPaymentDate(today);
      setNotes('');
    }
  };

  // Check if selected month is in the past (before current month)
  const isPastMonth = month < currentMonth;

  const handleRoomRentChange = (roomId: string, value: string) => {
    setRoomPayments(prev =>
      prev.map(rp =>
        rp.roomId === roomId ? { ...rp, rentPaid: parseFloat(value) || 0 } : rp
      )
    );
  };

  const handleRoomUtilityChange = (roomId: string, type: 'electricity' | 'water' | 'internet', value: string) => {
    setRoomPayments(prev =>
      prev.map(rp =>
        rp.roomId === roomId
          ? {
              ...rp,
              utilitiesPaid: {
                ...rp.utilitiesPaid,
                [type]: parseFloat(value) || 0,
              },
            }
          : rp
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent editing past months
    if (isPastMonth && existingPayment) {
      alert('لا يمكن تعديل الأشهر السابقة');
      return;
    }

    onSave({
      month,
      paymentDate,
      roomPayments,
      notes: notes.trim() || undefined,
    });
  };

  const totalRent = roomPayments.reduce((sum, rp) => sum + rp.rentPaid, 0);
  const totalElectricity = roomPayments.reduce((sum, rp) => sum + rp.utilitiesPaid.electricity, 0);
  const totalWater = roomPayments.reduce((sum, rp) => sum + rp.utilitiesPaid.water, 0);
  const totalInternet = roomPayments.reduce((sum, rp) => sum + rp.utilitiesPaid.internet, 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white w-full sm:max-w-2xl rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-xl">تسجيل دفعة</h2>
          <button onClick={onCancel} className="p-1">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4" dir="rtl">
          {isPastMonth && existingPayment && (
            <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3 text-sm text-yellow-800">
              ⚠️ هذا الشهر في الماضي ولا يمكن تعديله. يمكنك فقط عرض البيانات.
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm mb-1">الشهر</label>
              <input
                type="month"
                value={month}
                onChange={(e) => handleMonthChange(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
              {existingPayment && (
                <p className="text-xs text-blue-600 mt-1">⚠️ يوجد دفعة مسجلة لهذا الشهر</p>
              )}
            </div>
            <div>
              <label className="block text-sm mb-1">تاريخ الدفع</label>
              <input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                disabled={isPastMonth && !!existingPayment}
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">مدفوعات الغرف</h3>

            {roomPayments.map((rp, index) => {
              const room = apartment.rooms.find(r => r.id === rp.roomId);
              return (
                <div key={rp.roomId} className="border rounded-lg p-4 space-y-3 bg-gray-50">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold">{rp.roomName}</h4>
                    {room?.tenantName && (
                      <span className="text-sm text-gray-600">({room.tenantName})</span>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm mb-1">الإيجار المدفوع (ر.س)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={rp.rentPaid || ''}
                      onChange={(e) => handleRoomRentChange(rp.roomId, e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg bg-white"
                      placeholder="0.00"
                      disabled={isPastMonth && !!existingPayment}
                    />
                    {room && room.rent > 0 && (
                      <p className="text-xs text-gray-600 mt-1">
                        الإيجار المتوقع: {room.rent} ر.س
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs mb-1">كهرباء (ر.س)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={rp.utilitiesPaid.electricity || ''}
                        onChange={(e) => handleRoomUtilityChange(rp.roomId, 'electricity', e.target.value)}
                        className="w-full px-2 py-1 border rounded text-sm bg-white"
                        placeholder="0.00"
                        disabled={isPastMonth && !!existingPayment}
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1">ماء (ر.س)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={rp.utilitiesPaid.water || ''}
                        onChange={(e) => handleRoomUtilityChange(rp.roomId, 'water', e.target.value)}
                        className="w-full px-2 py-1 border rounded text-sm bg-white"
                        placeholder="0.00"
                        disabled={isPastMonth && !!existingPayment}
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1">إنترنت (ر.س)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={rp.utilitiesPaid.internet || ''}
                        onChange={(e) => handleRoomUtilityChange(rp.roomId, 'internet', e.target.value)}
                        className="w-full px-2 py-1 border rounded text-sm bg-white"
                        placeholder="0.00"
                        disabled={isPastMonth && !!existingPayment}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-blue-50 p-4 rounded-lg space-y-2">
            <h3 className="font-semibold">الإجمالي</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600">إجمالي الإيجار:</span>
                <span className="font-semibold mr-2">{totalRent.toFixed(2)} ر.س</span>
              </div>
              <div>
                <span className="text-gray-600">كهرباء:</span>
                <span className="font-semibold mr-2">{totalElectricity.toFixed(2)} ر.س</span>
              </div>
              <div>
                <span className="text-gray-600">ماء:</span>
                <span className="font-semibold mr-2">{totalWater.toFixed(2)} ر.س</span>
              </div>
              <div>
                <span className="text-gray-600">إنترنت:</span>
                <span className="font-semibold mr-2">{totalInternet.toFixed(2)} ر.س</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1">ملاحظات (اختياري)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              rows={2}
              placeholder="ملاحظات إضافية..."
              disabled={isPastMonth && !!existingPayment}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border rounded-lg"
            >
              {isPastMonth && existingPayment ? 'إغلاق' : 'إلغاء'}
            </button>
            {(!isPastMonth || !existingPayment) && (
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                {existingPayment ? 'تحديث الدفعة' : 'حفظ وإنشاء إيصال'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
