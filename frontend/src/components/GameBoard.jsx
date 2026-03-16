import React from 'react';
import { getTileColor } from '../utils';

export function GameBoard({ guesses, currentGuess, playerName }) {
  const displayGuesses = guesses || [];
  const rows = [];

  // Add completed guesses
  displayGuesses.forEach((guessData) => {
    rows.push({
      letters: guessData.guess.split(''),
      feedback: guessData.feedback,
      isComplete: true,
    });
  });

  // Add current guess row (if in progress)
  if (currentGuess) {
    const currentLetters = currentGuess.split('').slice(0, 5);
    while (currentLetters.length < 5) {
      currentLetters.push('');
    }
    rows.push({
      letters: currentLetters,
      feedback: Array(5).fill(null),
      isComplete: false,
    });
  }

  // Add empty rows to fill 6 rows
  while (rows.length < 6) {
    rows.push({
      letters: Array(5).fill(''),
      feedback: Array(5).fill(null),
      isComplete: false,
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-lg font-semibold text-center text-gray-800">
        {playerName}
      </h3>
      <div className="flex flex-col gap-1 bg-white p-4 rounded-lg shadow">
        {rows.map((row, rowIdx) => (
          <div key={rowIdx} className="flex gap-1 justify-center">
            {row.letters.map((letter, colIdx) => (
              <div
                key={`${rowIdx}-${colIdx}`}
                className={`
                  w-12 h-12 flex items-center justify-center font-bold text-lg
                  rounded transition-all duration-300
                  ${
                    row.feedback[colIdx]
                      ? getTileColor(row.feedback[colIdx])
                      : 'bg-white border-2 border-gray-300'
                  }
                  ${row.isComplete && row.feedback[colIdx] ? 'scale-100' : ''}
                  text-white
                `}
              >
                {letter}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
