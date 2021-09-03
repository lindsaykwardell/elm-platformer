module.exports = class Game {
  constructor(io) {
    this.io = io;
    this.gameState = null;

    this.io.on("connection", (socket) => {
      console.log("a user connected");

      let characterId;
      socket.emit("gameState", this.gameState);

      socket.on("initGame", this.initGame.bind(this));
      socket.on("addCharacter", this.addCharacter.bind(this));
      socket.on("moveCharacter", this.moveCharacter.bind(this));
      socket.on("disconnect", this.disconnect.bind(this));
    });
  }

  initGame(msg) {
    this.gameState = msg;
    // characterId = msg.characterList[0].id;
    console.log(this.gameState?.characterList);
  }

  addCharacter(character) {
    console.log("adding a character", character);
    // characterId = character.id;
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

  disconnect() {
    // console.log("user disconnected, removing character", characterId);
    // let removedCharacter;
    // gameState.characterList = gameState.characterList.map((character) => {
    //   if (character.id === characterId) {
    //     removedCharacter = { ...character, loc: { x: -1, y: -1 } };
    //     return removedCharacter;
    //   }
    //   return character;
    // });
    // console.log(gameState?.characterList);
    // io.emit("updateCharacter", removedCharacter);
  }
};
