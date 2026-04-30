import React from 'react';
import { getTileColor } from '../utils';

// compact + inline: horizontal row of mini guess-blocks used in the footer strip
// compact (no inline): small floating card (legacy, still works)
// default: full-size board
export function OpponentBoard({ guesses, playerName, playerCount, compact = false, inline = false }) {
  const maxGuesses = 6;
  const guessesLeft = maxGuesses - guesses.length;

  if (compact && inline) {
    // ── Footer strip: all guesses side-by-side as tiny columns ──
    // Each guess = 5 vertically-stacked 8×8 dots, shown left→right
    return (
      <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-none">
        {guesses.length === 0 ? (
          <span className="text-xs text-gray-400 italic">No guesses yet…</span>
        ) : (
          guesses.map((guessData, gIdx) => (
            <div key={gIdx} className="flex flex-col gap-0.5 shrink-0">
              {guessData.feedback.map((color, cIdx) => (
                <div
                  key={cIdx}
                  className={`w-2 h-2 rounded-sm ${getTileColor(color)}`}
                />
              ))}
            </div>
          ))
        )}
        {/* Empty remaining slots as grey columns */}
        {Array.from({ length: guessesLeft }).map((_, i) => (
          <div key={`e-${i}`} className="flex flex-col gap-0.5 shrink-0">
            {Array.from({ length: 5 }).map((_, j) => (
              <div key={j} className="w-2 h-2 rounded-sm bg-gray-200" />
            ))}
          </div>
        ))}
        <span className="text-xs text-gray-400 ml-1 shrink-0">{playerName}</span>
      </div>
    );
  }

  if (compact) {
    // ── Legacy floating compact card ──
    return (
      <div className="bg-white rounded-lg shadow-lg p-2 border border-gray-200 min-w-fit">
        <p className="text-xs font-semibold text-gray-500 text-center mb-1.5">{playerName}</p>
        {guesses.length === 0 ? (
          <div className="text-xs text-gray-400 text-center py-1 px-2">Waiting…</div>
        ) : (
          <div className="flex flex-col gap-0.5">
            {guesses.map((guessData, idx) => (
              <div key={idx} className="flex gap-0.5 justify-center">
                {guessData.feedback.map((color, colIdx) => (
                  <div
                    key={colIdx}
                    className={`w-5 h-5 rounded-sm ${getTileColor(color)}`}
                  />
                ))}
              </div>
            ))}
            {Array.from({ length: Math.min(guessesLeft, 3) }).map((_, i) => (
              <div key={`ep-${i}`} className="flex gap-0.5 justify-center">
                {Array.from({ length: 5 }).map((_, j) => (
                  <div key={j} className="w-5 h-5 rounded-sm bg-gray-100 border border-gray-200" />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Full board mode ──
  return (
    <div className="flex flex-col gap-1.5">
      <h3 className="text-base font-semibold text-center text-gray-700">{playerName}</h3>
      <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col gap-1">
          {guesses.map((guessData, idx) => (
            <div key={idx} className="flex gap-0.5 justify-center">
              {guessData.feedback.map((color, colIdx) => (
                <div key={colIdx} className={`w-6 h-6 rounded-sm ${getTileColor(color)}`} />
              ))}
            </div>
          ))}
        </div>
        {guessesLeft > 0 && (
          <p className="text-xs text-gray-400 text-center mt-2">
            {guessesLeft} guess{guessesLeft !== 1 ? 'es' : ''} left
          </p>
        )}
      </div>
    </div>
  );
}
