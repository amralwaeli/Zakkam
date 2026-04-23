import { useState } from 'react';
import { X } from 'lucide-react';
import type { Apartment } from '../types';

interface ApartmentFormProps {
  apartment?: Apartment;
  onSave: (apartment: Omit<Apartment, 'id'> & { id?: string }) => void;
  onCancel: () => void;
}

export function ApartmentForm({ apartment, onSave, onCancel }: ApartmentFormProps) {
  const [name, setName] = useState(apartment?.name || '');
  const [totalRent, setTotalRent] = useState(apartment?.totalRent?.toString() || '');
  const [paymentDueDayStart, setPaymentDueDayStart] = useState(apartment?.paymentDueDayStart?.toString() || '1');
  const [paymentDueDayEnd, setPaymentDueDayEnd] = useState(apartment?.paymentDueDayEnd?.toString() || '5');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: apartment?.id,
      name,
      totalRent: parseFloat(totalRent) || 0,
      paymentDueDayStart: parseInt(paymentDueDayStart) || 1,
      paymentDueDayEnd: parseInt(paymentDueDayEnd) || 5,
      rooms: apartment?.rooms || [],
      payments: apartment?.payments || [],
      utilityBills: apartment?.utilityBills || [],
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl">
        <div className="border-b p-4 flex justify-between items-center">
          <h2 className="text-xl">{apartment ? 'تعديل' : 'إضافة'} شقة</h2>
          <button onClick={onCancel} className="p-1">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4" dir="rtl">
          <div>
            <label className="block text-sm mb-1">اسم الشقة</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="مثال: شقة 101"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">إجمالي إيجار الشقة (ر.س)</label>
            <input
              type="number"
              step="0.01"
              value={totalRent}
              onChange={(e) => setTotalRent(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="0.00"
              required
            />
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-sm">فترة استحقاق الدفع</h3>
            <p className="text-xs text-gray-600">
              حدد نطاق الأيام التي يجب فيها تحصيل الإيجار كل شهر
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm mb-1">من يوم</label>
                <input
                  type="number"
                  min="1"
                  max="28"
                  value={paymentDueDayStart}
                  onChange={(e) => setPaymentDueDayStart(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-1">إلى يوم</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={paymentDueDayEnd}
                  onChange={(e) => setPaymentDueDayEnd(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-600">
            بعد إنشاء الشقة، يمكنك إضافة الغرف مع أسعار الإيجار الفردية.
          </p>

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border rounded-lg"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              حفظ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
