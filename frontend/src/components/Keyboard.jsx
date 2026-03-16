import React from 'react';
import { KEYBOARD_ROWS, getKeyboardKeyColor } from '../utils';

export function Keyboard({ onKeyPress, guesses, disabled }) {
  const handleKeyClick = (key) => {
    onKeyPress(key);
  };

  const getKeyColor = (key) => {
    if (key === 'ENTER' || key === 'BACKSPACE') {
      return 'bg-gray-600 text-white hover:bg-gray-700';
    }
    return getKeyboardKeyColor(key, guesses);
  };

  return (
    <div className="mt-6 flex flex-col gap-2 max-w-md mx-auto">
      {KEYBOARD_ROWS.map((row, idx) => (
        <div
          key={idx}
          className="flex gap-1 justify-center flex-wrap"
        >
          {row.map((key) => {
            const width =
              key === 'ENTER' || key === 'BACKSPACE'
                ? 'w-16 sm:w-20'
                : 'w-8 sm:w-10';

            return (
              <button
                key={key}
                onClick={() => handleKeyClick(key)}
                disabled={disabled}
                className={`
                  ${width} h-10 rounded font-semibold text-xs sm:text-sm
                  transition-all active:scale-95 cursor-pointer
                  ${getKeyColor(key)}
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                {key === 'BACKSPACE' ? '← BACK' : key === 'ENTER' ? 'ENTER' : key}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
