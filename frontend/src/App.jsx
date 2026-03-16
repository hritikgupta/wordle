import React, { useState } from 'react';
import './index.css';
import { Home } from './pages/Home';
import { Game } from './pages/Game';

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [gameInfo, setGameInfo] = useState(null);

  const handleGameStart = (info) => {
    setGameInfo(info);
    setCurrentPage('game');
  };

  const handleGameEnd = (info) => {
    setGameInfo(info);
    setCurrentPage('game');
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
        />
      )}
    </div>
  );
}

export default App;
