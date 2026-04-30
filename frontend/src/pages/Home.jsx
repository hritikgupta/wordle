import React, { useState, useRef, useEffect } from 'react';
import { socket } from '../socket';

export function Home({ onGameStart }) {
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');
  const nameRef = useRef(null);

  // Auto-focus name input on mount (desktop quality-of-life)
  useEffect(() => {
    nameRef.current?.focus();
  }, []);

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
        onGameStart({ roomCode: response.roomCode, playerName: playerName.trim(), isCreator: true });
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
          onGameStart({ roomCode: response.roomCode, playerName: playerName.trim(), isCreator: false });
        } else {
          setError(response.error || 'Failed to join room');
        }
      }
    );
  };

  // onKeyDown replaces deprecated onKeyPress
  const handleNameKeyDown = (e) => {
    if (e.key === 'Enter') handleCreateRoom();
  };
  const handleCodeKeyDown = (e) => {
    if (e.key === 'Enter') handleJoinRoom();
  };

  const canCreate = !isCreating && playerName.trim().length > 0;
  const canJoin = !isJoining && playerName.trim().length > 0 && roomCode.trim().length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-500 to-purple-600 flex items-center justify-center p-4"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-full">
        <h1 className="text-4xl font-bold text-center mb-1 text-gray-800">Wordle</h1>
        <p className="text-center text-gray-500 mb-7 text-sm">Multiplayer Edition</p>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Your Name
            </label>
            <input
              ref={nameRef}
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value.slice(0, 20))}
              onKeyDown={handleNameKeyDown}
              placeholder="Enter your name"
              maxLength={20}
              autoComplete="name"
              className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[48px]"
              style={{ fontSize: '16px' }} // prevent iOS zoom
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Create */}
          <button
            onClick={handleCreateRoom}
            disabled={!canCreate}
            className="w-full bg-green-500 hover:bg-green-600 active:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-colors min-h-[52px] text-base"
          >
            {isCreating ? 'Creating room…' : '+ Create New Game'}
          </button>

          {/* Divider */}
          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-gray-400 font-medium">OR</span>
            </div>
          </div>

          {/* Room code */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Room Code
            </label>
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase().slice(0, 6))}
              onKeyDown={handleCodeKeyDown}
              placeholder="XXXXXX"
              maxLength={6}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="characters"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono text-center text-2xl tracking-widest min-h-[48px]"
              style={{ fontSize: '24px' }} // large enough; no iOS zoom
            />
          </div>

          {/* Join */}
          <button
            onClick={handleJoinRoom}
            disabled={!canJoin}
            className="w-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-colors min-h-[52px] text-base"
          >
            {isJoining ? 'Joining room…' : 'Join Game →'}
          </button>
        </div>

        {/* How to play */}
        <div className="mt-7 p-4 bg-gray-50 rounded-xl">
          <h3 className="font-semibold text-gray-700 mb-2 text-sm">How to Play</h3>
          <ul className="text-sm text-gray-500 space-y-1">
            <li>🟩 Green — right letter, right spot</li>
            <li>🟨 Yellow — right letter, wrong spot</li>
            <li>⬜ Gray — letter not in word</li>
            <li>⚡ First to solve the word wins!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
