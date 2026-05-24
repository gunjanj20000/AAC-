import React, { useState } from 'react';
import { Lock, Unlock, X } from 'lucide-react';

interface ChildLockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ChildLockModal({ isOpen, onClose, onSuccess }: ChildLockModalProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [mathSum] = useState(() => {
    const num1 = Math.floor(Math.random() * 5) + 3; // 3 to 7
    const num2 = Math.floor(Math.random() * 4) + 2; // 2 to 5
    return { num1, num2, answer: num1 + num2 };
  });
  const [answer, setAnswer] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check standard PIN (1234) OR mathematical gate answer
    const numAnswer = parseInt(answer.trim(), 10);
    const isPinCorrect = pin === '1234';
    const isMathCorrect = numAnswer === mathSum.answer;

    if (isPinCorrect || isMathCorrect) {
      setPin('');
      setAnswer('');
      setError('');
      onSuccess();
    } else {
      setError('Incorrect! PIN or answer is wrong. Hint: Default PIN is 1234.');
    }
  };

  const handleKeyPress = (num: string) => {
    setError('');
    if (pin.length < 4) {
      setPin(prev => prev + num);
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
  };

  return (
    <div id="child-lock-overlay" className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none">
      <div 
        id="child-lock-card" 
        className="bg-white rounded-3xl w-full max-w-md p-6 border-2 border-amber-200 shadow-2xl relative overflow-hidden"
      >
        {/* Playful background design element */}
        <div className="absolute -right-12 -top-12 w-32 h-32 bg-amber-50 rounded-full opacity-60 pointer-events-none" />

        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2.5 bg-amber-100 text-[#FF8B3D] rounded-xl">
              <Lock className="w-5 h-5 animate-pulse" />
            </div>
            <h3 className="text-lg font-extrabold font-sans text-slate-800">Parent / Teacher Lock</h3>
          </div>
          <button 
            id="close-lock-btn" 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs font-sans text-slate-500 mb-5 leading-relaxed">
          Autistic children can tap anywhere! Solve this simple puzzle or enter the password to enter settings.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Option A: Math Gate */}
          <div className="bg-[#FDFCF5] p-3.5 rounded-2xl border border-amber-200/80">
            <label className="block text-xs font-bold text-slate-600 mb-1.5">
              Gate Challenge: Solve to Enter
            </label>
            <div className="flex items-center gap-3">
              <span className="text-xl font-black text-slate-800 tracking-wider">
                {mathSum.num1} + {mathSum.num2} =
              </span>
              <input
                id="math-answer-input"
                type="number"
                placeholder="?"
                value={answer}
                onChange={(e) => {
                  setError('');
                  setAnswer(e.target.value);
                }}
                className="w-18 px-2 py-1.5 text-center text-lg font-black bg-white border border-amber-200 rounded-xl focus:border-[#FF8B3D] focus:outline-none"
              />
            </div>
          </div>

          <div className="text-center text-slate-400 text-xs my-1 font-bold">― OR ENTER PASSWORD ―</div>

          {/* Option B: PIN Lock Keyboard */}
          <div className="flex flex-col items-center">
            {/* Dots */}
            <div className="flex gap-4 mb-4 justify-center">
              {[0, 1, 2, 3].map((idx) => (
                <div
                  key={idx}
                  className={`w-4 h-4 rounded-full transition-all duration-150 ${
                    pin.length > idx ? 'bg-[#FF8B3D] scale-110' : 'bg-slate-200 border border-slate-300'
                  }`}
                />
              ))}
            </div>

            {/* Custom friendly numeric pad */}
            <div className="grid grid-cols-3 gap-2 w-full max-w-[240px]">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleKeyPress(num)}
                  className="h-12 text-lg font-bold bg-slate-50 text-slate-800 rounded-xl hover:bg-amber-100 active:scale-95 transition-all border border-slate-200"
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={handleBackspace}
                className="h-12 font-bold bg-red-50 text-red-650 rounded-xl hover:bg-red-100 active:scale-95 transition-all flex items-center justify-center border border-red-100"
              >
                ⌫
              </button>
              <button
                type="button"
                onClick={() => handleKeyPress('0')}
                className="h-12 text-lg font-bold bg-slate-50 text-slate-800 rounded-xl hover:bg-amber-100 active:scale-95 transition-all border border-slate-200"
              >
                0
              </button>
              <button
                type="button"
                onClick={() => {
                  setPin('');
                  setError('');
                }}
                className="h-12 text-xs font-semibold bg-slate-100 text-slate-505 rounded-xl hover:bg-slate-200 active:scale-95 transition-all"
              >
                Clear
              </button>
            </div>
          </div>

          {error && (
            <p id="lock-error" className="text-xs font-bold text-red-500 text-center animate-bounce">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <button
              id="cancel-lock-btn"
              type="button"
              onClick={onClose}
              className="flex-1 py-3 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-2xl font-bold font-sans transition-all text-center border-b-2 border-slate-200"
            >
              Cancel
            </button>
            <button
              id="unlock-btn"
              type="submit"
              className="flex-1 py-3 text-white bg-[#FF8B3D] hover:bg-[#FF8B3D]/95 border-b-4 border-[#D16D29] rounded-2xl font-bold font-sans transition-all flex items-center justify-center gap-2"
            >
              <Unlock className="w-5 h-5" />
              <span>Unlock Settings</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
