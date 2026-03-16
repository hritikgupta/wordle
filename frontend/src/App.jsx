import React, { useState, useEffect } from 'react';
import './index.css';
import { Home } from './pages/Home';
import { Game } from './pages/Game';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [gameInfo, setGameInfo] = useState(null);

  // Restore session from localStorage and URL on app load
  useEffect(() => {
    // Check if there's a roomCode in the URL
    const params = new URLSearchParams(window.location.search);
    const roomCodeFromUrl = params.get('room');

    if (roomCodeFromUrl) {
      // Try to restore from localStorage
      const savedSession = localStorage.getItem(`wordle_session_${roomCodeFromUrl}`);
      if (savedSession) {
        const session = JSON.parse(savedSession);
        setGameInfo(session);
        setCurrentPage('game');
      }
    }
  }, []);

  const handleGameStart = (info) => {
    setGameInfo(info);
    setCurrentPage('game');

    // Save to localStorage
    localStorage.setItem(`wordle_session_${info.roomCode}`, JSON.stringify(info));

    // Add roomCode to URL
    const url = new URL(window.location);
    url.searchParams.set('room', info.roomCode);
    window.history.replaceState({}, '', url);
  };

  const handleGameEnd = (info) => {
    setGameInfo(info);
    setCurrentPage('game');

    // Save to localStorage
    localStorage.setItem(`wordle_session_${info.roomCode}`, JSON.stringify(info));

    // Add roomCode to URL
    const url = new URL(window.location);
    url.searchParams.set('room', info.roomCode);
    window.history.replaceState({}, '', url);
  };

  const handleLeaveGame = () => {
    setCurrentPage('home');
    setGameInfo(null);

    // Clear URL
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
          onGameEnd={handleGameEnd}
          onLeaveGame={handleLeaveGame}
        />
      )}
    </div>
  );
}

export default App;
