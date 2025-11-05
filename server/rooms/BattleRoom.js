const { Room } = require("colyseus");
const { BattleState, Player } = require("../schema/BattleState");
const charactersData = require("../character.json");

const GUARD_WINDOW_START = 500; // 0.5 seconds
const JOIN_TIMEOUT = 60000; // 60 seconds
const AI_REACTION_TIME = 300; // AI reacts within 300ms

class BattleRoom extends Room {
  onCreate(options) {
    this.setState(new BattleState());
    this.maxClients = 2;
    this.joinTimeout = null;
    this.aiInterval = null;

    console.log("BattleRoom created:", this.roomId);

    // Handle player actions
    this.onMessage("selectCharacter", (client, message) => {
      const player = this.state.players.get(client.sessionId);
      if (player) {
        player.characterId = message.characterId;
        
        // Load character stats
        const charData = charactersData.characters.find(c => c.id === message.characterId);
        if (charData) {
          player.hp = charData.HP;
          player.maxHp = charData.HP;
          player.attack = charData.attack;
          player.defense = charData.defense;
          player.speed = charData.speed;
        }
        
        player.isReady = true;
        this.broadcast("message", { text: `Player selected ${charData.name}` });
        this.checkGameStart();
      }
    });

    this.onMessage("attack", (client) => {
      this.handleAttack(client.sessionId);
    });

    this.onMessage("guard", (client) => {
      this.handleGuard(client.sessionId);
    });
  }

  onJoin(client, options) {
    console.log(client.sessionId, "joined!");
    
    const player = new Player(client.sessionId, options.characterId || 0);
    this.state.players.set(client.sessionId, player);

    // If this is the first player, start countdown timer
    if (this.state.players.size === 1 && !this.state.countdownStarted) {
      this.state.countdownStarted = true;
      this.state.message = "Waiting for opponent... (60s)";
      
      const startTime = Date.now();
      const countdownInterval = this.clock.setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.ceil((JOIN_TIMEOUT - elapsed) / 1000);
        
        if (remaining > 0 && this.state.players.size === 1) {
          this.state.message = `Waiting for opponent... (${remaining}s)`;
        } else {
          countdownInterval.clear();
        }
      }, 1000);
      
