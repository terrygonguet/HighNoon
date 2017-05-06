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
      this.role = data.role;
      callback();
    });

    this.socket.on("leftgame", data => {
      if (data.role <= 2) {
        this.stop();
      }
    });

    this.socket.on("start", (data) => this.start(data));
    this.socket.on("pause", () => this.stop());

    this.socket.on("handmove", (data) => {
      if (!this.player || !this.opponent) return;
      if (this.player.role === data.role) {
        this.player.moveHandTo(data.handRatio);
      } else if (this.opponent.role === data.role) {
        this.opponent.moveHandTo(data.handRatio);
      }
    });

    this.socket.on("draw", (data) => {
      if (!this.player || !this.opponent) return;
      if (this.player.role === data.role) {
        this.player.drawGun();
      } else if (this.opponent.role === data.role) {
        this.opponent.drawGun();
      }
    });

    this.socket.on("fire", (data) => {
      if (!this.player || !this.opponent) return;
      if (this.player.role === data.role) {
        this.player.fire(data);
      } else if (this.opponent.role === data.role) {
        this.opponent.fire(data);
      }
    });

    this.socket.on("cock", (data) => {
      if (!this.player || !this.opponent) return;
      if (this.player.role === data.role) {
        this.player.cock(data);
      } else if (this.opponent.role === data.role) {
        this.opponent.cock(data);
      }
    });

    this.socket.on("getshot", (data) => {
      if (!this.player || !this.opponent) return;
      if (this.player.role === data.role) {
        this.player.getShot();
      } else if (this.opponent.role === data.role) {
        this.opponent.getshot();
      }
    });

    this.socket.on("die", (data) => {
      if (!this.player || !this.opponent) return;
      if (this.player.role === data.role) {
        this.player.die();
      } else if (this.opponent.role === data.role) {
        this.opponent.die();
      }
    });
  }

  start (data) {
    this.removeChild(this.opponent);
    this.removeChild(this.player);
    if (this.role <= 2) {
      this.player = new Player(this, this.role);
      let oppoRole = this.role === 1 ? 2 : 1;
      this.opponent = new Enemy(oppoRole, data["player" + oppoRole].drawn);
    } else {
      this.player = new SpectatorPlayer(this, data.player1.drawn);
      this.opponent = new Enemy(2, data.player2.drawn);
    }
    this.opponent.set({ x: 0.8 * this.canvas.width, y: 0.2 * this.canvas.height });
    this.addChild(this.opponent);
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
