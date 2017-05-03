/*
 * The main class handling updates and graphics
 */

class Game extends createjs.Stage {

  constructor (canvasName) {
    super(canvasName);

    createjs.Ticker.timingMode = createjs.Ticker.RAF;
    createjs.Ticker.framerate = 60;
    createjs.Ticker.on("tick", this.update, this);

    this.enemies      = [];
    this.tickEnabled  = true;
    this.player       = new Player(this);

    let badguy = new Enemy();
    badguy.set({ x: 0.8 * this.canvas.width, y: 0.2 * this.canvas.height });
    this.enemies.push(badguy);

    this.addChild(badguy);
    this.addChild(this.player);
  }

  update (e) {
    !e.paused && super.update(e);
    // if (!e.paused) {
    //   var childs = this.children.slice(0);
    //   for (var i of childs) {
    //     i.dispatchEvent(new createjs.Event("frameTick").set({delta: e.delta}));
    //   }
    // }
  }

  addChild (child) {
    super.addChild(child);
  }

  removeChild (child) {
    super.removeChild(child);
  }

}
