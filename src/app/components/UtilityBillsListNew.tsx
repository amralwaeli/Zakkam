import { Zap, Droplets, Wifi, Trash2, CheckCircle, XCircle, Image as ImageIcon, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { calculateUtilityBillStatus } from '../utils/paymentCalculations';
import type { UtilityBill, Apartment } from '../types';

interface UtilityBillsListNewProps {
  bills: UtilityBill[];
  apartment: Apartment;
  onAdd: () => void;
  onDelete: (id: string) => void;
}

const utilityIcons = {
  electricity: Zap,
  water: Droplets,
  internet: Wifi,
};

const utilityColors = {
  electricity: 'text-yellow-600',
  water: 'text-blue-600',
  internet: 'text-purple-600',
};

const utilityNames = {
  electricity: 'كهرباء',
  water: 'ماء',
  internet: 'إنترنت',
};

export function UtilityBillsListNew({ bills, apartment, onAdd, onDelete }: UtilityBillsListNewProps) {
  const [expandedBills, setExpandedBills] = useState<Record<string, boolean>>({});

  const sortedBills = [...bills].sort((a, b) => {
    const dateCompare = b.month.localeCompare(a.month);
    if (dateCompare !== 0) return dateCompare;
    return a.dueDay - b.dueDay;
  });

  const toggleExpand = (billId: string) => {
    setExpandedBills(prev => ({ ...prev, [billId]: !prev[billId] }));
  };

  if (bills.length === 0) {
    return (
      <div className="text-center py-12 px-4 text-gray-500" dir="rtl">
        <Zap className="w-16 h-16 mx-auto mb-4 opacity-20" />
        <p>لا توجد فواتير خدمات بعد</p>
        <p className="text-sm">تتبع فواتير الكهرباء والماء والإنترنت</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3" dir="rtl">
      {sortedBills.map((bill) => {
        const status = calculateUtilityBillStatus(apartment, bill);
        const Icon = utilityIcons[bill.type];
        const colorClass = utilityColors[bill.type];
        const monthName = new Date(bill.month + '-01').toLocaleDateString('ar-SA', {
          year: 'numeric',
          month: 'long',
        });

        const showWarning = !status.isPaid || !bill.screenshot || status.hasDiscrepancy;
        const isExpanded = expandedBills[bill.id];

        // Get payment details for this utility type in this month
        const monthPayments = apartment.payments.filter(p => p.month === bill.month);
        const roomPaymentDetails = monthPayments.flatMap(payment =>
          payment.roomPayments
            .filter(rp => rp.utilitiesPaid[bill.type] > 0)
            .map(rp => ({
              roomName: rp.roomName,
              amount: rp.utilitiesPaid[bill.type],
              paymentDate: payment.paymentDate,
            }))
        );

        return (
          <div
            key={bill.id}
            className={`border rounded-lg shadow-sm ${
              showWarning ? 'bg-red-50 border-red-200' : status.isPaid && bill.screenshot ? 'bg-green-50 border-green-200' : 'bg-white'
            }`}
          >
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <Icon className={`w-5 h-5 ${colorClass}`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{utilityNames[bill.type]}</h3>
                      {status.isPaid && bill.screenshot && !status.hasDiscrepancy && (
                        <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded">✓ مكتملة</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600">{monthName}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (confirm(`حذف فاتورة ${utilityNames[bill.type]}؟`)) {
                      onDelete(bill.id);
                    }
                  }}
                  className="p-1 text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-gray-600">قيمة الفاتورة:</span>
                  <p className="text-xl font-bold text-blue-600">{bill.amount.toFixed(2)} ر.س</p>
                </div>

                <div className="flex justify-between items-baseline">
                  <span className="text-sm text-gray-600">المبلغ المدفوع:</span>
                  <div className="flex items-center gap-2">
                    <p className="text-lg font-semibold text-green-600">{status.amountPaid.toFixed(2)} ر.س</p>
                    {showWarning && <AlertTriangle className="w-4 h-4 text-red-600" />}
                  </div>
                </div>

                {status.amountRemaining > 0.01 && (
                  <div className="flex justify-between items-baseline text-red-600">
                    <span className="text-sm">المتبقي:</span>
                    <p className="text-lg font-semibold">{status.amountRemaining.toFixed(2)} ر.س</p>
                  </div>
                )}

                {status.hasDiscrepancy && (
                  <div className="bg-red-100 border border-red-300 rounded p-2 text-sm text-red-800 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>تحذير: المبلغ المدفوع ({status.amountPaid.toFixed(2)} ر.س) أكبر من قيمة الفاتورة!</span>
                  </div>
                )}

                <p className="text-sm text-gray-600">تاريخ الاستحقاق: يوم {bill.dueDay} من كل شهر</p>

                <div className="flex items-center gap-4 text-sm pt-2 border-t">
                  <div className="flex items-center gap-1">
                    {status.isPaid ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-green-600">مدفوعة</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-red-600" />
                        <span className="text-red-600">غير مدفوعة</span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {bill.screenshot ? (
                      <>
                        <ImageIcon className="w-4 h-4 text-green-600" />
                        <span className="text-green-600">صورة مرفقة</span>
                      </>
                    ) : (
                      <>
                        <ImageIcon className="w-4 h-4 text-red-600" />
                        <span className="text-red-600">لا توجد صورة</span>
                      </>
                    )}
                  </div>
                </div>

                {roomPaymentDetails.length > 0 && (
                  <button
                    onClick={() => toggleExpand(bill.id)}
                    className="w-full mt-2 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center gap-2 text-sm"
                  >
                    <span>تفاصيل الدفعات من الغرف</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                )}

                {bill.screenshot && (
                  <img
                    src={bill.screenshot}
                    alt={`${utilityNames[bill.type]} screenshot`}
                    className="mt-2 w-full rounded border max-h-48 object-contain bg-gray-50"
                  />
                )}
              </div>
            </div>

            {isExpanded && roomPaymentDetails.length > 0 && (
              <div className="border-t bg-gray-50 p-4 space-y-2">
                <h4 className="font-semibold text-sm mb-2">المدفوعات من الغرف:</h4>
                {roomPaymentDetails.map((detail, idx) => (
                  <div key={idx} className="bg-white rounded p-2 text-sm flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{detail.roomName}</p>
                      <p className="text-xs text-gray-600">
                        {new Date(detail.paymentDate).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                    <p className="font-semibold text-green-600">{detail.amount.toFixed(2)} ر.س</p>
                  </div>
                ))}
                <div className="border-t pt-2 flex justify-between items-center font-semibold">
                  <span>الإجمالي:</span>
                  <span className="text-green-600">{status.amountPaid.toFixed(2)} ر.س</span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
