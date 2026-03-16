# Multiplayer Wordle

A real-time multiplayer Wordle game where two players compete to solve the same puzzle first.

## Features

- 🎮 Real-time multiplayer gameplay via WebSockets
- 📱 Mobile-friendly responsive design
- 🎨 Animated tile flips and keyboard feedback
- 🔗 Shareable room codes
- 👀 Live opponent board updates
- ⌨️ Virtual keyboard with color feedback

## Project Structure

```
wordle/
├── backend/          # Node.js + Express + Socket.IO
│   └── src/
│       ├── server.js         # Main Express server
│       ├── game.js           # Game logic & Wordle rules
│       ├── words.js          # Word list & validation
│       └── socketHandlers.js # Socket.IO event handlers
├── frontend/         # React + Vite + TailwindCSS
│   └── src/
│       ├── components/       # Reusable components
│       ├── pages/           # Page components
│       ├── App.jsx          # Main app
│       ├── socket.js        # Socket.IO client setup
│       └── utils.js         # Helper functions
└── README.md
```

## Quick Start (Local Development)

### Prerequisites
- Node.js 18+ ([Download](https://nodejs.org))
- npm or yarn (comes with Node.js)
- Git (optional, for version control)

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file (optional, defaults should work)
cp .env.example .env

# Start development server
npm run dev
```

Backend will run on `http://localhost:3001` - you should see:
```
🎮 Wordle server running on port 3001
📝 Environment: development
🔗 WebSocket ready at ws://localhost:3001
```

### 2. Frontend Setup (in a new terminal)

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env file (optional, defaults should work)
cp .env.example .env

# Start development server
npm run dev
```

Frontend will run on `http://localhost:5173` - you should see:
```
  ➜  Local:   http://localhost:5173/
```

### 3. Test Locally

1. Open `http://localhost:5173` in your browser
2. Enter your name and click "Create New Game"
3. Copy the room code
4. **Open the same URL in a second browser window (or use Incognito mode)**
5. Enter a different name and paste the room code, then "Join Game"
6. Game will start automatically when both players connect!

**Tip:** Use Chrome DevTools to simulate a mobile view: Press `F12` → Click device toggle (top-left)

### Troubleshooting

**Backend won't start:**
- Make sure port 3001 isn't in use: `lsof -i :3001`
- Kill any process using it: `kill -9 <PID>`

**Frontend can't connect to backend:**
- Ensure backend is running on `http://localhost:3001`
- Check browser console (F12) for WebSocket errors
- Verify `.env` has correct `VITE_SOCKET_URL`

**Changes not appearing:**
- Clear browser cache (Cmd+Shift+Delete on Chrome)
- Restart dev servers sometimes helps

## Deployment

### Option A: Vercel (Frontend) + Render (Backend) - **RECOMMENDED**

This approach keeps frontend and backend separate, allowing independent scaling and fast frontend CDN.

**Step 1: Deploy Backend to Render**

1. Push your code to GitHub (create a GitHub repo)
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/wordle.git
   git push -u origin main
   ```

2. Go to [Render.com](https://render.com) and sign up with GitHub
3. Create a **New Web Service**
   - Select your GitHub repo
   - Choose `backend` as the root directory (under "Root Directory")
   - Name: `wordle-backend`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Add Environment Variable:
     - Key: `NODE_ENV`
     - Value: `production`

4. Click Deploy - wait ~2-3 minutes
5. Copy your backend URL (e.g., `https://wordle-backend.onrender.com`)
6. Note: Render free tier will sleep after 15 mins of inactivity - consider upgrading for production

**Step 2: Deploy Frontend to Vercel**

1. Go to [Vercel.com](https://vercel.com) and sign up with GitHub
2. Click "New Project" → Import your GitHub repo
3. Configure:
   - Framework: `Vite`
   - Root Directory: `./frontend`
   - Build Command: `npm install && npm run build`
   - Output Directory: `dist`

4. Add Environment Variable:
   - Key: `VITE_SOCKET_URL`
   - Value: `https://wordle-backend.onrender.com`
   (Use the URL from your deployed backend)

5. Click Deploy - takes ~1-2 minutes
6. Your app is live! Share the Vercel URL with others

**Test Remote Deployment:**
- Open your Vercel URL in two browser windows
- Create and join games across the network

### Option B: Single Render Instance (Simpler, Slower)

Deploy everything on one server. This is simpler but frontend won't use CDN.

**Step 1: Build Frontend & Prepare Backend**

```bash
# Build frontend
cd frontend
npm install
npm run build

# Copy dist folder to backend
cp -r dist ../backend/public
cd ../backend
```

**Step 2: Update Backend (server.js)**

The backend already handles this! The code checks for `NODE_ENV=production` and serves static files from `public/`.

**Step 3: Deploy to Render**

1. Go to [Render.com](https://render.com)
2. Create a **New Web Service**
   - Select your GitHub repo
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Add Environment Variable: `NODE_ENV=production`

3. Deploy - your app runs at the Render URL

### Recommended: Option A (Vercel + Render)

- ✅ Frontend on global CDN (faster everywhere)
- ✅ Independent scaling
- ✅ Free Vercel plan with unlimited deployments
- ✅ Easy to update either part separately
- ⚠️ Free Render tier sleeps after 15 mins (pay $7/mo for always-on)

## Game Flow

1. Player A creates a room → gets room code
2. Player A shares room code with Player B
3. Player B joins with room code
4. Game starts when both players connected
5. Server picks random 5-letter word
6. Players make guesses independently
7. Real-time board updates for both
8. Winner is first to solve (or draw if both fail)

## Tech Stack

- **Frontend**: React 18 + Vite + TailwindCSS
- **Backend**: Node.js + Express + Socket.IO
- **Real-time**: WebSockets via Socket.IO
- **Styling**: TailwindCSS with responsive design

## Environment Variables

**Backend (.env):**
```
PORT=3001
NODE_ENV=development
```

**Frontend (.env):**
```
VITE_SOCKET_URL=http://localhost:3001
```

## Socket.IO Events

### Client → Server
- `create_room` - Create new game room
- `join_room` - Join existing room
- `submit_guess` - Send guess to server
- `disconnect` - Player left

### Server → Client
- `room_created` - Room successfully created
- `room_joined` - Player successfully joined
- `game_started` - Both players ready, game begins
- `guess_received` - Opponent made a guess
- `game_over` - Someone won or draw
- `player_disconnected` - Opponent disconnected

## Rules

- Standard Wordle rules: 6 guesses, 5-letter words
- Green: correct letter, correct position
- Yellow: correct letter, wrong position
- Gray: letter not in word
- First to solve wins; draw if both fail

## File Descriptions

### Backend Files

**backend/src/server.js**
- Express server initialization with Socket.IO
- Serves static frontend files in production
- Sets up CORS for frontend requests
- Health check endpoint at `/health`

**backend/src/game.js**
- Core Wordle logic and game rules
- `GameRoom` class: manages player state, guesses, and game status
- `GameManager` class: handles multiple rooms
- `getGuesseFeedback()`: implements color logic (green/yellow/gray)

**backend/src/words.js**
- Word list of 5-letter words
- `getRandomWord()`: picks random word for game
- `isValidWord()`: validates user guesses
- `normalizeWord()`: standardizes input to uppercase

**backend/src/socketHandlers.js**
- Socket.IO event handlers for all messages
- `create_room`: Generate room code and add player
- `join_room`: Add player to existing room, start if full
- `submit_guess`: Process guess, check for win/loss
- Handles disconnects and room cleanup

### Frontend Files

**frontend/src/App.jsx**
- Main React component that switches between Home and Game pages
- Manages app state (current page, game info)

**frontend/src/pages/Home.jsx**
- Landing page with room creation and join forms
- Validates player name and room code
- Emits Socket.IO `create_room` and `join_room` events

**frontend/src/pages/Game.jsx**
- Main game page showing both players' boards
- Listens to `board_updated` and `game_over` events
- Handles keyboard input and guess submission
- Shows game status, room code, and results modal

**frontend/src/components/GameBoard.jsx**
- Displays 6x5 grid of letter tiles
- Shows completed guesses with color feedback
- Shows current guess being typed
- Animated tile colors (green/yellow/gray)

**frontend/src/components/Keyboard.jsx**
- Virtual on-screen keyboard with QWERTY layout
- Letter keys change color based on feedback
- ENTER and BACKSPACE buttons

**frontend/src/components/RoomCode.jsx**
- Shows room code with copy-to-clipboard button
- Displays player count (X/2)

**frontend/src/components/GameStatus.jsx**
- Shows game state (waiting, in progress, won, draw)
- Color-coded status messages
- Displayed above game boards

**frontend/src/socket.js**
- Socket.IO client initialization
- Connects to backend via `VITE_SOCKET_URL`
- Auto-reconnect settings

**frontend/src/utils.js**
- Helper functions for color mapping
- Keyboard layout constants
- Copy to clipboard utility
- Letter state names (green/yellow/gray)