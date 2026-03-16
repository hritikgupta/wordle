import React from 'react';
import { getTileColor } from '../utils';

export function OpponentBoard({ guesses, playerName, playerCount }) {
  const maxGuesses = 6;
  const guessesLeft = maxGuesses - guesses.length;

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
