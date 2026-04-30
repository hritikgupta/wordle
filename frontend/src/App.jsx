import React, { useState, useEffect } from 'react';
import './index.css';
import { Home } from './pages/Home';
import { Game } from './pages/Game';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [gameInfo, setGameInfo] = useState(null);

  // Restore session from URL on load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomCodeFromUrl = params.get('room');
    if (roomCodeFromUrl) {
      const saved = localStorage.getItem(`wordle_session_${roomCodeFromUrl}`);
      if (saved) {
        try {
          setGameInfo(JSON.parse(saved));
          setCurrentPage('game');
        } catch {}
      }
    }
  }, []);

  const handleGameStart = (info) => {
    setGameInfo(info);
    setCurrentPage('game');
    localStorage.setItem(`wordle_session_${info.roomCode}`, JSON.stringify(info));
    const url = new URL(window.location);
    url.searchParams.set('room', info.roomCode);
    window.history.replaceState({}, '', url);
  };

  // handleGameEnd was identical to handleLeaveGame — merged into one
  const handleLeaveGame = () => {
    setCurrentPage('home');
    setGameInfo(null);
    const url = new URL(window.location);
    url.searchParams.delete('room');
    window.history.replaceState({}, '', url);
  };

  return (
    <div>
      {currentPage === 'home' ? (
        <Home onGameStart={handleGameStart} />
      ) : (
        <Game
          roomCode={gameInfo.roomCode}
          playerName={gameInfo.playerName}
          onLeaveGame={handleLeaveGame}
        />
      )}
    </div>
  );
}

export default App;
