const uuid = require("uuid").v4;
const NPC = require("./NPC");

module.exports = class Game {
  constructor(io) {
    this.io = io;
    this.gameState = null;
    this.connections = [];
    this.npcList = [];

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

  get maxX() {
    return this.gameState?.init.maxX;
  }

  get maxY() {
    return this.gameState?.init.maxY;
  }

  initGame(msg) {
    this.gameState = msg;

    // Spawn NPCs
    for (let index = 0; index < 50; index++) {
      this.npcList.push(new NPC(this));
    }
  }

  addCharacter(character) {
    this.gameState.characterList.push(character);

    this.io.emit("updateCharacter", character);
  }

  moveCharacter(character) {
    this.gameState.characterList = this.gameState.characterList.map((c) => {
      if (c.id === character.id) {
        return character;
      }
      return c;
    });

    const connectionId = this.connections.find(
      (c) => c.characterId === character.id
    )?.id;

    this.io.except(connectionId).emit("updateCharacter", character);
  }

  sendMsg(msg) {
    this.gameState.characterList.forEach((character) => {
      if (this.inChatRange(character.id, msg.id)) {
        const npc = this.npcList.find((n) => n.id === character.id);

        if (!npc) {
          const socketId = this.connections.find(
            (c) => c.characterId === character.id
          )?.id;
          this.io.to(socketId).emit("chatMsg", msg);
        } else {
          npc.receiveMsg(msg);
        }
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

  getCharacter(characterId) {
    return this.gameState?.characterList.find((c) => c.id === characterId);
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
