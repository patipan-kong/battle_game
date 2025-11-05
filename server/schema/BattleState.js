const { Schema, type, MapSchema } = require("@colyseus/schema");

class Player extends Schema {
  constructor(sessionId, characterId) {
    super();
    this.sessionId = sessionId;
    this.characterId = characterId || 0;
    this.hp = 100;
    this.maxHp = 100;
    this.attack = 10;
    this.defense = 5;
    this.speed = 5;
    this.isReady = false;
    this.lastAction = "";
    this.lastActionTime = 0;
    this.isGuarding = false;
    this.isAI = false;
  }
}

type("string")(Player.prototype, "sessionId");
type("number")(Player.prototype, "characterId");
type("number")(Player.prototype, "hp");
type("number")(Player.prototype, "maxHp");
type("number")(Player.prototype, "attack");
type("number")(Player.prototype, "defense");
type("number")(Player.prototype, "speed");
type("boolean")(Player.prototype, "isReady");
type("string")(Player.prototype, "lastAction");
type("number")(Player.prototype, "lastActionTime");
type("boolean")(Player.prototype, "isGuarding");
type("boolean")(Player.prototype, "isAI");

class BattleState extends Schema {
  constructor() {
    super();
    this.players = new MapSchema();
    this.gameStarted = false;
    this.gameOver = false;
    this.winner = "";
    this.currentTurn = 0;
    this.turnStartTime = 0;
    this.waitingForPlayers = true;
    this.countdownStarted = false;
    this.message = "";
  }
}

type({ map: Player })(BattleState.prototype, "players");
type("boolean")(BattleState.prototype, "gameStarted");
type("boolean")(BattleState.prototype, "gameOver");
type("string")(BattleState.prototype, "winner");
type("number")(BattleState.prototype, "currentTurn");
type("number")(BattleState.prototype, "turnStartTime");
type("boolean")(BattleState.prototype, "waitingForPlayers");
type("boolean")(BattleState.prototype, "countdownStarted");
type("string")(BattleState.prototype, "message");

module.exports = { BattleState, Player };
