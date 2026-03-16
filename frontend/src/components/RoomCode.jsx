import React, { useState } from 'react';
import { copyToClipboard } from '../utils';

export function RoomCode({ roomCode, playerCount }) {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    copyToClipboard(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
      <p className="text-sm text-gray-600 mb-2">Room Code</p>
      <div className="flex items-center justify-center gap-2">
        <code className="text-2xl font-mono font-bold text-blue-600 tracking-widest">
          {roomCode}
        </code>
        <button
          onClick={handleCopyCode}
          className="ml-2 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-3">
        Players: {playerCount}/2
      </p>
    </div>
  );
}
