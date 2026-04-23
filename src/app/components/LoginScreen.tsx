import { useState } from 'react';
import { Lock, Delete } from 'lucide-react';

interface LoginScreenProps {
  onLogin: () => void;
}

const CORRECT_PIN = '711719';

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleNumberClick = (num: string) => {
    if (pin.length < 6) {
      const newPin = pin + num;
      setPin(newPin);
      setError(false);

      if (newPin.length === 6) {
        if (newPin === CORRECT_PIN) {
          setTimeout(() => {
            onLogin();
          }, 200);
        } else {
          setError(true);
          setShake(true);
          setTimeout(() => {
            setPin('');
            setShake(false);
          }, 500);
        }
      }
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
    setError(false);
  };

  const handleClear = () => {
    setPin('');
    setError(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Lock className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">نظام إدارة الشقق</h1>
          <p className="text-gray-600">أدخل رمز PIN للدخول</p>
        </div>

        <div className={`mb-8 ${shake ? 'animate-shake' : ''}`}>
          <div className="flex justify-center gap-3">
            {[0, 1, 2, 3, 4, 5].map((index) => (
              <div
                key={index}
                className={`w-12 h-14 border-2 rounded-lg flex items-center justify-center text-2xl font-bold transition-all ${
                  error
                    ? 'border-red-500 bg-red-50 text-red-600'
                    : pin.length > index
                    ? 'border-blue-600 bg-blue-50 text-blue-600'
                    : 'border-gray-300 bg-gray-50'
                }`}
              >
                {pin.length > index ? '●' : ''}
              </div>
            ))}
          </div>
          {error && (
            <p className="text-red-600 text-center mt-3 text-sm">رمز PIN غير صحيح</p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              onClick={() => handleNumberClick(num)}
              className="h-16 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-xl text-2xl font-semibold text-gray-800 transition-colors"
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleClear}
            className="h-16 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-xl text-sm font-semibold text-gray-600 transition-colors"
          >
            مسح
          </button>
          <button
            onClick={() => handleNumberClick('0')}
            className="h-16 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-xl text-2xl font-semibold text-gray-800 transition-colors"
          >
            0
          </button>
          <button
            onClick={handleBackspace}
            className="h-16 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 rounded-xl flex items-center justify-center transition-colors"
          >
            <Delete className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <p className="text-center text-xs text-gray-500 mt-6">
          نظام آمن لإدارة العقارات
        </p>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
          20%, 40%, 60%, 80% { transform: translateX(10px); }
        }
        .animate-shake {
          animation: shake 0.5s;
        }
      `}</style>
    </div>
  );
}
