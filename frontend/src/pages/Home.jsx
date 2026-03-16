import React, { useState } from 'react';
import { socket } from '../socket';

export function Home({ onGameStart }) {
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');

  const handleCreateRoom = () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    setIsCreating(true);
    setError('');

    socket.emit('create_room', { playerName: playerName.trim() }, (response) => {
      setIsCreating(false);
      if (response.success) {
        onGameStart({
          roomCode: response.roomCode,
          playerName: playerName.trim(),
          isCreator: true,
        });
      } else {
        setError(response.error || 'Failed to create room');
      }
    });
  };

  const handleJoinRoom = () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!roomCode.trim()) {
      setError('Please enter a room code');
      return;
    }

    setIsJoining(true);
    setError('');

    socket.emit(
      'join_room',
      { playerName: playerName.trim(), roomCode: roomCode.trim() },
      (response) => {
        setIsJoining(false);
        if (response.success) {
          onGameStart({
            roomCode: response.roomCode,
            playerName: playerName.trim(),
            isCreator: false,
          });
        } else {
          setError(response.error || 'Failed to join room');
        }
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">
        <h1 className="text-4xl font-bold text-center mb-2 text-gray-800">
          🎮 Wordle
        </h1>
        <p className="text-center text-gray-600 mb-8">Multiplayer Edition</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handleCreateRoom()}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <button
            onClick={handleCreateRoom}
            disabled={isCreating || !playerName.trim()}
            className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-3 rounded-lg transition-colors"
          >
            {isCreating ? 'Creating room...' : '+ Create New Game'}
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">OR</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Room Code
            </label>
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="Enter room code"
              maxLength="6"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-center text-xl tracking-widest"
              onKeyPress={(e) => e.key === 'Enter' && handleJoinRoom()}
            />
          </div>

          <button
            onClick={handleJoinRoom}
            disabled={isJoining || !playerName.trim() || !roomCode.trim()}
            title={
              !playerName.trim() ? 'Enter your name first' :
              !roomCode.trim() ? 'Enter a room code' :
              isJoining ? 'Joining...' : 'Join game'
            }
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-colors"
          >
            {isJoining ? 'Joining room...' : 'Join Game'}
          </button>
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">How to Play</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>✓ Guess the 5-letter word in 6 tries</li>
            <li>✓ Green = correct letter, correct spot</li>
            <li>✓ Yellow = correct letter, wrong spot</li>
            <li>✓ Gray = letter not in word</li>
            <li>✓ First to solve wins!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
