class Player extends createjs.Container {

  constructor (pGame) {
    super();

    this.game        = pGame;
    this.target      = null;
    this.state       = "aiming"; // enum { "aiming", "drawing", "firing", "dying" }
    this.time        = 0;
    this.ammo        = 6;
    this.cooldown    = Infinity;
    this.reticule    = new createjs.Shape();
    this.body        = new createjs.Shape(); // gonna be an animation
    this.hand        = new createjs.Shape(); // placeholders
    this.gun         = new createjs.Shape();
    let hand = $V([0.2 * pGame.canvas.width + 350, 0.6 * pGame.canvas.height]);
    this.handPos  = {
      cur: hand.dup(),
      max: hand.dup(),
      min: $V([0.2 * pGame.canvas.width, 0.6 * pGame.canvas.height]),
      dist: 0
    };
    this.handPos.dist = this.handPos.max.distanceFrom(this.handPos.min);

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
    this.hand.set({
      graphics: new createjs.Graphics()
                .s("#000")
                .ss(2)
                .f("#C68E17")
                .dc(0, 0, 75),
      x: this.handPos.cur.e(1), y: this.handPos.cur.e(2)
    });
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

    this.setHandlers();

    this.addChild(this.body);
    this.addChild(this.reticule);
    this.addChild(this.gun);
    this.addChild(this.hand);
  }

  setHandlers () {
    this.on("tick", this.update, this);

    input.on("mousemove", function (e) {
      switch (this.state) {
        case "aiming" :
          this.handPos.cur.setElements([
            (input.mouseDelta.e(1) + this.handPos.cur.e(1)).clamp(
              this.handPos.min.e(1), this.handPos.max.e(1)
            ), this.handPos.cur.e(2)
          ]);
          this.hand.set({ x: this.handPos.cur.e(1), y: this.handPos.cur.e(2) });
          break;
        case "firing" :
          this.reticule.set({
            x: (this.reticule.x + input.mouseDelta.e(1)).clamp(0, game.canvas.width),
            y: (this.reticule.y + input.mouseDelta.e(2)).clamp(0, game.canvas.height)
          });
          break;
      }
    }, this);

    // if the trigger is pulled and you cock tou fire immediately
    input.on("cock", function (e) {
      if (this.state === "firing" || this.state === "drawing") {
        this.cooldown = 250;
      }
    }, this);

    // if the gun is cocked you fire
    input.on("fire", function (e) {
      if ((this.state === "firing" || this.state === "drawing") && this.cooldown <= 0) {
        this.fire();
      }
    }, this);
  }

  fire () {
    this.cooldown = Infinity;
    if (this.ammo-- > 0 && this.state === "firing") {
      let reticulePos = $V([this.reticule.x, this.reticule.y]);
      let randomAim = reticulePos.add($V([Math.randFloat(0, this.reticule.cur), 0]));
      randomAim = randomAim.rotate(Math.randFloat(0, 2 * Math.PI), reticulePos);
      let point = new createjs.Point(randomAim.e(1), randomAim.e(2));
      game.addChild(new Trail(this.hand, point));

      let coords = this.target.globalToLocal(point.x, point.y);
      this.target.getShot(coords);

      this.reticule.set({
        x: this.reticule.x + Math.randInt(-10,10),
        y: this.reticule.y - Math.randInt(10,30),
        cur: this.reticule.max
      });
    }
  }

  update (e) {
    if (!this.target) {
      this.target = game.enemies[0];
      this.reticule.set({
        x: this.target.x, y: this.target.y
      });
    }

    switch (this.state) {
      case "aiming":
        // if the hand is on the gun we draw
        if (this.handPos.cur.distanceFrom(this.handPos.min) < 5) {
          this.state = "drawing";
          this.time = 500;
        }
        break;
      case "drawing":
        this.time -= e.delta;

        // pointless gross animations
        let dir = $V([0.5 * game.canvas.width, 0.4 * game.canvas.height]);
        let temp = dir.subtract(this.handPos.min).x(1 - this.time / 500);
        temp = this.handPos.min.add(temp);
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
      case "firing":
        this.reticule.cur -= this.reticule.speed * (e.delta/1000);
        this.reticule.cur = this.reticule.cur.clamp(this.reticule.min, this.reticule.max);
        this.reticule.graphics.c().s("#000").dc(0,0,this.reticule.cur);
        this.cooldown -= e.delta;
        if (input.keys.fire && this.cooldown <= 0) this.fire();
        break;
      case "dying":
        break;
    }
  }

}
