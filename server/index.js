const { Server } = require("colyseus");
const { createServer } = require("http");
const express = require("express");
const cors = require("cors");
const BattleRoom = require("./rooms/BattleRoom");

const port = Number(process.env.PORT || 2567);
const host = process.env.HOST || "localhost";
const app = express();

app.use(cors());
app.use(express.json());

// Serve character data
app.get("/characters", (req, res) => {
  const characters = require("./character.json");
  res.json(characters);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const gameServer = new Server({
  server: createServer(app),
});

// Register BattleRoom
gameServer.define("battle_room", BattleRoom);

gameServer.listen(port);

console.log(`🎮 Roll and Move Game Server is running on http://${host}:${port}`);
console.log(`📊 Monitor: http://${host}:${port}/colyseus`);
