import React from 'react';

export function GameStatus({ gameStatus, winner, currentPlayerId, playerName }) {
  if (gameStatus === 'waiting') {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
        <p className="text-yellow-800 font-semibold">⏳ Waiting for opponent...</p>
      </div>
    );
  }

  if (gameStatus === 'in_progress') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
        <p className="text-green-800 font-semibold">🎮 Game in progress</p>
      </div>
    );
  }

  if (gameStatus === 'won') {
    const isWinner = winner === currentPlayerId;
    return (
      <div
        className={`rounded-lg p-4 text-center ${
          isWinner
            ? 'bg-green-50 border border-green-300'
            : 'bg-gray-50 border border-gray-300'
        }`}
      >
        <p
          className={`font-bold text-lg ${
            isWinner ? 'text-green-700' : 'text-gray-700'
          }`}
        >
          {isWinner ? '🎉 You Won!' : '😢 Opponent Won'}
        </p>
      </div>
    );
  }

  if (gameStatus === 'draw') {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
        <p className="text-blue-800 font-bold text-lg">🤝 It's a Draw!</p>
        <p className="text-blue-700 text-sm mt-1">Both players failed within 6 guesses</p>
      </div>
    );
  }

  return null;
}
