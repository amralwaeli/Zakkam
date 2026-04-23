import { useState } from 'react';
import { X, Upload } from 'lucide-react';
import type { UtilityBill } from '../types';

interface UtilityBillFormProps {
  bill?: UtilityBill;
  onSave: (bill: Omit<UtilityBill, 'id' | 'isPaid' | 'hasDiscrepancy' | 'amountPaid' | 'amountRemaining'> & { id?: string }) => void;
  onCancel: () => void;
}

const utilityDueDays = {
  water: 2,
  internet: 13,
  electricity: 17,
};

export function UtilityBillForm({ bill, onSave, onCancel }: UtilityBillFormProps) {
  const currentMonth = new Date().toISOString().substring(0, 7);

  const [type, setType] = useState<'electricity' | 'water' | 'internet'>(bill?.type || 'electricity');
  const [month, setMonth] = useState(bill?.month || currentMonth);
  const [amount, setAmount] = useState(bill?.amount?.toString() || '');
  const [screenshot, setScreenshot] = useState(bill?.screenshot || '');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshot(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: bill?.id,
      type,
      month,
      amount: parseFloat(amount) || 0,
      dueDay: utilityDueDays[type],
      screenshot: screenshot || undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-xl">{bill ? 'تعديل' : 'إضافة'} فاتورة خدمات</h2>
          <button onClick={onCancel} className="p-1">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4" dir="rtl">
          <div>
            <label className="block text-sm mb-1">نوع الخدمة</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full px-3 py-2 border rounded-lg"
              required
            >
              <option value="electricity">كهرباء (الاستحقاق: 17)</option>
              <option value="water">ماء (الاستحقاق: 2)</option>
              <option value="internet">إنترنت (الاستحقاق: 13)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">الشهر</label>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">المبلغ (ر.س)</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">رفع صورة الفاتورة</label>
            <div className="border-2 border-dashed rounded-lg p-4">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="screenshot-upload"
              />
              <label
                htmlFor="screenshot-upload"
                className="flex flex-col items-center cursor-pointer"
              >
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">
                  {screenshot ? 'تغيير الصورة' : 'اضغط للرفع'}
                </span>
              </label>
              {screenshot && (
                <img
                  src={screenshot}
                  alt="معاينة"
                  className="mt-3 w-full rounded border max-h-48 object-contain"
                />
              )}
            </div>
          </div>

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
