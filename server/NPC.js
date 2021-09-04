const uuid = require("uuid").v4;
const faker = require("faker");
const pokemon = require("pokemon");

module.exports = class NPC {
  constructor(game) {
    function generateLoc() {
      const loc = {
        x: Math.floor(Math.random() * 10),
        y: Math.floor(Math.random() * 10),
      }

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
        break;
      case 1:
        newLoc.x++;
        break;
      case 2:
        newLoc.y--;
        break;
      case 3:
        newLoc.y++;
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
    this.game.sendMsg({id: this.id, msg: faker.hacker.phrase()});
  }
};
