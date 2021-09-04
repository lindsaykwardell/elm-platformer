const uuid = require("uuid").v4;
const faker = require("faker");
const pokemon = require("pokemon");

module.exports = class NPC {
  constructor(game) {
    function generateLoc() {
      const loc = {
        x: Math.floor(Math.random() * game.maxX),
        y: Math.floor(Math.random() * game.maxY),
      };

      if (game.isLocationOccupied(loc)) {
        return generateLoc();
      }

      return loc;
    }

    this.game = game;
    this.id = uuid();
    this.color = "pink";
    this.name = pokemon.random();
    this.loc = generateLoc();
    this.direction = "Down";

    this.game.addCharacter(this.character);

    this.scheduleMove();
    this.scheduleMsg();
  }

  get character() {
    return {
      id: this.id,
      name: this.name,
      color: this.color,
      loc: this.loc,
      direction: this.direction,
    };
  }

  scheduleMove() {
    setTimeout(() => {
      this.move();
      this.scheduleMove();
    }, Math.floor(Math.random() * 3000));
  }

  move() {
    const currentLoc = this.game.getLocation(this.id);
    const newLoc = { ...currentLoc };

    const roll = Math.floor(Math.random() * 4);

    switch (roll) {
      case 0:
        newLoc.x--;
        this.direction = "Up";
        break;
      case 1:
        newLoc.x++;
        this.direction = "Down";
        break;
      case 2:
        newLoc.y--;
        this.direction = "Left";
        break;
      case 3:
        newLoc.y++;
        this.direction = "Right";
        break;
    }

    if (newLoc.x < 0) {
      newLoc.x = 0;
    }
    if (newLoc.y < 0) {
      newLoc.y = 0;
    }

    if (!this.game.isLocationOccupied(newLoc)) {
      this.loc = newLoc;

      this.game.moveCharacter(this.character);
    }
  }

  scheduleMsg() {
    setTimeout(() => {
      this.sendMsg();
      this.scheduleMsg();
    }, Math.floor(Math.random() * 20000));
  }

  sendMsg() {
    const hailPlayer = Math.floor(Math.random() * 2);
    if (hailPlayer) {
      const inRangeCharacters = this.game.gameState.characterList.filter(
        (character) => {
          return this.game.inChatRange(this.id, character.id);
        }
      );
      const chosenCharacter =
        inRangeCharacters[Math.floor(Math.random() * inRangeCharacters.length)];
      this.game.sendMsg({
        id: this.id,
        msg: `${chosenCharacter.name}! ${faker.hacker.phrase()}`,
      });
    } else {
      this.game.sendMsg({ id: this.id, msg: faker.hacker.phrase() });
    }
  }

  receiveMsg(msg) {
    if (msg.msg.includes(this.name) && msg.id !== this.id) {
      const sender = this.game.getCharacter(msg.id);
      const response = faker.hacker.phrase();

      const shouldRespond = Math.floor(Math.random() * 2);

      if (shouldRespond) {
        setTimeout(() => {
          this.game.sendMsg({
            id: this.id,
            msg: `${response.substring(0, response.length - 1)}, ${
              sender.name
            }!`,
          });
        }, 750);
      }
    }
  }
};
