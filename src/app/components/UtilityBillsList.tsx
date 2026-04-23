import { Zap, Droplets, Wifi, Trash2, CheckCircle, XCircle, Image as ImageIcon } from 'lucide-react';
import type { UtilityBill } from '../types';

interface UtilityBillsListProps {
  bills: UtilityBill[];
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

export function UtilityBillsList({ bills, onAdd, onDelete }: UtilityBillsListProps) {
  const sortedBills = [...bills].sort((a, b) => {
    const dateCompare = b.month.localeCompare(a.month);
    if (dateCompare !== 0) return dateCompare;
    return a.dueDay - b.dueDay;
  });

  if (bills.length === 0) {
    return (
      <div className="text-center py-12 px-4 text-gray-500">
        <Zap className="w-16 h-16 mx-auto mb-4 opacity-20" />
        <p>No utility bills yet</p>
        <p className="text-sm">Track electricity, water, and internet bills</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3">
      {sortedBills.map((bill) => {
        const Icon = utilityIcons[bill.type];
        const colorClass = utilityColors[bill.type];
        const monthName = new Date(bill.month + '-01').toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
        });

        return (
          <div
            key={bill.id}
            className={`border rounded-lg p-4 shadow-sm ${
              !bill.isPaid || !bill.screenshot ? 'bg-red-50 border-red-200' : 'bg-white'
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <Icon className={`w-5 h-5 ${colorClass}`} />
                <div>
                  <h3 className="font-semibold capitalize">{bill.type}</h3>
                  <p className="text-xs text-gray-600">{monthName}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (confirm(`Delete this ${bill.type} bill?`)) {
                    onDelete(bill.id);
                  }
                }}
                className="p-1 text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-xl font-bold text-green-600">${bill.amount.toFixed(2)}</p>
              <p className="text-sm text-gray-600">Due: Day {bill.dueDay} of month</p>

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  {bill.isPaid ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span className={bill.isPaid ? 'text-green-600' : 'text-red-600'}>
                    {bill.isPaid ? 'Paid' : 'Not Paid'}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {bill.screenshot ? (
                    <>
                      <ImageIcon className="w-4 h-4 text-green-600" />
                      <span className="text-green-600">Screenshot attached</span>
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-4 h-4 text-red-600" />
                      <span className="text-red-600">No screenshot</span>
                    </>
                  )}
                </div>
              </div>

              {bill.screenshot && (
                <img
                  src={bill.screenshot}
                  alt={`${bill.type} bill screenshot`}
                  className="mt-2 w-full rounded border max-h-48 object-contain bg-gray-50"
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
