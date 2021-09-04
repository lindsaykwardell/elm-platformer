const uuid = require("uuid").v4;
const NPC = require("./NPC");

module.exports = class Game {
  constructor(io) {
    this.io = io;
    this.gameState = null;
    this.connections = [];

    this.io.on("connection", (socket) => {
      let characterId = uuid();
      this.connections.push({
        id: socket.id,
        characterId,
      });

      socket.emit("gameState", this.gameState);
      socket.emit("characterId", characterId);

      socket.on("initGame", this.initGame.bind(this));
      socket.on("addCharacter", this.addCharacter.bind(this));
      socket.on("moveCharacter", this.moveCharacter.bind(this));

      socket.on("chatMsg", this.sendMsg.bind(this));
      socket.on("disconnect", () => this.disconnect(characterId));
    });
  }

  initGame(msg) {
    this.gameState = msg;

    // Spawn two NPCs
    for (let index = 0; index < Math.floor( Math.random() * 30); index++) {
      new NPC(this);
    }
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

  sendMsg(msg) {
    console.log("sending msg", msg);
    this.gameState.characterList.forEach((character) => {
      if (this.inChatRange(character.id, msg.id)) {
        const socketId = this.connections.find(
          (c) => c.characterId === character.id
        )?.id;
        this.io.to(socketId).emit("chatMsg", msg);
      }
    });
  }

  disconnect(characterId) {
    if (this.gameState) {
      this.gameState.characterList = this.gameState?.characterList.filter(
        (c) => c.id !== characterId
      );
    }
    this.connections = this.connections.filter(
      (c) => c.characterId !== characterId
    );
    this.io.emit("gameState", this.gameState);
  }

  getLocation(characterId) {
    return this.gameState.characterList.find((c) => c.id === characterId).loc;
  }

  inChatRange(characterId, otherCharacterId) {
    const charLoc = this.getLocation(characterId);
    const otherCharLoc = this.getLocation(otherCharacterId);
    const distance = Math.sqrt(
      Math.pow(charLoc.x - otherCharLoc.x, 2) +
        Math.pow(charLoc.y - otherCharLoc.y, 2)
    );

    return Math.round(distance) <= 5;
  }

  hasCharacter(loc) {
    return this.gameState.characterList.some(
      (c) => c.loc.x === loc.x && c.loc.y === loc.y
    );
  }

  hasStructure(loc) {
    return this.gameState.structureList.some(
      (s) =>
        s.startLoc.x <= loc.x &&
        s.endLoc.x >= loc.x &&
        s.startLoc.y <= loc.y &&
        s.endLoc.y >= loc.y
    );
  }

  isLocationOccupied(loc) {
    return this.hasCharacter(loc) || this.hasStructure(loc);
  }
};
