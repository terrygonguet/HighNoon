class Player extends createjs.Container {

  constructor (pGame, role) {
    super();

    this.game        = pGame;
    this.target      = null;
    this.state       = "aiming"; // enum { "aiming", "drawing", "firing", "dying" }
    this.role        = role;
    this.time        = 0;
    this.ammo        = 6;
    this.cooldown    = Infinity;
    this.reticule    = new createjs.Shape();
    this.body        = new createjs.Shape(); // gonna be an animation
    this.hand        = new createjs.Shape(); // placeholders
    this.gun         = new createjs.Shape();
    this.handRatio   = 1;

    this.reticule.set({
      x: 0, y: 0, visible: false,
      min: 20, cur: 150,
      max: 150, speed: 100
    });
    this.body.set({
      graphics: new createjs.Graphics()
                .s("#000")
                .ss(2)
                .f("#C68E17")
                .r(0, 0, 0.2 * pGame.canvas.width, pGame.canvas.height),
      x:0, y:0
    });
    let hand = $V([0.2 * pGame.canvas.width + 350, 0.6 * pGame.canvas.height]);
    this.hand.set({
      graphics: new createjs.Graphics()
                .s("#000")
                .ss(2)
                .f("#C68E17")
                .dc(0, 0, 75),
      x: hand.e(1), y: hand.e(2),
      cur: hand.dup(), max: hand.dup(), dist: 0,
      min: $V([0.2 * pGame.canvas.width, 0.6 * pGame.canvas.height])
    });
    this.hand.dist = this.hand.max.distanceFrom(this.hand.min);
    this.gun.set({
      graphics: new createjs.Graphics()
                .s("#000")
                .ss(2)
                .f("gray")
                .dc(35, 0, 35)
                .r(0, 0, 70, 250),
      x: 0.2 * pGame.canvas.width, y: 0.6 * pGame.canvas.height,
      regX: 35
    });

    this.on("tick", this.update, this);

    this.setHandlers();

    this.addChild(this.body);
    this.addChild(this.reticule);
    this.addChild(this.gun);
    this.addChild(this.hand);
  }

  setHandlers () {
    input.on("mousemove", function (e) {
      switch (this.state) {
        case "aiming" :
          this.hand.cur.setElements([
            (input.mouseDelta.e(1) + this.hand.cur.e(1)).clamp(
              this.hand.min.e(1), this.hand.max.e(1)
            ), this.hand.cur.e(2)
          ]);
          this.hand.set({ x: this.hand.cur.e(1), y: this.hand.cur.e(2) });
          this.handRatio = this.hand.cur.distanceFrom(this.hand.min) / this.hand.dist;
          break;
        case "firing" :
          this.reticule.set({
            x: (this.reticule.x + input.mouseDelta.e(1)).clamp(0, game.canvas.width),
            y: (this.reticule.y + input.mouseDelta.e(2)).clamp(0, game.canvas.height)
          });
          break;
      }
    }, this);

    // if the trigger is pulled and you cock you fire immediately
    input.on("cock", function (e) {
      if ((this.state === "firing" || this.state === "drawing")
          && this.cooldown === Infinity)
      {
        this.cock();
      }
    }, this);

    // if the gun is cocked you fire
    input.on("fire", function (e) {
      if ((this.state === "firing" || this.state === "drawing") && this.cooldown <= 0) {
        this.fire();
      }
    }, this);

    this.game.on("netcodeupdate", function (e) {
      switch (this.state) {
        case "aiming":
          game.socket.emit("handmove", this.handRatio);
          break;
      }
    }, this);
  }

  cock () {
    this.cooldown = 250;
    createjs.Sound.play("Cocking");
    if (game.role !== 3) game.socket.emit("cock");
  }

  getShot () {
    this.state = "dying";
    this.time = 700;
    this.reticule.cur = this.reticule.max;
  }

  die () {
    game.removeChild(this);
  }

  fire () {
    this.cooldown = Infinity;
    let point = { x:0, y:0 };
    if (this.ammo > 0 && this.state === "firing") {
      let reticulePos = $V([this.reticule.x, this.reticule.y]);
      let randomAim = reticulePos.add($V([Math.randFloat(0, this.reticule.cur), 0]));
      randomAim = randomAim.rotate(Math.randFloat(0, 2 * Math.PI), reticulePos);
      point = new createjs.Point(randomAim.e(1), randomAim.e(2));
      game.addChild(new Trail(this.hand, point));

      let coords = this.target.globalToLocal(point.x, point.y);
      this.target.getShot(coords);

      this.reticule.set({
        x: this.reticule.x + Math.randInt(-10,10),
        y: this.reticule.y - Math.randInt(10,30),
        cur: this.reticule.max
      });

      createjs.Sound.play("Gunshot");
    } else if (this.ammo <= 0)
      createjs.Sound.play("Empty");

    if (game.role !== 3)
      game.socket.emit("fire", { x: point.x, y: point.y, empty: this.ammo <= 0 });
    this.ammo--;
  }

  drawGun () {
    if (game.role !== 3) game.socket.emit("draw");
    this.state = "drawing";
    this.time = 500;
  }

  update (e) {
    if (!this.target) {
      this.target = game.opponent;
      this.reticule.set({
        x: this.target.x, y: this.target.y
      });
    }

    switch (this.state) {
      case "aiming":
        // if the hand is on the gun we draw
        if (this.hand.cur.distanceFrom(this.hand.min) < 5) {
          this.drawGun();
        }
        break;
      case "drawing":
        this.time -= e.delta;

        // pointless gross animations
        let dir = $V([0.5 * game.canvas.width, 0.4 * game.canvas.height]);
        let temp = dir.subtract(this.hand.min).x(1 - this.time / 500);
        temp = this.hand.min.add(temp);
        this.hand.set({ x: temp.e(1), y: temp.e(2) });
        this.gun.set({
          x: temp.e(1), y: temp.e(2),
          rotation: (1 - this.time / 500) * -125,
          scaleY: this.time / 500
        });

        if (this.time <= 0) {
          // randomize where the reticule appears
          let reticulePos = $V([this.reticule.x, this.reticule.y]);
          let randomAim = reticulePos.add($V([Math.randFloat(0, 120), 0]));
          randomAim = randomAim.rotate(Math.randFloat(0, 2 * Math.PI), reticulePos);
          this.reticule.set({
            x: randomAim.e(1), y: randomAim.e(2),
            visible: true
          });
          this.state = "firing";
        }
        break;
      case "dying":
        this.time -= e.delta;
        if (this.time <= 0) this.die();
      case "firing":
        this.reticule.cur -= this.reticule.speed * (e.delta/1000);
        this.reticule.cur = this.reticule.cur.clamp(this.reticule.min, this.reticule.max);
        this.reticule.graphics.c().s("#000").dc(0,0,this.reticule.cur);
        this.cooldown -= e.delta;
        if (input.keys.fire && this.cooldown <= 0) this.fire();
        break;
    }
  }

}
