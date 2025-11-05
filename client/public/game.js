// Character data - will be loaded from server
let characters = [];

// Game state
let room = null;
let mySessionId = null;
let selectedCharacterId = null;

// Server configuration
const currentHostname = location.hostname;
const url = window.wsUrl;
const httpUrl = window.serverUrl;

const client = new Colyseus.Client(url);

// Screen elements
const screens = {
    mainMenu: document.getElementById('mainMenu'),
    howToPlay: document.getElementById('howToPlay'),
    characterSelect: document.getElementById('characterSelect'),
    battleScreen: document.getElementById('battleScreen'),
    gameOver: document.getElementById('gameOver')
};

// Button elements
const playBtn = document.getElementById('playBtn');
const howToPlayBtn = document.getElementById('howToPlayBtn');
const backToMenuBtn = document.getElementById('backToMenuBtn');
const playAgainBtn = document.getElementById('playAgainBtn');
const attackBtn = document.getElementById('attackBtn');
const guardBtn = document.getElementById('guardBtn');

// Battle screen elements
const statusMessage = document.getElementById('statusMessage');
const player1Character = document.getElementById('player1Character');
const player2Character = document.getElementById('player2Character');
const player1Name = document.getElementById('player1Name');
const player2Name = document.getElementById('player2Name');
const player1HP = document.getElementById('player1HP');
const player2HP = document.getElementById('player2HP');
const player1HPText = document.getElementById('player1HPText');
const player2HPText = document.getElementById('player2HPText');
const player1MaxHP = document.getElementById('player1MaxHP');
const player2MaxHP = document.getElementById('player2MaxHP');
const player1Attack = document.getElementById('player1Attack');
const player2Attack = document.getElementById('player2Attack');
const player1Defense = document.getElementById('player1Defense');
const player2Defense = document.getElementById('player2Defense');
const player1Speed = document.getElementById('player1Speed');
const player2Speed = document.getElementById('player2Speed');
const player1Action = document.getElementById('player1Action');
const player2Action = document.getElementById('player2Action');

// Initialize
init();

async function init() {
    // Load characters from server
    await loadCharacters();
    
    playBtn.addEventListener('click', () => showScreen('characterSelect'));
    howToPlayBtn.addEventListener('click', () => showScreen('howToPlay'));
    backToMenuBtn.addEventListener('click', () => showScreen('mainMenu'));
    playAgainBtn.addEventListener('click', resetGame);
    
    attackBtn.addEventListener('click', handleAttack);
    guardBtn.addEventListener('click', handleGuard);
}

async function loadCharacters() {
    try {
        const response = await fetch(`${httpUrl}/characters`);
        const data = await response.json();
        characters = data.characters;
        renderCharacterSelection();
    } catch (error) {
        console.error('Failed to load characters:', error);
        // Fallback to default characters
        characters = [
            { id: 0, name: 'Warrior', icon: '⚔️', HP: 100, attack: 15, defense: 10, speed: 5 },
            { id: 1, name: 'Ninja', icon: '🥷', HP: 80, attack: 20, defense: 5, speed: 10 },
            { id: 2, name: 'Mage', icon: '🧙', HP: 70, attack: 25, defense: 5, speed: 7 },
            { id: 3, name: 'Archer', icon: '🏹', HP: 90, attack: 18, defense: 8, speed: 9 },
            { id: 4, name: 'Knight', icon: '🛡️', HP: 120, attack: 12, defense: 15, speed: 4 },
            { id: 5, name: 'Assassin', icon: '🗡️', HP: 75, attack: 22, defense: 6, speed: 11 },
            { id: 6, name: 'Samurai', icon: '⚡', HP: 85, attack: 20, defense: 7, speed: 9 },
            { id: 7, name: 'Viking', icon: '🪓', HP: 110, attack: 14, defense: 12, speed: 5 }
        ];
        renderCharacterSelection();
    }
}

