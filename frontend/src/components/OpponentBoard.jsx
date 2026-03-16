import React from 'react';
import { getTileColor } from '../utils';

export function OpponentBoard({ guesses, playerName, playerCount, compact = false }) {
  const maxGuesses = 6;
  const guessesLeft = maxGuesses - guesses.length;

  if (compact) {
    // Compact badge mode for fixed position
    return (
      <div className="bg-white rounded-lg shadow-lg p-2 border border-gray-200">
        <p className="text-xs font-semibold text-gray-600 text-center mb-2">OPP</p>
        <div className="space-y-0.5">
          {guesses.map((guessData, idx) => (
            <div key={idx} className="flex gap-0.5 justify-center">
              {guessData.feedback.map((color, colIdx) => (
                <div
                  key={`${idx}-${colIdx}`}
                  className={`
                    w-6 h-6 rounded transition-all
                    ${getTileColor(color)}
                  `}
                />
              ))}
            </div>
          ))}
          {/* Show empty rows for remaining guesses */}
          {Array.from({ length: Math.min(guessesLeft, 2) }).map((_, idx) => (
            <div key={`empty-${idx}`} className="flex gap-0.5 justify-center">
              {Array.from({ length: 5 }).map((_, colIdx) => (
                <div
                  key={`empty-${idx}-${colIdx}`}
                  className="w-6 h-6 rounded bg-gray-200 border border-gray-300"
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Regular full board mode
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-lg font-semibold text-center text-gray-800">
        {playerName}
      </h3>
      <div className="bg-white p-4 rounded-lg shadow">
        {/* Show guesses as compact colored rows */}
        <div className="space-y-1">
          {guesses.map((guessData, idx) => (
            <div key={idx} className="flex gap-0.5 justify-center">
              {guessData.feedback.map((color, colIdx) => (
                <div
                  key={`${idx}-${colIdx}`}
                  className={`
                    w-6 h-6 rounded transition-all
                    ${getTileColor(color)}
                  `}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Show remaining guesses as empty rows */}
        {guessesLeft > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center font-medium">
              {guessesLeft} guess{guessesLeft !== 1 ? 'es' : ''} left
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
