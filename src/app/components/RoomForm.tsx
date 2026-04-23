import { useState } from 'react';
import { X } from 'lucide-react';
import type { Room } from '../types';

interface RoomFormProps {
  room?: Room;
  onSave: (room: Omit<Room, 'id'> & { id?: string }) => void;
  onCancel: () => void;
}

export function RoomForm({ room, onSave, onCancel }: RoomFormProps) {
  const [name, setName] = useState(room?.name || '');
  const [rent, setRent] = useState(room?.rent?.toString() || '');
  const [tenantName, setTenantName] = useState(room?.tenantName || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: room?.id,
      name,
      rent: parseFloat(rent) || 0,
      tenantName: tenantName.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl">
        <div className="border-b p-4 flex justify-between items-center">
          <h2 className="text-xl">{room ? 'تعديل' : 'إضافة'} غرفة</h2>
          <button onClick={onCancel} className="p-1">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4" dir="rtl">
          <div>
            <label className="block text-sm mb-1">اسم الغرفة</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="مثال: غرفة 1"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">الإيجار الشهري (ر.س)</label>
            <input
              type="number"
              step="0.01"
              value={rent}
              onChange={(e) => setRent(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">اسم المستأجر (اختياري)</label>
            <input
              type="text"
              value={tenantName}
              onChange={(e) => setTenantName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="مثال: أحمد محمد"
            />
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
