# Battle Game - Quick Start Guide

## What Was Built

A fully functional multiplayer battle game with:

### ✅ Server (Colyseus-based)
- **Location**: `server/` directory
- **Game Room**: Manages multiplayer battles with real-time state synchronization
- **AI Player**: Automatically added if no opponent joins within 60 seconds
- **Battle Mechanics**: 
  - Attack/Guard system with 0.5s timing window
  - 10 HP damage per successful hit
  - Win condition: Reduce opponent to 0 HP

### ✅ Client (HTML5/JavaScript)
- **Location**: `client/public/` directory
- **Features**:
  - Main menu with "Play Game" and "How to Play"
  - Character selection (8 unique characters)
  - Real-time battle interface with HP bars
  - Attack and Guard buttons
  - Game over screen with victory/defeat messages
  - Responsive design for desktop and mobile

## 🚀 How to Run

### Option 1: Using the installation scripts (Recommended)

1. **Install dependencies**:
   ```bash
   install.bat
   ```

2. **Start the server** (in first terminal):
   ```bash
   start-server.bat
   ```

3. **Start the client** (in second terminal):
   ```bash
   start-client.bat
   ```

4. **Play the game**:
   - Open your browser to `http://localhost:3000`
   - To play with a friend, open another browser window to the same URL

### Option 2: Manual installation

1. **Install server dependencies**:
   ```bash
   cd server
   npm install
   ```

2. **Install client dependencies**:
   ```bash
   cd ../client
   npm install
   ```

3. **Run server**:
   ```bash
   cd server
   npm start
   ```

4. **Run client** (new terminal):
   ```bash
   cd client
   npm start
   ```

## 📁 Project Structure

```
battle_game/
├── server/
│   ├── index.js              # Server entry point
│   ├── package.json
│   ├── schema/
│   │   └── BattleState.js    # Game state schema
│   └── rooms/
│       └── BattleRoom.js     # Game room logic
├── client/
│   ├── server.js             # Static file server
│   ├── package.json
│   └── public/
│       ├── index.html        # Main HTML
│       ├── styles.css        # Styling
│       └── game.js           # Game logic
├── install.bat               # Windows installation
├── start-server.bat          # Start server (Windows)
├── start-client.bat          # Start client (Windows)
├── install.sh                # Linux/Mac installation
└── README.md                 # Original requirements

```

## 🎮 How to Play

1. **Choose Character**: Select from 8 unique fighters
2. **Wait for Opponent**: Game waits 60 seconds for another player, then adds AI
3. **Battle**:
   - Press **ATTACK** to deal 10 damage (if opponent doesn't guard in time)
   - Press **GUARD** to block incoming attacks within 0.5s window
4. **Win**: First player to reduce opponent's HP to 0 wins!

## 🔧 Configuration

To use your own server instead of localhost:

Edit `client/public/game.js` (lines 18-21):

```javascript
// For local development
const currentHostname = location.hostname;
const url = `ws://${currentHostname}:2567`;

// For production (uncomment and modify)
// const url = `wss://your-server-url.com`;
```

## 🌐 Multiplayer Testing

To test multiplayer locally:
1. Start server and client
2. Open `http://localhost:3000` in two browser windows
3. Select characters in both windows
4. Play against yourself or a friend!

## 📝 Technologies Used

- **Backend**: Node.js, Colyseus, Express
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Real-time**: Colyseus WebSocket protocol
- **State Management**: @colyseus/schema

## 🐛 Troubleshooting

**Port already in use?**
- Server runs on port 2567
- Client runs on port 3000
- Make sure these ports are available

**Can't connect to server?**
- Ensure server is running first
- Check firewall settings
- Verify the URL in `game.js` matches your server

**Dependencies not installing?**
- Make sure Node.js v14+ is installed
- Try deleting `node_modules` and running `npm install` again

Enjoy your Battle Game! 🎮⚔️
