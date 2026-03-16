import React, { useState, useEffect, useCallback, useRef } from 'react';
import { socket } from '../socket';
import { GameBoard } from '../components/GameBoard';
import { OpponentBoard } from '../components/OpponentBoard';
import { Keyboard } from '../components/Keyboard';
import { RoomCode } from '../components/RoomCode';
import { GameStatus } from '../components/GameStatus';

export function Game({ roomCode, playerName, onGameEnd, onLeaveGame }) {
  const [gameState, setGameState] = useState('waiting'); // waiting, in_progress, won, draw
  const [currentGuess, setCurrentGuess] = useState('');
  const [myGuesses, setMyGuesses] = useState([]);
  const [opponentGuesses, setOpponentGuesses] = useState([]);
  const [myName, setMyName] = useState(playerName);
  const [opponentName, setOpponentName] = useState('Opponent');
  const [playerCount, setPlayerCount] = useState(1);
  const [error, setError] = useState('');
  const [winner, setWinner] = useState(null);
  const [wordWas, setWordWas] = useState('');
  const [opponentDisconnected, setOpponentDisconnected] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Championship tracking
  const [myScore, setMyScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);

  const inputRef = useRef(null);

  useEffect(() => {
    console.log('📋 Game component mounted, setting up socket listeners for room:', roomCode);

    // Track mobile/desktop viewport changes
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);

    // Check current room status when component mounts (fixes race condition)
    socket.emit('get_room_status', { roomCode }, (response) => {
      if (response.success) {
        console.log('📊 Current room status:', response.gameStatus, 'players:', response.playerCount);

        // If game has already started, update the state
        if (response.gameStatus === 'in_progress') {
          console.log('🎮 Game already in progress - updating state');
          setGameState('in_progress');
          setPlayerCount(response.playerCount);

          // Update guess boards from response
          const myId = socket.id;
          const players = response.players;
          Object.entries(players).forEach(([playerId, playerData]) => {
            if (playerId === myId) {
              setMyGuesses(playerData.guesses);
            } else {
              setOpponentGuesses(playerData.guesses);
              setOpponentName(playerData.name);
            }
          });
        }
      }
    });

    // Handle room updated (someone joined)
    const handleRoomUpdated = (data) => {
      console.log('👥 Room updated:', data.playerCount, 'players');
      setPlayerCount(data.playerCount);
      const players = data.players;
      const playerIds = Object.keys(players);

      if (playerIds.length > 0) {
        if (playerIds[0] !== socket.id) {
          setOpponentName(players[playerIds[0]].name);
        }
      }
      if (playerIds.length > 1) {
        if (playerIds[1] !== socket.id) {
          setOpponentName(players[playerIds[1]].name);
        }
      }
    };

    // Handle game started
    const handleGameStarted = (data) => {
      console.log('🎮 Game started event received:', data);
      setGameState('in_progress');
      setPlayerCount(data.playerCount);
    };

    // Handle board updated
    const handleBoardUpdated = (data) => {
      const players = data.players;
      const myId = socket.id;

      Object.entries(players).forEach(([playerId, playerData]) => {
        if (playerId === myId) {
          setMyGuesses(playerData.guesses);
        } else {
          setOpponentGuesses(playerData.guesses);
          setOpponentName(playerData.name);
        }
      });
    };

    // Handle game over
    const handleGameOver = (data) => {
      setGameState(data.gameStatus);
      setWinner(data.winner);
      setWordWas(data.wordWas);
    };

    // Handle player disconnected
    const handlePlayerDisconnected = () => {
      setOpponentDisconnected(true);
    };

    socket.on('room_updated', handleRoomUpdated);
    socket.on('game_started', handleGameStarted);
    socket.on('board_updated', handleBoardUpdated);
    socket.on('game_over', handleGameOver);
    socket.on('player_disconnected', handlePlayerDisconnected);
    console.log('✅ All socket listeners attached');

    return () => {
      console.log('🧹 Cleaning up socket listeners');
      socket.off('room_updated', handleRoomUpdated);
      socket.off('game_started', handleGameStarted);
      socket.off('board_updated', handleBoardUpdated);
      socket.off('game_over', handleGameOver);
      socket.off('player_disconnected', handlePlayerDisconnected);
    };
  }, []);

  // Load championship scores from localStorage on mount
  useEffect(() => {
    const savedChampionship = localStorage.getItem(`wordle_championship_${roomCode}`);
    if (savedChampionship) {
      const { myScore: savedMyScore, opponentScore: savedOpponentScore } = JSON.parse(savedChampionship);
      setMyScore(savedMyScore);
      setOpponentScore(savedOpponentScore);
      console.log(`📊 Loaded championship scores: ${savedMyScore}-${savedOpponentScore}`);
    }
  }, [roomCode]);

  // Save championship scores to localStorage whenever they change
  useEffect(() => {
    if (myScore > 0 || opponentScore > 0) {
      localStorage.setItem(`wordle_championship_${roomCode}`, JSON.stringify({
        myScore,
        opponentScore,
      }));
    }
  }, [myScore, opponentScore, roomCode]);

  // Update scores when game ends
  useEffect(() => {
    if (gameState === 'won' && winner) {
      const myId = socket.id;
      if (winner === myId) {
        setMyScore(prev => prev + 1);
      } else {
        setOpponentScore(prev => prev + 1);
      }
    }
  }, [gameState, winner]);

  const handleKeyPress = useCallback((key) => {
    if (gameState !== 'in_progress' || opponentDisconnected) return;

    if (key === 'BACKSPACE') {
      setCurrentGuess(prevGuess => prevGuess.slice(0, -1));
      setError('');
    } else if (key === 'ENTER') {
      setCurrentGuess(prevGuess => {
        if (prevGuess.length === 5) {
          socket.emit('submit_guess', { guess: prevGuess }, (response) => {
            if (response.success) {
              setCurrentGuess('');
              setError('');
            } else {
              setError(response.error);
            }
          });
          return '';
        } else {
          setError('Please enter 5 letters');
          return prevGuess;
        }
      });
    } else if (currentGuess.length < 5) {
      setCurrentGuess(prevGuess => prevGuess + key);
      setError('');
    }
  }, [gameState, currentGuess, opponentDisconnected]);

  // Add physical keyboard support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState !== 'in_progress' || opponentDisconnected) return;

      const key = e.key.toUpperCase();

      // Letters A-Z
      if (/^[A-Z]$/.test(key)) {
        handleKeyPress(key);
      }
      // Backspace
      else if (e.key === 'Backspace') {
        handleKeyPress('BACKSPACE');
      }
      // Enter
      else if (e.key === 'Enter') {
        handleKeyPress('ENTER');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyPress, gameState, opponentDisconnected]);

  // Keep input focused for mobile keyboard support
  useEffect(() => {
    if (gameState === 'in_progress' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [gameState]);

  // Handle mobile text input - both onChange and onInput
  const handleMobileInput = (e) => {
    let value = e.target.value.toUpperCase();

    // Process all characters in the input
    for (let char of value) {
      if (/^[A-Z]$/.test(char)) {
        handleKeyPress(char);
      }
    }

    // Clear the input immediately for next character
    e.target.value = '';
  };

  const handleRematch = () => {
    socket.emit('create_room', { playerName: myName }, (response) => {
      if (response.success) {
        onGameEnd({
          roomCode: response.roomCode,
          playerName: myName,
          isCreator: true,
        });
      }
    });
  };

  const isGameOver = gameState === 'won' || gameState === 'draw';
  const myId = socket.id;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-100 pb-64 sm:pb-80">
      {/* Hidden input for mobile keyboard support */}
      <input
        ref={inputRef}
        type="text"
        inputMode="text"
        className="sr-only"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck="false"
        onChange={handleMobileInput}
        onInput={handleMobileInput}
        onBlur={(e) => {
          if (gameState === 'in_progress') {
            setTimeout(() => e.currentTarget.focus(), 50);
          }
        }}
        maxLength="5"
        style={{
          position: 'absolute',
          left: '-9999px',
          opacity: '0',
          pointerEvents: 'none',
        }}
      />

      {/* Opponent Board - Fixed Badge in Top-Right */}
      <div className="fixed top-4 right-4 z-40">
        <OpponentBoard
          guesses={opponentGuesses}
          playerName={opponentName}
          playerCount={playerCount}
          compact={true}
        />
      </div>

      {/* Main Content Container */}
      <div className="max-w-2xl mx-auto px-4 pt-4 sm:pt-6">
        {/* Header with Leave Button */}
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">🎮 Wordle</h1>
          <button
            onClick={onLeaveGame}
            className="px-3 sm:px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs sm:text-sm font-semibold"
          >
            Leave
          </button>
        </div>

        {/* Room Code & Status */}
        <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
          <div>
            <RoomCode roomCode={roomCode} playerCount={playerCount} />
          </div>
          <div>
            <GameStatus
              gameStatus={gameState}
              winner={winner}
              currentPlayerId={myId}
              playerName={myName}
            />
          </div>
          {/* Championship Scoreboard */}
          {(myScore > 0 || opponentScore > 0) && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-3 text-center">
              <p className="text-xs font-semibold text-purple-600 mb-1">🏆 CHAMPIONSHIP</p>
              <p className="text-lg font-bold text-purple-900">
                {myName.split(' ')[0]}: <span className="text-purple-600">{myScore}</span>
                {' '} vs {' '}
                {opponentName.split(' ')[0]}: <span className="text-purple-600">{opponentScore}</span>
              </p>
            </div>
          )}
        </div>

        {/* Opponent Disconnected Warning */}
        {opponentDisconnected && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-semibold">Opponent has disconnected</p>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-center">
            {error}
          </div>
        )}

        {/* My Game Board - Prominent */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <GameBoard
            guesses={myGuesses}
            currentGuess={gameState === 'in_progress' ? currentGuess : ''}
            playerName={`${myName} (You)`}
            large={true}
          />
        </div>
      </div>

      {/* Fixed Keyboard at Bottom */}
      {gameState === 'in_progress' && !opponentDisconnected ? (
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-gray-100 to-gray-50 border-t border-gray-300 p-4 sm:p-6 z-50">
          <div className="max-w-2xl mx-auto">
            <Keyboard
              onKeyPress={handleKeyPress}
              guesses={myGuesses}
              disabled={false}
            />
          </div>
        </div>
      ) : null}

      {/* Game Over Screen */}
      {isGameOver && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full text-center">
            {gameState === 'won' && winner === myId ? (
              <>
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold text-green-600 mb-4">
                  You Won!
                </h2>
                <p className="text-gray-600 mb-6">
                  Congratulations! You solved the word.
                </p>
              </>
            ) : gameState === 'won' ? (
              <>
                <div className="text-6xl mb-4">😢</div>
                <h2 className="text-2xl font-bold text-gray-600 mb-4">
                  {opponentName} Won
                </h2>
                <p className="text-gray-600 mb-6">
                  Better luck next time!
                </p>
              </>
            ) : (
              <>
                <div className="text-6xl mb-4">🤝</div>
                <h2 className="text-2xl font-bold text-blue-600 mb-4">
                  It's a Draw
                </h2>
                <p className="text-gray-600 mb-6">
                  Both players failed to solve the word.
                </p>
              </>
            )}

            {wordWas && (
              <p className="text-lg font-semibold text-gray-800 mb-6">
                The word was: <span className="text-2xl text-green-600">{wordWas}</span>
              </p>
            )}

            <button
              onClick={handleRematch}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition-colors"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
