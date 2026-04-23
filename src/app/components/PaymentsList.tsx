import { Receipt, Trash2, Download } from 'lucide-react';
import { generatePDFReceipt } from '../utils/pdfGenerator';
import type { Payment } from '../types';

interface PaymentsListProps {
  payments: Payment[];
  apartmentName: string;
  onAdd: () => void;
  onDelete: (id: string) => void;
}

export function PaymentsList({ payments, apartmentName, onAdd, onDelete }: PaymentsListProps) {
  const sortedPayments = [...payments].sort((a, b) =>
    new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleDownloadReceipt = (payment: Payment) => {
    generatePDFReceipt(apartmentName, payment);
  };

  if (payments.length === 0) {
    return (
      <div className="text-center py-12 px-4 text-gray-500">
        <Receipt className="w-16 h-16 mx-auto mb-4 opacity-20" />
        <p>No payments recorded</p>
        <p className="text-sm">Start tracking rent and utility payments</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      {sortedPayments.map((payment) => {
        const totalUtilities =
          payment.utilitiesAmount.electricity +
          payment.utilitiesAmount.water +
          payment.utilitiesAmount.internet;
        const totalAmount = payment.rentAmount + totalUtilities;

        return (
          <div key={payment.id} className={`border rounded-lg p-4 shadow-sm ${payment.isPaid ? 'bg-white' : 'bg-yellow-50 border-yellow-200'}`}>
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Receipt className="w-5 h-5 text-gray-600" />
                  <span className="font-semibold">{formatDate(payment.paymentDate)}</span>
                  {!payment.isPaid && (
                    <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">Unpaid</span>
                  )}
                </div>
                <p className="text-2xl font-bold text-green-600">${totalAmount.toFixed(2)}</p>
                {payment.paidBy && (
                  <p className="text-sm text-gray-600 mt-1">Paid by: {payment.paidBy}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDownloadReceipt(payment)}
                  className="p-2 text-blue-600 bg-blue-50 rounded-lg"
                  title="Download Receipt"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm('Delete this payment record?')) {
                      onDelete(payment.id!);
                    }
                  }}
                  className="p-2 text-red-600 bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-1 text-sm border-t pt-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Rent</span>
                <span className="font-semibold">${payment.rentAmount.toFixed(2)}</span>
              </div>
              {totalUtilities > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Utilities</span>
                  <span className="font-semibold">${totalUtilities.toFixed(2)}</span>
                </div>
              )}
              {payment.utilitiesAmount.electricity > 0 && (
                <div className="flex justify-between text-xs pl-4">
                  <span className="text-gray-500">• Electricity</span>
                  <span>${payment.utilitiesAmount.electricity.toFixed(2)}</span>
                </div>
              )}
              {payment.utilitiesAmount.water > 0 && (
                <div className="flex justify-between text-xs pl-4">
                  <span className="text-gray-500">• Water</span>
                  <span>${payment.utilitiesAmount.water.toFixed(2)}</span>
                </div>
              )}
              {payment.utilitiesAmount.internet > 0 && (
                <div className="flex justify-between text-xs pl-4">
                  <span className="text-gray-500">• Internet</span>
                  <span>${payment.utilitiesAmount.internet.toFixed(2)}</span>
                </div>
              )}
            </div>

            {payment.notes && (
              <div className="mt-3 pt-3 border-t text-sm text-gray-600">
                <p className="italic">"{payment.notes}"</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
