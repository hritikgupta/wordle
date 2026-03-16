import { GameManager } from './game.js';

const gameManager = new GameManager();

function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Create a new game room
    socket.on('create_room', (data, callback) => {
      try {
        const roomCode = generateRoomCode();
        const room = gameManager.createRoom(roomCode);
        room.addPlayer(socket.id, data.playerName || 'Player 1');

        socket.join(roomCode);
        socket.roomCode = roomCode;
        socket.playerId = socket.id;

        console.log(`Room created: ${roomCode} by ${socket.id}`);

        callback({
          success: true,
          roomCode,
          message: 'Room created successfully',
        });

        // Notify room that a player joined
        io.to(roomCode).emit('room_updated', {
          roomCode,
          players: room.getAllPlayersState(),
          playerCount: Object.keys(room.players).length,
        });
      } catch (error) {
        callback({ success: false, error: error.message });
      }
    });

    // Join an existing game room
    socket.on('join_room', (data, callback) => {
      try {
        const roomCode = data.roomCode.toUpperCase();
        const room = gameManager.getRoom(roomCode);

        if (!room) {
          callback({ success: false, error: 'Room not found' });
          return;
        }

        if (Object.keys(room.players).length >= 2) {
          callback({ success: false, error: 'Room is full' });
          return;
        }

        room.addPlayer(socket.id, data.playerName || 'Player 2');
        socket.join(roomCode);
        socket.roomCode = roomCode;
        socket.playerId = socket.id;

        console.log(`Player joined room ${roomCode}: ${socket.id}`);

        callback({
          success: true,
          roomCode,
          message: 'Joined room successfully',
        });

        // Notify all players in the room
        const updatedRoom = gameManager.getRoom(roomCode);
        io.to(roomCode).emit('room_updated', {
          roomCode,
          players: updatedRoom.getAllPlayersState(),
          playerCount: Object.keys(updatedRoom.players).length,
        });

        // If room is full, automatically start game
        if (updatedRoom.hasEnoughPlayers()) {
          updatedRoom.startGame();
          io.to(roomCode).emit('game_started', {
            roomCode,
            players: updatedRoom.getAllPlayersState(),
            message: 'Game started! Both players connected.',
          });
        }
      } catch (error) {
        callback({ success: false, error: error.message });
      }
    });

    // Submit a guess
    socket.on('submit_guess', (data, callback) => {
      try {
        const room = gameManager.getRoom(socket.roomCode);
        if (!room) {
          callback({ success: false, error: 'Room not found' });
          return;
        }

        const result = room.submitGuess(socket.playerId, data.guess);

        callback({
          success: true,
          result,
          guessesLeft: room.players[socket.playerId].guesses.length,
        });

        // Send updated board to all players in room
        io.to(socket.roomCode).emit('board_updated', {
          roomCode: socket.roomCode,
          players: room.getAllPlayersState(),
        });

        // Check if game is over
        if (room.gameStatus === 'won') {
          io.to(socket.roomCode).emit('game_over', {
            roomCode: socket.roomCode,
            gameStatus: room.gameStatus,
            winner: room.winner,
            wordWas: room.targetWord,
            players: room.getAllPlayersState(),
          });
        }

        if (room.gameStatus === 'draw') {
          io.to(socket.roomCode).emit('game_over', {
            roomCode: socket.roomCode,
            gameStatus: room.gameStatus,
            winner: null,
            wordWas: room.targetWord,
            players: room.getAllPlayersState(),
          });
        }
      } catch (error) {
        callback({ success: false, error: error.message });
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);

      if (socket.roomCode) {
        const room = gameManager.getRoom(socket.roomCode);
        if (room) {
          const isEmpty = room.removePlayer(socket.id);

          // Notify remaining players
          if (!isEmpty) {
            io.to(socket.roomCode).emit('player_disconnected', {
              roomCode: socket.roomCode,
              playerId: socket.id,
              message: 'Opponent disconnected',
              players: room.getAllPlayersState(),
            });
          } else {
            // Delete room if empty
            gameManager.deleteRoom(socket.roomCode);
          }
        }
      }
    });
  });
}