function showScreen(screenName) {
    Object.values(screens).forEach(screen => screen.classList.remove('active'));
    screens[screenName].classList.add('active');
}

function renderCharacterSelection() {
    const grid = document.getElementById('characterGrid');
    grid.innerHTML = '';
    
    characters.forEach(char => {
        const card = document.createElement('div');
        card.className = 'character-card';
        card.innerHTML = `
            <div class="character-icon">${char.icon}</div>
            <div class="character-name">${char.name}</div>
            <div class="character-stats">
                <div class="stat-item">
                    <span class="stat-label">❤️</span>
                    <span class="stat-value">${char.HP}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">⚔️</span>
                    <span class="stat-value">${char.attack}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">🛡️</span>
                    <span class="stat-value">${char.defense}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">⚡</span>
                    <span class="stat-value">${char.speed}</span>
                </div>
            </div>
        `;
        card.addEventListener('click', () => selectCharacter(char.id));
        grid.appendChild(card);
    });
}

async function selectCharacter(characterId) {
    selectedCharacterId = characterId;
    
    try {
        // Join or create a room
        room = await client.joinOrCreate('battle_room', { characterId });
        mySessionId = room.sessionId;
        
        console.log('Joined room:', room.roomId);
        
        // Setup room listeners
        setupRoomListeners();
        
        // Send character selection
        room.send('selectCharacter', { characterId });
        
        // Show battle screen
        showScreen('battleScreen');
        updateStatusMessage('Waiting for opponent...');
        
        // Disable action buttons until game starts
        disableActionButtons();
        
    } catch (e) {
        console.error('Failed to join room:', e);
        alert('Failed to connect to server. Please try again.');
        showScreen('mainMenu');
    }
}

function setupRoomListeners() {
    // State change listener
    room.state.players.onAdd((player, sessionId) => {
        console.log('Player added:', sessionId);
        updateBattleScreen();
    });
    
    room.state.players.onChange((player, sessionId) => {
        console.log('Player changed:', sessionId);
        updateBattleScreen();
    });
    
    room.state.onChange(() => {
        updateBattleScreen();
    });
    
    // Message listeners
    room.onMessage('gameStart', () => {
        console.log('Game started!');
        updateStatusMessage('Battle Start!');
        enableActionButtons();
    });
    
    room.onMessage('action', (message) => {
        handleActionMessage(message);
    });
    
    room.onMessage('gameOver', (message) => {
        handleGameOver(message);
    });
    
    room.onMessage('message', (message) => {
        console.log('Server message:', message);
        if (message.text) {
            updateStatusMessage(message.text);
        }
    });
    
    // Handle room disconnect/leave
    room.onLeave((code) => {
        console.log('Left room with code:', code);
    });
    
    room.onError((code, message) => {
        console.error('Room error:', code, message);
    });
}

