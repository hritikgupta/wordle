import React, { useState, useEffect, useCallback, useRef } from 'react';
import { socket } from '../socket';
import { GameBoard } from '../components/GameBoard';
import { OpponentBoard } from '../components/OpponentBoard';
import { Keyboard } from '../components/Keyboard';
import { RoomCode } from '../components/RoomCode';
import { GameStatus } from '../components/GameStatus';

export function Game({ roomCode, playerName, onLeaveGame }) {
  const [gameState, setGameState] = useState('waiting'); // waiting, in_progress, won, draw
  const [currentGuess, setCurrentGuess] = useState('');
  const [myGuesses, setMyGuesses] = useState([]);
  const [opponentGuesses, setOpponentGuesses] = useState([]);
  const [myName] = useState(playerName);
  const [opponentName, setOpponentName] = useState('Opponent');
  const [playerCount, setPlayerCount] = useState(1);
  const [error, setError] = useState('');
  const [shaking, setShaking] = useState(false);
  const [winner, setWinner] = useState(null);
  const [wordWas, setWordWas] = useState('');
  const [opponentDisconnected, setOpponentDisconnected] = useState(false);
  const [myScore, setMyScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);

  const inputRef = useRef(null);
  // Ref keeps currentGuess readable inside stable callbacks without stale closure
  const currentGuessRef = useRef('');
  useEffect(() => { currentGuessRef.current = currentGuess; }, [currentGuess]);

  // ─── Reset all board state (used for both rematch and game_started) ───
  const resetBoardState = useCallback(() => {
    setCurrentGuess('');
    setMyGuesses([]);
    setOpponentGuesses([]);
    setWinner(null);
    setWordWas('');
    setError('');
    setShaking(false);
  }, []);

  // ─── Socket listeners ───
  useEffect(() => {
    // Recover state if we reconnect mid-game
    socket.emit('get_room_status', { roomCode }, (response) => {
      if (!response.success) return;
      if (response.gameStatus === 'in_progress') {
        setGameState('in_progress');
        setPlayerCount(response.playerCount);
        const myId = socket.id;
        Object.entries(response.players).forEach(([pid, data]) => {
          if (pid === myId) {
            setMyGuesses(data.guesses);
          } else {
            setOpponentGuesses(data.guesses);
            setOpponentName(data.name);
          }
        });
      }
    });

    const handleRoomUpdated = (data) => {
      setPlayerCount(data.playerCount);
      Object.entries(data.players).forEach(([pid, data]) => {
        if (pid !== socket.id) setOpponentName(data.name);
      });
    };

    // BUG FIX: game_started is emitted for rematches too — always clear boards
    const handleGameStarted = (data) => {
      setGameState('in_progress');
      setPlayerCount(data.playerCount);
      resetBoardState();
    };

    const handleBoardUpdated = (data) => {
      const myId = socket.id;
      Object.entries(data.players).forEach(([pid, playerData]) => {
        if (pid === myId) {
          setMyGuesses(playerData.guesses);
        } else {
          setOpponentGuesses(playerData.guesses);
          setOpponentName(playerData.name);
        }
      });
    };

    const handleGameOver = (data) => {
      setGameState(data.gameStatus);
      setWinner(data.winner);
      setWordWas(data.wordWas);
    };

    const handlePlayerDisconnected = () => {
      setOpponentDisconnected(true);
    };

    socket.on('room_updated', handleRoomUpdated);
    socket.on('game_started', handleGameStarted);
    socket.on('board_updated', handleBoardUpdated);
    socket.on('game_over', handleGameOver);
    socket.on('player_disconnected', handlePlayerDisconnected);

    return () => {
      socket.off('room_updated', handleRoomUpdated);
      socket.off('game_started', handleGameStarted);
      socket.off('board_updated', handleBoardUpdated);
      socket.off('game_over', handleGameOver);
      socket.off('player_disconnected', handlePlayerDisconnected);
    };
  }, [resetBoardState]);

  // ─── Championship scores (localStorage) ───
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`wordle_championship_${roomCode}`);
      if (saved) {
        const { myScore: s1, opponentScore: s2 } = JSON.parse(saved);
        setMyScore(s1 ?? 0);
        setOpponentScore(s2 ?? 0);
      }
    } catch {}
  }, [roomCode]);

  useEffect(() => {
    if (myScore > 0 || opponentScore > 0) {
      localStorage.setItem(
        `wordle_championship_${roomCode}`,
        JSON.stringify({ myScore, opponentScore })
      );
    }
  }, [myScore, opponentScore, roomCode]);

  useEffect(() => {
    if (gameState === 'won' && winner) {
      if (winner === socket.id) {
        setMyScore((prev) => prev + 1);
      } else {
        setOpponentScore((prev) => prev + 1);
      }
    }
  }, [gameState, winner]);

  // ─── Auto-dismiss errors after 2 s ───
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(''), 2000);
    return () => clearTimeout(t);
  }, [error]);

  // ─── Show error + shake animation ───
  const showError = useCallback((msg) => {
    setError(msg);
    setShaking(true);
    // Remove class so it can be re-applied next time
    setTimeout(() => setShaking(false), 500);
  }, []);

  // ─── Key handler — no currentGuess in deps; reads via ref for ENTER ───
  const handleKeyPress = useCallback(
    (key) => {
      if (gameState !== 'in_progress' || opponentDisconnected) return;

      if (key === 'BACKSPACE') {
        setCurrentGuess((prev) => prev.slice(0, -1));
        setError('');
      } else if (key === 'ENTER') {
        const current = currentGuessRef.current;
        if (current.length !== 5) {
          showError('Not enough letters');
          return;
        }
        socket.emit('submit_guess', { guess: current }, (response) => {
          if (!response.success) {
            showError(response.error || 'Not in word list');
          }
        });
        setCurrentGuess('');
      } else if (/^[A-Z]$/.test(key)) {
        setCurrentGuess((prev) => (prev.length < 5 ? prev + key : prev));
        setError('');
      }
    },
    [gameState, opponentDisconnected, showError]
  );

  // ─── Physical keyboard ───
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameState !== 'in_progress' || opponentDisconnected) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const key = e.key.toUpperCase();
      if (/^[A-Z]$/.test(key)) {
        handleKeyPress(key);
      } else if (e.key === 'Backspace') {
        handleKeyPress('BACKSPACE');
      } else if (e.key === 'Enter') {
        handleKeyPress('ENTER');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyPress, gameState, opponentDisconnected]);

  // ─── Keep hidden input focused for mobile keyboard ───
  useEffect(() => {
    if (gameState === 'in_progress') {
      inputRef.current?.focus();
    }
  }, [gameState]);

  // ─── Mobile input: use onKeyDown for backspace/enter, onInput for letters ───
  // Separating the two avoids the double-fire from onChange + onInput,
  // and lets us reliably detect backspace on Android & iOS.
  const mobileBackspaceHandled = useRef(false);

  const handleHiddenKeyDown = useCallback(
    (e) => {
      if (e.key === 'Backspace') {
        mobileBackspaceHandled.current = true;
        handleKeyPress('BACKSPACE');
        e.preventDefault();
      } else if (e.key === 'Enter') {
        handleKeyPress('ENTER');
        e.preventDefault();
      }
    },
    [handleKeyPress]
  );

  const handleHiddenInput = useCallback(
    (e) => {
      // Backspace was already handled by onKeyDown — skip the input event
      if (mobileBackspaceHandled.current) {
        mobileBackspaceHandled.current = false;
        e.target.value = '';
        return;
      }
      const val = e.target.value.toUpperCase();
      for (const char of val) {
        if (/^[A-Z]$/.test(char)) handleKeyPress(char);
      }
      e.target.value = '';
    },
    [handleKeyPress]
  );

  // ─── Rematch ───
  const handleRematch = () => {
    socket.emit('start_new_game', { roomCode }, (response) => {
      if (response.success) {
        // Server will emit game_started which calls resetBoardState.
        // Also reset locally so the initiating player doesn't wait.
        setGameState('in_progress');
        resetBoardState();
      } else {
        showError(response.error || 'Failed to start rematch');
      }
    });
  };

  const isGameOver = gameState === 'won' || gameState === 'draw';
  const isPlaying = gameState === 'in_progress' && !opponentDisconnected;
  const myId = socket.id;

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-gray-100 no-select">
      {/*
        Hidden input — positioned off-screen via fixed+negative top (not left: -9999px
        which can cause horizontal scroll on iOS). Font-size 16px prevents iOS zoom.
      */}
      <input
        ref={inputRef}
        type="text"
        inputMode="text"
        enterKeyHint="go"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck="false"
        onKeyDown={handleHiddenKeyDown}
        onInput={handleHiddenInput}
        onBlur={() => {
          if (gameState === 'in_progress') {
            setTimeout(() => inputRef.current?.focus(), 100);
          }
        }}
        style={{
          position: 'fixed',
          top: '-100px',
          left: '50%',
          opacity: 0,
          pointerEvents: 'none',
          fontSize: '16px', // prevents iOS viewport zoom on focus
        }}
      />

      {/* ─── Scrollable main content ─── */}
      <div
        className="max-w-lg mx-auto w-full px-4 pt-4 flex-1"
        style={{ paddingBottom: isPlaying ? '260px' : '24px' }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-2xl font-bold text-gray-800">Wordle</h1>
          <button
            onClick={onLeaveGame}
            className="px-4 py-2 min-h-[44px] bg-red-500 hover:bg-red-600 active:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            Leave
          </button>
        </div>

        {/* Room code + game status */}
        <div className="space-y-2 mb-3">
          <RoomCode roomCode={roomCode} playerCount={playerCount} />
          <GameStatus
            gameStatus={gameState}
            winner={winner}
            currentPlayerId={myId}
            playerName={myName}
          />

          {/* Championship scoreboard */}
          {(myScore > 0 || opponentScore > 0) && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-2.5 text-center">
              <p className="text-xs font-semibold text-purple-600 mb-0.5 tracking-wide">
                CHAMPIONSHIP
              </p>
              <p className="text-base font-bold text-purple-900">
                {myName.split(' ')[0]}:{' '}
                <span className="text-purple-600">{myScore}</span>
                {'  vs  '}
                {opponentName.split(' ')[0]}:{' '}
                <span className="text-purple-600">{opponentScore}</span>
              </p>
            </div>
          )}
        </div>

        {/* Opponent disconnected banner */}
        {opponentDisconnected && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-3">
            <p className="font-semibold text-sm">Opponent has disconnected</p>
          </div>
        )}

        {/* Error toast */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2.5 rounded-lg mb-3 text-center text-sm font-semibold">
            {error}
          </div>
        )}

        {/* My board */}
        <div className="flex justify-center">
          <GameBoard
            guesses={myGuesses}
            currentGuess={gameState === 'in_progress' ? currentGuess : ''}
            playerName={`${myName} (You)`}
            large
            shake={shaking}
          />
        </div>
      </div>

      {/* ─── Fixed footer: opponent strip + keyboard ─── */}
      {isPlaying && (
        <div
          className="fixed bottom-0 left-0 right-0 z-50 bg-gray-50 border-t border-gray-200"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          {/* Opponent mini-board strip */}
          <div className="px-4 pt-2 pb-1 flex items-center gap-3 border-b border-gray-200">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider shrink-0">
              Opp
            </span>
            <div className="flex-1 min-w-0">
              <OpponentBoard
                guesses={opponentGuesses}
                playerName={opponentName}
                playerCount={playerCount}
                compact
                inline
              />
            </div>
          </div>

          {/* Keyboard */}
          <div className="px-2 pt-2 pb-1 max-w-lg mx-auto">
            <Keyboard onKeyPress={handleKeyPress} guesses={myGuesses} />
          </div>
        </div>
      )}

      {/* ─── Game-over modal ─── */}
      {isGameOver && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl">
            {gameState === 'won' && winner === myId ? (
              <>
                <div className="text-5xl mb-3">🎉</div>
                <h2 className="text-2xl font-bold text-green-600 mb-1">You Won!</h2>
                <p className="text-gray-500 text-sm mb-4">
                  Solved in {myGuesses.length} {myGuesses.length === 1 ? 'guess' : 'guesses'}!
                </p>
              </>
            ) : gameState === 'won' ? (
              <>
                <div className="text-5xl mb-3">😢</div>
                <h2 className="text-2xl font-bold text-gray-700 mb-1">{opponentName} Won</h2>
                <p className="text-gray-500 text-sm mb-4">Better luck next time!</p>
              </>
            ) : (
              <>
                <div className="text-5xl mb-3">🤝</div>
                <h2 className="text-2xl font-bold text-blue-600 mb-1">It's a Draw</h2>
                <p className="text-gray-500 text-sm mb-4">Neither player solved the word.</p>
              </>
            )}

            {wordWas && (
              <div className="bg-gray-50 rounded-xl p-3 mb-5">
                <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide">The word was</p>
                <p className="text-3xl font-bold text-green-600 tracking-widest">{wordWas}</p>
              </div>
            )}

            <button
              onClick={handleRematch}
              className="w-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-colors text-base min-h-[52px]"
            >
              Play Again
            </button>
            <button
              onClick={onLeaveGame}
              className="w-full mt-2 text-gray-400 font-medium py-2 rounded-xl text-sm min-h-[44px]"
            >
              Leave Game
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