      this.joinTimeout = this.clock.setTimeout(() => {
        countdownInterval.clear();
        if (this.state.players.size === 1 && !this.state.gameStarted) {
          // Add AI player
          this.addAIPlayer();
          this.checkGameStart();
        }
      }, JOIN_TIMEOUT);
    }

    // If second player joins, cancel timeout and start game
    if (this.state.players.size === 2) {
      if (this.joinTimeout) {
        this.joinTimeout.clear();
        this.joinTimeout = null;
      }
      this.checkGameStart();
    }
  }

  onLeave(client, consented) {
    console.log(client.sessionId, "left!");
    
    const leavingPlayer = this.state.players.get(client.sessionId);
    
    if (this.state.gameStarted && !this.state.gameOver && leavingPlayer && !leavingPlayer.isAI) {
      // Player left during game - other player wins
      this.state.players.forEach((player, sessionId) => {
        if (sessionId !== client.sessionId) {
          this.state.winner = sessionId;
          this.state.gameOver = true;
          this.state.message = "Opponent left. You win!";
        }
      });
    }
    
    this.state.players.delete(client.sessionId);
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
    if (this.joinTimeout) {
      this.joinTimeout.clear();
    }
    if (this.aiInterval) {
      this.aiInterval.clear();
    }
  }

  addAIPlayer() {
    const aiSessionId = "AI_PLAYER";
    const aiCharacterId = Math.floor(Math.random() * 8);
    const aiPlayer = new Player(aiSessionId, aiCharacterId);
    
    // Load AI character stats
    const charData = charactersData.characters.find(c => c.id === aiCharacterId);
    if (charData) {
      aiPlayer.hp = charData.HP;
      aiPlayer.maxHp = charData.HP;
      aiPlayer.attack = charData.attack;
      aiPlayer.defense = charData.defense;
      aiPlayer.speed = charData.speed;
    }
    
    aiPlayer.isAI = true;
    aiPlayer.isReady = true;
    this.state.players.set(aiSessionId, aiPlayer);
    this.state.message = "AI opponent joined!";
    console.log("AI player added");
  }

  checkGameStart() {
    const playerArray = Array.from(this.state.players.values());
    
    if (playerArray.length === 2 && playerArray.every(p => p.isReady)) {
      this.state.waitingForPlayers = false;
      this.state.gameStarted = true;
      this.state.message = "Battle Start!";
      this.state.turnStartTime = Date.now();
      
      // Start AI decision loop if there's an AI player
      const hasAI = playerArray.some(p => p.isAI);
      if (hasAI) {
        this.startAILoop();
      }
      
      this.broadcast("gameStart", {});
      console.log("Game started!");
    }
  }

  startAILoop() {
    // AI makes decisions every 600ms
    this.aiInterval = this.clock.setInterval(() => {
      if (this.state.gameOver) {
        this.aiInterval.clear();
        return;
      }

      const aiPlayer = Array.from(this.state.players.entries()).find(([_, p]) => p.isAI);
      if (!aiPlayer) return;

      const [aiSessionId, ai] = aiPlayer;
      const humanPlayer = Array.from(this.state.players.entries()).find(([_, p]) => !p.isAI);
      if (!humanPlayer) return;

      const [_, human] = humanPlayer;

      // AI logic: 60% chance to guard if opponent might attack, 40% to attack
      const timeSinceHumanAction = Date.now() - human.lastActionTime;
      
      if (timeSinceHumanAction < 400 && human.lastAction === "attack") {
        // Human attacked recently, try to attack back
        if (Math.random() > 0.3) {
          this.handleAttack(aiSessionId);
        } else {
          this.handleGuard(aiSessionId);
        }
      } else {
        // Random decision
        if (Math.random() > 0.5) {
          this.handleAttack(aiSessionId);
        } else {
          this.handleGuard(aiSessionId);
        }
      }
    }, 600);
  }

  handleAttack(sessionId) {
    if (this.state.gameOver || !this.state.gameStarted) return;

    const attacker = this.state.players.get(sessionId);
    if (!attacker) return;

    attacker.lastAction = "attack";
    attacker.lastActionTime = Date.now();
    attacker.isGuarding = false;

    // Find opponent
    const opponent = Array.from(this.state.players.values()).find(
      p => p.sessionId !== sessionId
    );

    if (!opponent) return;

    // Check if opponent is guarding
    const opponentGuardTime = attacker.lastActionTime - opponent.lastActionTime;
    
    // Calculate if guard was successful based on speed
    const guardWindow = GUARD_WINDOW_START + (opponent.speed * 10); // Speed affects guard window
    const guardSuccess = opponent.lastAction === "guard" && 
                        opponentGuardTime < guardWindow && 
                        opponentGuardTime > 0;
    
    if (guardSuccess) {
      // Opponent guarded successfully - reduced damage based on defense
      const blockReduction = opponent.defense * 0.5;
      const reducedDamage = Math.max(1, Math.floor(attacker.attack * 0.3 - blockReduction));
      opponent.hp = Math.max(0, opponent.hp - reducedDamage);
      
      this.state.message = `${sessionId} attacked, but ${opponent.sessionId} blocked! (${reducedDamage} damage)`;
      this.broadcast("action", {
        attacker: sessionId,
        defender: opponent.sessionId,
        action: "attack",
        success: false,
        damage: reducedDamage,
        blocked: true
      });
    } else {
      // Attack successful - calculate damage
      const baseDamage = attacker.attack;
      const defenseReduction = opponent.defense * 0.3;
      const finalDamage = Math.max(5, Math.floor(baseDamage - defenseReduction));
      
      opponent.hp = Math.max(0, opponent.hp - finalDamage);
      this.state.message = `${sessionId} attacked ${opponent.sessionId} for ${finalDamage} damage!`;
      
      this.broadcast("action", {
        attacker: sessionId,
        defender: opponent.sessionId,
        action: "attack",
        success: true,
        damage: finalDamage
      });
    }

    // Check win condition
    if (opponent.hp <= 0) {
      this.state.gameOver = true;
      this.state.winner = sessionId;
      this.state.message = `${sessionId} wins!`;
      this.broadcast("gameOver", { winner: sessionId });
      
      if (this.aiInterval) {
        this.aiInterval.clear();
      }
      
      // Disconnect all clients and dispose room after a delay
      this.clock.setTimeout(() => {
        console.log("Game over - disposing room", this.roomId);
        this.disconnect();
      }, 5000); // 5 seconds delay to allow players to see the result
    }
  }

  handleGuard(sessionId) {
    if (this.state.gameOver || !this.state.gameStarted) return;

    const player = this.state.players.get(sessionId);
    if (!player) return;

    player.lastAction = "guard";
    player.lastActionTime = Date.now();
    player.isGuarding = true;

    this.broadcast("action", {
      player: sessionId,
      action: "guard"
    });

    // Reset guard after a short time
    this.clock.setTimeout(() => {
      if (player) {
        player.isGuarding = false;
      }
    }, 1000);
  }
}

module.exports = BattleRoom;
