class Tutorial extends Player {

  constructor() {
    game.socket     = { on: () => {}, emit: () => {} }; // remove multiplayer
    game.role       = 1;
    game.splash.overlay.hide();
    super(1);
    this.txtTuto    = new createjs.Text("", "20px Montserrat", "#000");
    this.phase      = 0;
    this.canAdvance = true;
    this.phases     = [
      () => {
        game.splash.overlay.show();
        game.splash.joingame();
        this.txtTuto.text = "Once you joined a room, you might need to wait until another player joins\nClick to advance";
        this.canAdvance = true;
      },
      () => {
        this.txtTuto.text = "Once enough players have joined and are ready the countdown starts";
        let cd = 3;
        game.splash.countdown({ countdown:cd });
        let id = setInterval(function () {
          game.splash.countdown({ countdown:--cd });
          if (cd <= 0) {
            clearInterval(id);
            game.player.next(true);
          }
        }, 1000);
        game.canvas.requestPointerLock();
      },
      () => {
        this.txtTuto.text = "Use the mouse to move your hand and draw your gun";
      },
      () => {
        this.txtTuto.text = "Right click to cock the hammer\nLeft click to press the trigger";
      },
      () => {
        this.txtTuto.text = "Head shot kills instantl\nBody shots don't";
      },
      () => {
        this.txtTuto.text = "Empty your gun to exit tutorial";
      }
    ];

    game.opponent = new Enemy(2, false);
    game.opponent.set({ x: 0.8 * game.canvas.width, y: 0.2 * game.canvas.height });

    this.txtTuto.set({
      text: "You are on the left, your opponent is on the right\nClick to advance the tutorial",
      x: window.innerWidth - 10, y: window.innerHeight - 50,
      textAlign: "right", textBaseline: "bottom"
    });

    input.on("fire", () => this.next());

    game.addChild(game.opponent);
    game.addChild(this);
    game.addChild(this.txtTuto);
  }

  drawGun () {
    super.drawGun();
    this.next(true);
  }

  cock () {
    super.cock();
    if (this.phase >= 3) this.canAdvance = true;
  }

  fire () {
    super.fire();
    this.next();
    if (this.ammo <= 0) location.reload();
  }

  update (e) {
    super.update(e);
  }

  next (force = false) {
    if (this.canAdvance || force) {
      this.canAdvance = false;
      this.phases[this.phase++]();
    }
  }

}
