import { Receipt, Trash2, Download, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { calculateRentStatus } from '../utils/paymentCalculations';
import type { Payment, Apartment } from '../types';

interface PaymentsListNewProps {
  payments: Payment[];
  apartment: Apartment;
  onAdd: () => void;
  onDelete: (id: string) => void;
}

export function PaymentsListNew({ payments, apartment, onAdd, onDelete }: PaymentsListNewProps) {
  const [expandedPayments, setExpandedPayments] = useState<Record<string, boolean>>({});

  const sortedPayments = [...payments].sort((a, b) =>
    b.month.localeCompare(a.month) || new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
  );

  const toggleExpand = (paymentId: string) => {
    setExpandedPayments(prev => ({ ...prev, [paymentId]: !prev[paymentId] }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatMonth = (monthString: string) => {
    return new Date(monthString + '-01').toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
    });
  };

  if (payments.length === 0) {
    return (
      <div className="text-center py-12 px-4 text-gray-500" dir="rtl">
        <Receipt className="w-16 h-16 mx-auto mb-4 opacity-20" />
        <p>لا توجد مدفوعات مسجلة</p>
        <p className="text-sm">ابدأ بتتبع مدفوعات الإيجار والخدمات</p>
      </div>
    );
  }

  const groupedByMonth = sortedPayments.reduce((acc, payment) => {
    if (!acc[payment.month]) {
      acc[payment.month] = [];
    }
    acc[payment.month].push(payment);
    return acc;
  }, {} as Record<string, Payment[]>);

  return (
    <div className="p-4 space-y-4" dir="rtl">
      {Object.entries(groupedByMonth).map(([month, monthPayments]) => {
        const rentStatus = calculateRentStatus(apartment, month);

        const totalRent = monthPayments.reduce((sum, p) =>
          sum + p.roomPayments.reduce((rSum, rp) => rSum + rp.rentPaid, 0), 0
        );

        const totalUtilities = monthPayments.reduce((sum, p) =>
          sum + p.roomPayments.reduce((rSum, rp) =>
            rSum + rp.utilitiesPaid.electricity + rp.utilitiesPaid.water + rp.utilitiesPaid.internet, 0
          ), 0
        );

        return (
          <div key={month} className="border rounded-lg overflow-hidden">
            <div className={`p-3 ${rentStatus.isPaid ? 'bg-green-50' : 'bg-yellow-50'}`}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{formatMonth(month)}</h3>
                  {rentStatus.isPaid && !rentStatus.hasDiscrepancy && (
                    <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded">✓ مكتمل</span>
                  )}
                </div>
                {!rentStatus.isPaid && (
                  <div className="flex items-center gap-2 text-sm text-yellow-800">
                    <AlertTriangle className="w-4 h-4" />
                    <span>متبقي: {rentStatus.amountRemaining.toFixed(2)} ر.س</span>
                  </div>
                )}
              </div>

              <div className="text-sm mt-2 space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">إجمالي الإيجار المدفوع:</span>
                  <span className="font-semibold">{totalRent.toFixed(2)} ر.س</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">إجمالي الخدمات المدفوعة:</span>
                  <span className="font-semibold">{totalUtilities.toFixed(2)} ر.س</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">الإيجار المتوقع:</span>
                  <span className="font-semibold">{rentStatus.expectedTotal.toFixed(2)} ر.س</span>
                </div>
                {rentStatus.hasDiscrepancy && rentStatus.roomsTotal !== rentStatus.expectedTotal && (
                  <div className="text-xs text-red-600 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    <span>تحذير: مجموع إيجار الغرف ({rentStatus.roomsTotal} ر.س) لا يساوي الإيجار المتوقع!</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white p-4">
              {monthPayments.map((payment) => {
                const isExpanded = expandedPayments[payment.id || ''];
                const paymentTotalRent = payment.roomPayments.reduce((sum, rp) => sum + rp.rentPaid, 0);
                const paymentTotalUtilities = payment.roomPayments.reduce((sum, rp) =>
                  sum + rp.utilitiesPaid.electricity + rp.utilitiesPaid.water + rp.utilitiesPaid.internet, 0
                );

                return (
                  <div key={payment.id}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Receipt className="w-5 h-5 text-gray-600" />
                          <span className="font-semibold text-sm">{formatDate(payment.paymentDate)}</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <p>إيجار: {paymentTotalRent.toFixed(2)} ر.س</p>
                          <p>خدمات: {paymentTotalUtilities.toFixed(2)} ر.س</p>
                          <p className="font-semibold text-green-600">الإجمالي: {(paymentTotalRent + paymentTotalUtilities).toFixed(2)} ر.س</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            alert('سيتم توليد الإيصال قريباً');
                          }}
                          className="p-2 text-blue-600 bg-blue-50 rounded-lg"
                          title="تحميل الإيصال"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleExpand(payment.id || '')}
                      className="w-full py-2 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center gap-2 text-sm"
                    >
                      <span>تفاصيل الغرف ({payment.roomPayments.length})</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {payment.notes && (
                      <div className="mt-3 pt-3 border-t text-sm text-gray-600">
                        <p className="italic">"{payment.notes}"</p>
                      </div>
                    )}

                    {isExpanded && (
                      <div className="border-t bg-gray-50 p-4 space-y-2 mt-3">
                        {payment.roomPayments.map((rp) => {
                          const roomTotal = rp.rentPaid + rp.utilitiesPaid.electricity + rp.utilitiesPaid.water + rp.utilitiesPaid.internet;
                          return (
                            <div key={rp.roomId} className="bg-white rounded p-3 space-y-2">
                              <div className="flex justify-between items-center">
                                <h4 className="font-semibold">{rp.roomName}</h4>
                                <p className="font-bold text-green-600">{roomTotal.toFixed(2)} ر.س</p>
                              </div>
                              <div className="text-sm space-y-1">
                                <div className="flex justify-between">
                                  <span className="text-gray-600">الإيجار:</span>
                                  <span>{rp.rentPaid.toFixed(2)} ر.س</span>
                                </div>
                                {rp.utilitiesPaid.electricity > 0 && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">كهرباء:</span>
                                    <span>{rp.utilitiesPaid.electricity.toFixed(2)} ر.س</span>
                                  </div>
                                )}
                                {rp.utilitiesPaid.water > 0 && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">ماء:</span>
                                    <span>{rp.utilitiesPaid.water.toFixed(2)} ر.س</span>
                                  </div>
                                )}
                                {rp.utilitiesPaid.internet > 0 && (
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">إنترنت:</span>
                                    <span>{rp.utilitiesPaid.internet.toFixed(2)} ر.س</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
