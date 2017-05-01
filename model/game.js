/*
 * The main class handling updates and graphics
 */

class Game extends createjs.Stage {

  constructor (canvasName) {
    super(canvasName);

    createjs.Ticker.timingMode = createjs.Ticker.RAF;
    createjs.Ticker.framerate = 60;
    createjs.Ticker.on("tick", this.update, this);

    this.tickEnabled  = true;
  }

  update (e) {
    super.update(e);
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
