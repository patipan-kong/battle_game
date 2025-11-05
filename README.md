# Battle Game
A multiplayer battle game built with Colyseus and HTML5

## Play Demo 
- https://battle-game-client.onrender.com/

## 🌟 Features
- **Character Selection**: Choose from 8 unique characters Like Street Fighter
- **Multiple Game Modes**: 
  - Single Player mode for practice, Play battle game with CPU
  - Multiplayer mode for up to 2 players
  - Auto Join existing games and wait for other player to join in 60 seconds, if no one join , game will be start and play will ai player
- **Interactive Tutorial**: Built-in "How to Play" guide
- **Real-time Gameplay**: 
  - Real time battle with 2 action (attack or guard)
  - Player will have full HP at begining
  - If player attack successfully, the other player 's HP will decrease.
  - attack will successfully if the other player cannot guard before 0.5s or after 0.5s
  - Player with 0 HP will defeat, and other player will win
  - Attack and Block is a button on player screen
- **Responsive Design**: Works on desktop and mobile devices

## 🌟 Technology Stack

### Frontend
- **Colyseus.js**: Real-time multiplayer client for seamless networking
- **HTML5/CSS3**: Responsive design with modern UI/UX
- **JavaScript (ES6+)**: Modern vanilla JavaScript with async/await

### Backend  
- **Colyseus**: Authoritative multiplayer game server
- **Node.js**: Server runtime environment
- **Express**: Web server framework
- **@colyseus/schema**: State synchronization

### Data Management
- **JSON Configuration**: Character data and game settings
- **Real-time State**: Synchronized game state across all clients

## 🚀 Quick Start

### Prerequisites
- Node.js (v14+ recommended)
- npm or yarn

### Installation

1. **Clone or download the repository**
2. **Run the installation script:**
   ```bash
   # On Windows
   install.bat
   
   # On Mac/Linux
   chmod +x install.sh && ./install.sh
   ```

### Running the Game

1. **Start the server:**
   ```bash
   # On Windows
   start-server.bat
   
   # On Mac/Linux  
   cd server && npm start
   ```

2. **Start the client (in a new terminal):**
   ```bash
   # On Windows
   start-client.bat
   
   # On Mac/Linux
   cd client && npm start
   ```

3. **Open your browser and go to:**
   ```
   http://localhost:3000
   ```
4. **Change server url, If want to use your own server**
   ```
   from
   // const currentHostname = location.hostname;
   // const url = `ws://${currentHostname}:2567`;        
   const url = `https://battle-game-serv.onrender.com`;
   to
   const currentHostname = location.hostname;
   const url = `ws://${currentHostname}:2567`;        
   // const url = `https://battle-game-serv.onrender.com`;
   ```
## 🎮 How to Play

### Game Setup
1. Choose your character from 8 available options
2. Join room and wating other player for 60 seconds. If no anyone join room, game will be start with ai player

### Gameplay
- Players will press attack or guard button
- Player will have full HP at begining.
- If player attack successfully, the other player's HP will decrease.
- attack will successfully if the other player cannot guard before 0.5s or after 0.5s
- Player with 0 HP will defeat, and other player will win

### Multiplayer Features
- Up to 2 players can play together
- auto join room within 60 seconds
- Real-time synchronization of all game actions

## 🎯 Game Rules

1. **Objective**: defeat opponent to 0 HP
2. **Action**: Attack or Guard
3. **Turn Order**: Players alternate turns automatically  
4. **Winning**: Player who attack other player to 0 HP

## 📝 License

MIT License - Feel free to modify and distribute!
