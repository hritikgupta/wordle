import React from 'react';
import { getTileColor } from '../utils';

export function GameBoard({ guesses, currentGuess, playerName, large = false, shake = false }) {
  const displayGuesses = guesses || [];
  const rows = [];

  displayGuesses.forEach((guessData) => {
    rows.push({
      letters: guessData.guess.split(''),
      feedback: guessData.feedback,
      isComplete: true,
      isActive: false,
    });
  });

  // Active row — the guess being typed right now
  const isActiveRow = !!currentGuess || rows.length < 6;
  if (currentGuess !== undefined && rows.length < 6) {
    const currentLetters = currentGuess.split('').slice(0, 5);
    while (currentLetters.length < 5) currentLetters.push('');
    rows.push({
      letters: currentLetters,
      feedback: Array(5).fill(null),
      isComplete: false,
      isActive: true,
    });
  }

  while (rows.length < 6) {
    rows.push({
      letters: Array(5).fill(''),
      feedback: Array(5).fill(null),
      isComplete: false,
      isActive: false,
    });
  }

  const tileSize = large ? 'w-12 h-12 sm:w-14 sm:h-14' : 'w-10 h-10';
  const textSize = large ? 'text-xl sm:text-2xl' : 'text-base';

  return (
    <div className="flex flex-col gap-1.5">
      <h3 className="text-base font-semibold text-center text-gray-700 truncate max-w-[240px] mx-auto">
        {playerName}
      </h3>
      <div className="flex flex-col gap-1 bg-white p-3 rounded-xl shadow-sm border border-gray-100">
        {rows.map((row, rowIdx) => (
          <div
            key={rowIdx}
            /* board-row sets perspective (defined in index.css) for 3-D tile flip */
            className={`board-row flex gap-1 justify-center ${row.isActive && shake ? 'shake' : ''}`}
          >
            {row.letters.map((letter, colIdx) => {
              const hasColor = !!row.feedback[colIdx];
              return (
                <div
                  key={`${rowIdx}-${colIdx}`}
                  className={[
                    tileSize,
                    textSize,
                    'flex items-center justify-center font-bold rounded-md select-none',
                    'transition-colors duration-150',
                    row.isComplete ? 'tile-flip' : '',
                    hasColor ? getTileColor(row.feedback[colIdx]) : 'bg-white border-2',
                    hasColor ? 'text-white' : 'text-gray-800',
                    !hasColor && letter
                      ? 'border-gray-500' // filled but not submitted
                      : !hasColor
                      ? 'border-gray-300' // empty
                      : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {letter}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
