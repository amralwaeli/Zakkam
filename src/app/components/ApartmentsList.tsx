import { Building2, Plus, Edit, Trash2, AlertCircle, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getApartmentStatus } from '../utils/apartmentStatus';
import { updateUtilityBillsStatus } from '../utils/paymentCalculations';
import type { Apartment } from '../types';

interface ApartmentsListProps {
  apartments: Apartment[];
  onAdd: () => void;
  onEdit: (apartment: Apartment) => void;
  onDelete: (id: string) => void;
  onSelect: (apartment: Apartment) => void;
  onLogout?: () => void;
}

export function ApartmentsList({ apartments, onAdd, onEdit, onDelete, onSelect, onLogout }: ApartmentsListProps) {
  // Ensure all apartments have updated utility bill statuses
  const [processedApartments, setProcessedApartments] = useState<Apartment[]>([]);

  useEffect(() => {
    const updated = apartments.map(apt => ({
      ...apt,
      utilityBills: updateUtilityBillsStatus(apt),
    }));
    setProcessedApartments(updated);
  }, [apartments]);

  const apartmentsWithIssues = processedApartments.filter(apt => getApartmentStatus(apt).hasIssues);

  return (
    <div className="p-4 pb-20" dir="rtl">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl flex items-center gap-2">
          <Building2 className="w-6 h-6" />
          شركة زعكم لإدارة العقارات
        </h1>
        <div className="flex gap-2">
          {onLogout && (
            <button
              onClick={onLogout}
              className="bg-gray-200 text-gray-700 px-3 py-2 rounded-lg flex items-center gap-2"
              title="تسجيل الخروج"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            إضافة
          </button>
        </div>
      </div>

      {apartmentsWithIssues.length > 0 && (
        <div className="mb-4 bg-red-100 border-r-4 border-red-600 p-3 rounded">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="font-semibold text-red-800">
              {apartmentsWithIssues.length} {apartmentsWithIssues.length > 1 ? 'شقق لديها' : 'شقة لديها'} مدفوعات أو فواتير ناقصة
            </p>
          </div>
        </div>
      )}

      {processedApartments.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Building2 className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p>لا توجد شقق بعد</p>
          <p className="text-sm">اضغط "إضافة" لإنشاء أول شقة</p>
        </div>
      ) : (
        <div className="space-y-3">
          {processedApartments.map((apt) => {
            const status = getApartmentStatus(apt);
            return (
              <div
                key={apt.id}
                onClick={() => onSelect(apt)}
                className={`border rounded-lg p-4 shadow-sm active:opacity-80 cursor-pointer ${
                  status.hasIssues ? 'bg-red-50 border-red-300' : 'bg-white border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{apt.name}</h3>
                    {status.hasIssues ? (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    ) : (
                      <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded">✓</span>
                    )}
                  </div>
                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onEdit(apt)}
                      className="p-1 text-blue-600"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`حذف ${apt.name}؟`)) {
                          onDelete(apt.id);
                        }
                      }}
                      className="p-1 text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {status.hasIssues && (
                  <div className="mb-2 text-sm text-red-700 space-y-1">
                    {status.missingRentPayment && (
                      <p>⚠️ دفعة الإيجار متأخرة</p>
                    )}
                    {status.missingUtilityBills && (
                      <p>⚠️ فواتير خدمات ناقصة: {status.overdueUtilities.map(u =>
                        u === 'electricity' ? 'كهرباء' : u === 'water' ? 'ماء' : 'إنترنت'
                      ).join('، ')}</p>
                    )}
                  </div>
                )}

                <div className="text-sm text-gray-600 space-y-1">
                  <p>الغرف: {apt.rooms.length}</p>
                  <p>إجمالي الإيجار: {apt.totalRent.toFixed(2)} ر.س</p>
                  <p>موعد الاستحقاق: من يوم {apt.paymentDueDayStart} إلى {apt.paymentDueDayEnd}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
