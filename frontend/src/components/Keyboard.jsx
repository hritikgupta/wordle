import React from 'react';
import { KEYBOARD_ROWS, getKeyboardKeyColor } from '../utils';

export function Keyboard({ onKeyPress, guesses, disabled }) {
  const getKeyColor = (key) => {
    if (key === 'ENTER' || key === 'BACKSPACE') {
      return 'bg-gray-600 text-white active:bg-gray-700';
    }
    return getKeyboardKeyColor(key, guesses);
  };

  return (
    <div className="flex flex-col gap-1.5 w-full select-none" aria-label="Keyboard">
      {KEYBOARD_ROWS.map((row, idx) => (
        <div key={idx} className="flex gap-1 justify-center">
          {row.map((key) => {
            const isWide = key === 'ENTER' || key === 'BACKSPACE';
            return (
              <button
                key={key}
                onClick={() => !disabled && onKeyPress(key)}
                disabled={disabled}
                aria-label={key === 'BACKSPACE' ? 'Delete' : key}
                className={[
                  // Wide keys get more room; letter keys scale to fill the row
                  isWide ? 'flex-[1.5] min-w-[48px]' : 'flex-1 min-w-[30px]',
                  // Height: 52px meets the 44px WCAG touch-target minimum with room to spare
                  'h-[52px] sm:h-[56px]',
                  'rounded-md font-bold text-sm sm:text-base',
                  'flex items-center justify-center',
                  // No 300 ms delay; no blue flash on Android; no grey iOS highlight
                  'touch-action-manipulation',
                  'transition-transform active:scale-95',
                  'disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer',
                  getKeyColor(key),
                ]
                  .filter(Boolean)
                  .join(' ')}
                // Inline style so we don't need a Tailwind plugin for touch-action
                style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
              >
                {key === 'BACKSPACE' ? '⌫' : key}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}
