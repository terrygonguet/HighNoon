/*
 * The main class handling updates and graphics
 */

class Game extends createjs.Stage {

  constructor (canvasName) {
    super(canvasName);

    this.tickEnabled  = true;
    this.player       = null;
    this.opponent     = null;
    this.role         = 0;
    this.netcodetime  = 0;
    this.netcoderate  = 15;
    this.reallyStarted= false;
    this.socket       = io(location.origin);
    this.splash       = new SpashScreen(this);
    this.roletxt      = new createjs.Text("", "20px Montserrat", "#000");

    this.addChildAt(this.roletxt, 0);

    this.setHandlers();
  }

  setHandlers () {
    createjs.Ticker.timingMode = createjs.Ticker.RAF;
    createjs.Ticker.framerate = 60;
    createjs.Ticker.on("tick", this.update, this);

    this.socket.on("joingame", (data, callback) => {
      this.role = data.role;
      this.roletxt.text = "You are " + (this.role<=2 ? "Player "+this.role : "spectator");
      callback();
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

    this.socket.on("fumble", (data) => {
      if (!this.player || !this.opponent) return;
      if (this.player.role === data.role) {
        this.player.fumble(data);
      } else if (this.opponent.role === data.role) {
        this.opponent.fumble(data);
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

    this.socket.on("dodge", (data) => {
      if (!this.player || !this.opponent) return;
      if (this.player.role === data.role) {
        this.player.dodge(data.side);
      } else if (this.opponent.role === data.role) {
        this.opponent.dodge(data.side);
      }
    });
  }

  start (data) {
    this.removeChild(this.player);
    this.removeChild(this.opponent);
    if (this.role <= 2) {
      this.player = new Player(this.role);
      let oppoRole = this.role === 1 ? 2 : 1;
      this.opponent = new Enemy(oppoRole, data["player" + oppoRole].drawn);
    } else {
      this.player = new SpectatorPlayer(data.player1.drawn);
      this.opponent = new Enemy(2, data.player2.drawn);
    }
    if (this.reallyStarted) this.player.state = "aiming";
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
  }

  addChild (child) {
    super.addChildAt(child, this.getChildIndex(this.roletxt));
  }

  removeChild (child) {
    super.removeChild(child);
  }

}
