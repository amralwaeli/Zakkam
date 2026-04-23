import { Home, Edit, Trash2, User } from 'lucide-react';
import type { Room } from '../types';

interface RoomsListProps {
  rooms: Room[];
  onAdd: () => void;
  onEdit: (room: Room) => void;
  onDelete: (id: string) => void;
}

export function RoomsList({ rooms, onAdd, onEdit, onDelete }: RoomsListProps) {
  if (rooms.length === 0) {
    return (
      <div className="text-center py-12 px-4 text-gray-500" dir="rtl">
        <Home className="w-16 h-16 mx-auto mb-4 opacity-20" />
        <p>لا توجد غرف بعد</p>
        <p className="text-sm">أضف غرفاً لبدء تتبع المستأجرين</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-3" dir="rtl">
      {rooms.map((room) => (
        <div key={room.id} className="bg-white border rounded-lg p-4 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              <Home className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold">{room.name}</h3>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(room)}
                className="p-1 text-blue-600"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  if (confirm(`حذف ${room.name}؟`)) {
                    onDelete(room.id);
                  }
                }}
                className="p-1 text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="text-sm space-y-1">
            <p className="font-semibold text-blue-600">{room.rent} ر.س/شهرياً</p>
            {room.tenantName ? (
              <div className="flex items-center gap-2 text-gray-700">
                <User className="w-4 h-4" />
                <span>{room.tenantName}</span>
              </div>
            ) : (
              <p className="text-gray-500 italic">لا يوجد مستأجر</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
