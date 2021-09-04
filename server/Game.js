const uuid = require("uuid").v4;
const NPC = require("./NPC");

module.exports = class Game {
  constructor(io) {
    this.io = io;
    this.gameState = null;

    this.io.on("connection", (socket) => {
      console.log("a user connected");

      let characterId = uuid();
      socket.emit("gameState", this.gameState);
      socket.emit("characterId", characterId);

      socket.on("initGame", this.initGame.bind(this));
      socket.on("addCharacter", this.addCharacter.bind(this));
      socket.on("moveCharacter", this.moveCharacter.bind(this));
      socket.on("disconnect", () => this.disconnect(characterId));
    });
  }

  initGame(msg) {
    this.gameState = msg;
    console.log(this.gameState?.characterList);

    // Spawn two NPCs
    new NPC(this);
    new NPC(this);
    new NPC(this);
    new NPC(this);
    new NPC(this);
    new NPC(this);
    new NPC(this);
    new NPC(this);
    new NPC(this);
    new NPC(this);
  }

  addCharacter(character) {
    console.log("adding a character", character);
    this.gameState.characterList.push(character);
    console.log(this.gameState?.characterList);

    this.io.emit("updateCharacter", character);
  }

  moveCharacter(character) {
    console.log("moving a character", character);
    this.gameState.characterList = this.gameState.characterList.filter(
      (c) => c.id !== character.id
    );
    this.gameState.characterList.push(character);
    console.log(this.gameState?.characterList);

    this.io.emit("updateCharacter", character);
  }

  disconnect(characterId) {
    console.log("user disconnected, removing character", characterId);
    if (this.gameState) {
      this.gameState.characterList = this.gameState?.characterList.filter(
        (c) => c.id !== characterId
      );
    }
    console.log(this.gameState?.characterList);
    this.io.emit("gameState", this.gameState);
  }

  getLocation(characterId) {
    return this.gameState.characterList.find((c) => c.id === characterId).loc;
  }

  hasCharacter(loc) {
    return this.gameState.characterList.some((c) => c.loc.x === loc.x && c.loc.y === loc.y);
  }

  hasStructure(loc) {
    return this.gameState.structureList.some((s) => s.startLoc.x <= loc.x && s.endLoc.x >= loc.x && s.startLoc.y <= loc.y && s.endLoc.y >= loc.y);
  }

  isLocationOccupied(loc) {
    return this.hasCharacter(loc) || this.hasStructure(loc);
  }
};