function updateBattleScreen() {
    const players = Array.from(room.state.players.values());
    
    if (players.length === 0) return;
    
    // Find my player and opponent
    const myPlayer = players.find(p => p.sessionId === mySessionId);
    const opponent = players.find(p => p.sessionId !== mySessionId);
    
    if (myPlayer) {
        // Update my character
        player1Character.textContent = characters[myPlayer.characterId].icon;
        player1Name.textContent = myPlayer.isAI ? 'AI' : 'You';
        
        // Update HP
        const hpPercent = (myPlayer.hp / myPlayer.maxHp) * 100;
        player1HP.style.width = `${hpPercent}%`;
        player1HPText.textContent = myPlayer.hp;
        player1MaxHP.textContent = myPlayer.maxHp;
        
        // Update stats
        player1Attack.textContent = myPlayer.attack;
        player1Defense.textContent = myPlayer.defense;
        player1Speed.textContent = myPlayer.speed;
        
        // Update action indicator
        if (myPlayer.isGuarding) {
            player1Action.textContent = '🛡️ Guarding';
        } else if (myPlayer.lastAction === 'attack') {
            player1Action.textContent = '⚔️ Attacked!';
            setTimeout(() => { player1Action.textContent = ''; }, 1000);
        } else if (myPlayer.lastAction === 'guard') {
            player1Action.textContent = '🛡️ Guard Ready';
            setTimeout(() => { player1Action.textContent = ''; }, 1000);
        } else {
            player1Action.textContent = '';
        }
    }
    
    if (opponent) {
        // Update opponent character
        player2Character.textContent = characters[opponent.characterId].icon;
        player2Name.textContent = opponent.isAI ? 'AI' : 'Opponent';
        
        // Update HP
        const hpPercent = (opponent.hp / opponent.maxHp) * 100;
        player2HP.style.width = `${hpPercent}%`;
        player2HPText.textContent = opponent.hp;
        player2MaxHP.textContent = opponent.maxHp;
        
        // Update stats
        player2Attack.textContent = opponent.attack;
        player2Defense.textContent = opponent.defense;
        player2Speed.textContent = opponent.speed;
        
        // Update action indicator
        if (opponent.isGuarding) {
            player2Action.textContent = '🛡️ Guarding';
        } else if (opponent.lastAction === 'attack') {
            player2Action.textContent = '⚔️ Attacked!';
            setTimeout(() => { player2Action.textContent = ''; }, 1000);
        } else if (opponent.lastAction === 'guard') {
            player2Action.textContent = '🛡️ Guard Ready';
            setTimeout(() => { player2Action.textContent = ''; }, 1000);
        } else {
            player2Action.textContent = '';
        }
    }
    
    // Update status message from game state
    if (room.state.message) {
        updateStatusMessage(room.state.message);
    }
}

function handleActionMessage(message) {
    console.log('Action:', message);
    
    if (message.action === 'attack' && message.success) {
        // Show damage animation
        const targetElement = message.defender === mySessionId ? player1Character : player2Character;
        targetElement.classList.add('shake');
        setTimeout(() => targetElement.classList.remove('shake'), 300);
    }
    
    updateBattleScreen();
}

function handleAttack() {
    if (!room || room.state.gameOver) return;
    
    room.send('attack');
    disableActionButtons(500); // Prevent spam
}

function handleGuard() {
    if (!room || room.state.gameOver) return;
    
    room.send('guard');
    disableActionButtons(500); // Prevent spam
}

function enableActionButtons() {
    attackBtn.disabled = false;
    guardBtn.disabled = false;
}

function disableActionButtons(duration = 0) {
    attackBtn.disabled = true;
    guardBtn.disabled = true;
    
    if (duration > 0) {
        setTimeout(enableActionButtons, duration);
    }
}

function updateStatusMessage(message) {
    statusMessage.textContent = message;
}

function handleGameOver(message) {
    disableActionButtons();
    
    const gameOverTitle = document.getElementById('gameOverTitle');
    const gameOverMessage = document.getElementById('gameOverMessage');
    
    if (message.winner === mySessionId) {
        gameOverTitle.textContent = '🎉 VICTORY! 🎉';
        gameOverMessage.textContent = 'You defeated your opponent!';
    } else {
        gameOverTitle.textContent = '💀 DEFEAT 💀';
        gameOverMessage.textContent = 'You were defeated...';
    }
    
    setTimeout(() => {
        showScreen('gameOver');
    }, 2000);
}

function resetGame() {
    if (room) {
        room.leave();
        room = null;
    }
    
    mySessionId = null;
    selectedCharacterId = null;
    
    // Reset UI
    player1Action.textContent = '';
    player2Action.textContent = '';
    statusMessage.textContent = '';
    
    // Clear opponent character display
    player2Character.textContent = '';
    player2Name.textContent = 'Waiting...';
    player2HP.style.width = '100%';
    player2HPText.textContent = '0';
    player2MaxHP.textContent = '0';
    player2Attack.textContent = '0';
    player2Defense.textContent = '0';
    player2Speed.textContent = '0';
    
    showScreen('mainMenu');
}
