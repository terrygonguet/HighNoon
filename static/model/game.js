/*
 * The main class handling updates and graphics
 */

class Game extends createjs.Stage {

  constructor (canvasName) {
    super(canvasName);

    this.enemies      = [];
    this.tickEnabled  = true;
    this.player       = null;
    this.opponent     = null;
    this.role         = 0;
    this.netcodetime  = 0;
    this.netcoderate  = 10;
    this.socket       = io("http://localhost/");

    this.setHandlers();
  }

  setHandlers () {
    createjs.Ticker.timingMode = createjs.Ticker.RAF;
    createjs.Ticker.framerate = 60;
    createjs.Ticker.on("tick", this.update, this);

    this.socket.on("joingame", (data, callback) => {
      if (data.role <= 2) {
        this.role = data.role;
        this.player = new Player(this, data.role);
        this.opponent = new Enemy(data.role === 1 ? 2 : 1);
      } else {
        this.player = new createjs.Shape();
        this.player.graphics.ss(2).s("#000").f("gray").r(0,0,100,100);
        this.player.role = data.role;
        this.opponent = new Enemy(2);
      }
      this.opponent.set({ x: 0.8 * this.canvas.width, y: 0.2 * this.canvas.height });
      callback();
    });

    this.socket.on("leftgame", data => {
      if (data.role <= 2) {
        this.stop();
      }
    });

    this.socket.on("start", () => this.start());
    this.socket.on("pause", () => this.stop());

    this.socket.on("handmove", (data) => {
      if (this.player.role === data.role) {

      } else if (this.opponent.role === data.role) {
        this.opponent.moveHandTo(data.handRatio);
      }
    });

    this.socket.on("draw", (data) => {
      if (this.player.role === data.role) {

      } else if (this.opponent.role === data.role) {
        this.opponent.drawGun();
      }
    });

    this.socket.on("fire", (data) => {
      if (this.player.role === data.role) {

      } else if (this.opponent.role === data.role) {
        this.opponent.fire();
      }
    });

    this.socket.on("getshot", (data) => {
      if (this.player.role === data.role) {
        this.player.getShot();
      } else if (this.opponent.role === data.role) {
        this.opponent.getshot();
      }
    });

    this.socket.on("die", (data) => {
      if (this.player.role === data.role) {
        this.player.die();
      } else if (this.opponent.role === data.role) {
        this.opponent.die();
      }
    });
  }

  start () {
    if (this.getChildIndex(this.opponent) === -1)
      this.addChild(this.opponent);
    if (this.getChildIndex(this.player) === -1)
      this.addChild(this.player);
  }

  stop () {
    this.removeChild(this.opponent);
    this.removeChild(this.player);
  }

  update (e) {
    this.netcodetime += e.delta;
    if (this.netcodetime >= 1000 / this.netcoderate) {
      this.dispatchEvent("netcodeupdate", { delta: this.netcodetime });
      this.netcodetime = 0;
    }
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
