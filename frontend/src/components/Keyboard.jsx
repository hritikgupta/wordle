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
    <div className="flex flex-col gap-2 w-full">
      {KEYBOARD_ROWS.map((row, idx) => (
        <div
          key={idx}
          className="flex gap-1 justify-center flex-wrap"
        >
          {row.map((key) => {
            const width =
              key === 'ENTER' || key === 'BACKSPACE'
                ? 'flex-1 min-w-16 sm:min-w-20'
                : 'flex-1 min-w-8 sm:min-w-10';

            return (
              <button
                key={key}
                onClick={() => handleKeyClick(key)}
                disabled={disabled}
                className={`
                  ${width} h-20 sm:h-24 rounded font-bold text-xl sm:text-3xl
                  transition-all active:scale-95 cursor-pointer
                  ${getKeyColor(key)}
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                {key === 'BACKSPACE' ? '⌫' : key === 'ENTER' ? 'ENTER' : key}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
