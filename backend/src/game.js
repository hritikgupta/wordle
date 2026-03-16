import { getRandomWord, normalizeWord, isValidWord } from './words.js';

export class GameRoom {
  constructor(roomId) {
    this.roomId = roomId;
    this.players = {};
    this.targetWord = null;
    this.gameStatus = 'waiting'; // waiting, in_progress, won, draw
    this.winner = null;
    this.createdAt = Date.now();
  }

  addPlayer(playerId, playerName) {
    this.players[playerId] = {
      id: playerId,
      name: playerName,
      guesses: [],
      gameStatus: 'playing', // playing, won, lost
      startedAt: null,
    };
  }

  removePlayer(playerId) {
    delete this.players[playerId];
    if (Object.keys(this.players).length === 0) {
      return true; // room is empty, should be deleted
    }
    return false;
  }

  hasEnoughPlayers() {
    return Object.keys(this.players).length === 2;
  }

  startGame() {
    if (!this.hasEnoughPlayers()) {
      throw new Error('Need 2 players to start');
    }
    this.gameStatus = 'in_progress';
    this.targetWord = getRandomWord();
    Object.values(this.players).forEach(player => {
      player.guesses = [];
      player.gameStatus = 'playing';
      player.startedAt = Date.now();
    });
  }

  submitGuess(playerId, guess) {
    if (!this.players[playerId]) {
      throw new Error('Player not found');
    }

    const normalizedGuess = normalizeWord(guess);

    if (normalizedGuess.length !== 5) {
      throw new Error('Guess must be 5 letters');
    }

    if (!isValidWord(normalizedGuess)) {
      throw new Error('Invalid word');
    }

    if (this.players[playerId].guesses.length >= 6) {
      throw new Error('No more guesses left');
    }

    const feedback = this.getGuesseFeedback(normalizedGuess);
    this.players[playerId].guesses.push({
      guess: normalizedGuess,
      feedback,
      timestamp: Date.now(),
    });

    // Check if player won
    if (normalizedGuess === this.targetWord) {
      this.players[playerId].gameStatus = 'won';

      // Check if other player lost
      const otherPlayer = Object.values(this.players).find(p => p.id !== playerId);

      this.gameStatus = 'won';
      this.winner = playerId;

      return { won: true, wordWas: this.targetWord };
    }

    // Check if this was the last guess
    if (this.players[playerId].guesses.length === 6) {
      this.players[playerId].gameStatus = 'lost';

      // Check if the other player also lost
      const otherPlayer = Object.values(this.players).find(p => p.id !== playerId);
      if (otherPlayer.gameStatus === 'lost') {
        this.gameStatus = 'draw';
        this.winner = null;
      }

      return { won: false, wordWas: this.targetWord, lastGuess: true };
    }

    return { won: false };
  }

  getGuesseFeedback(guess) {
    const feedback = Array(5).fill('gray'); // gray, yellow, green
    const targetLetters = this.targetWord.split('');
    const guessLetters = guess.split('');

    // First pass: mark greens and track remaining letters
    for (let i = 0; i < 5; i++) {
      if (guessLetters[i] === targetLetters[i]) {
        feedback[i] = 'green';
        targetLetters[i] = null; // Mark as used
      }
    }

    // Second pass: mark yellows
    for (let i = 0; i < 5; i++) {
      if (feedback[i] !== 'green') {
        const letterIndex = targetLetters.indexOf(guessLetters[i]);
        if (letterIndex !== -1) {
          feedback[i] = 'yellow';
          targetLetters[letterIndex] = null; // Mark as used
        }
      }
    }

    return feedback;
  }

  getPlayerState(playerId) {
    const player = this.players[playerId];
    if (!player) return null;

    return {
      name: player.name,
      guesses: player.guesses,
      gameStatus: player.gameStatus,
      guessesLeft: 6 - player.guesses.length,
    };
  }

  getAllPlayersState() {
    const playersState = {};
    Object.keys(this.players).forEach(playerId => {
      playersState[playerId] = this.getPlayerState(playerId);
    });
    return playersState;
  }

  finalize() {
    return {
      roomId: this.roomId,
      gameStatus: this.gameStatus,
      winner: this.winner,
      targetWord: this.targetWord,
      players: this.getAllPlayersState(),
      duration: Date.now() - this.createdAt,
    };
  }
}

export class GameManager {
  constructor() {
    this.rooms = {};
  }

  createRoom(roomId) {
    if (this.rooms[roomId]) {
      throw new Error('Room already exists');
    }
    this.rooms[roomId] = new GameRoom(roomId);
    return this.rooms[roomId];
  }

  getRoom(roomId) {
    return this.rooms[roomId] || null;
  }

  deleteRoom(roomId) {
    delete this.rooms[roomId];
  }

  getRoomsList() {
    return Object.values(this.rooms).map(room => ({
      roomId: room.roomId,
      playerCount: Object.keys(room.players).length,
      gameStatus: room.gameStatus,
    }));
  }
}
