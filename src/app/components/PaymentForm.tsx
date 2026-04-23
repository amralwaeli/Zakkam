import { useState } from 'react';
import { X } from 'lucide-react';
import type { Apartment, Payment } from '../types';

interface PaymentFormProps {
  apartment: Apartment;
  onSave: (payment: Omit<Payment, 'id'> & { id?: string }) => void;
  onCancel: () => void;
}

export function PaymentForm({ apartment, onSave, onCancel }: PaymentFormProps) {
  const today = new Date().toISOString().split('T')[0];
  const totalRoomRent = apartment.rooms.reduce((sum, room) => sum + room.rent, 0);

  const [paymentDate, setPaymentDate] = useState(today);
  const [paidBy, setPaidBy] = useState('');
  const [isPaid, setIsPaid] = useState(false);
  const [rentAmount, setRentAmount] = useState(totalRoomRent > 0 ? totalRoomRent.toString() : '0');
  const [electricityAmount, setElectricityAmount] = useState('0');
  const [waterAmount, setWaterAmount] = useState('0');
  const [internetAmount, setInternetAmount] = useState('0');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      paymentDate,
      paidBy: paidBy.trim() || undefined,
      isPaid,
      rentAmount: parseFloat(rentAmount) || 0,
      utilitiesAmount: {
        electricity: parseFloat(electricityAmount) || 0,
        water: parseFloat(waterAmount) || 0,
        internet: parseFloat(internetAmount) || 0,
      },
      notes,
    });
  };

  const totalAmount =
    (parseFloat(rentAmount) || 0) +
    (parseFloat(electricityAmount) || 0) +
    (parseFloat(waterAmount) || 0) +
    (parseFloat(internetAmount) || 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-xl">Record Payment</h2>
          <button onClick={onCancel} className="p-1">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm mb-1">Payment Date</label>
            <input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Paid By</label>
            <input
              type="text"
              value={paidBy}
              onChange={(e) => setPaidBy(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="e.g., John Smith"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPaid"
              checked={isPaid}
              onChange={(e) => setIsPaid(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="isPaid" className="text-sm">Mark as Paid</label>
          </div>

          <div>
            <label className="block text-sm mb-1">Rent Amount ($)</label>
            <input
              type="number"
              step="0.01"
              value={rentAmount}
              onChange={(e) => setRentAmount(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="0.00"
              required
            />
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold">Utilities Paid</h3>

            <div>
              <label className="block text-sm mb-1">Electricity ($)</label>
              <input
                type="number"
                step="0.01"
                value={electricityAmount}
                onChange={(e) => setElectricityAmount(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Water ($)</label>
              <input
                type="number"
                step="0.01"
                value={waterAmount}
                onChange={(e) => setWaterAmount(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Internet ($)</label>
              <input
                type="number"
                step="0.01"
                value={internetAmount}
                onChange={(e) => setInternetAmount(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1">Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              rows={2}
              placeholder="Additional notes..."
            />
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">Total Amount</p>
            <p className="text-2xl font-semibold text-blue-600">${totalAmount.toFixed(2)}</p>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Save & Generate Receipt
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
