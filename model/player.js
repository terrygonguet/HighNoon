class Player extends createjs.Container {

  constructor (pGame) {
    super();

    this.game       = pGame;
    this.target     = null;
    this.state      = "aiming"; // enum { "aiming", "drawing", "firing", "dying" }
    this.moveTime   = 0;
    this.accuracy   = {
      max: 120,
      min: 30,
      cur: 200,
      speed: 13
    };
    this.ammo        = 6;
    this.cocked      = false;
    this.reticule    = new createjs.Shape();
    this.body        = new createjs.Shape(); // gonna be an animation
    this.hand        = new createjs.Shape(); // placeholder
    let hand = $V([0.2 * pGame.canvas.width + 350, 0.6 * pGame.canvas.height]);
    this.handPos  = {
      cur: hand.dup(),
      max: hand.dup(),
      min: $V([0.2 * pGame.canvas.width, 0.6 * pGame.canvas.height]),
      dist: 200
    };
    this.handPos.dist = this.handPos.max.distanceFrom(this.handPos.min);

    this.reticule.set({
      graphics: new createjs.Graphics()
                .s("#000")
                .ss(2)
                .dc(0, 0, this.accuracy.max),
      x: 0, y: 0, visible: false
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
      x: 0, y: 0
    });

    this.setHandlers();

    this.addChild(this.body);
    this.addChild(this.reticule);
    this.addChild(this.hand);

    this.on("tick", this.update, this);
  }

  setHandlers () {
    input.on("mousemove", function (e) {
      switch (this.state) {
        case "aiming" :
          this.handPos.cur.setElements([
            (input.mouseDelta.e(1) + this.handPos.cur.e(1)).clamp(
              this.handPos.min.e(1), this.handPos.max.e(1)
            ), this.handPos.cur.e(2)
          ]);
          break;
        case "firing" :
          this.reticule.set({
            x: this.reticule.x + input.mouseDelta.e(1),
            y: this.reticule.y + input.mouseDelta.e(2)
          });
          break;
      }
    }, this);

    // if the trigger is pulled and you cock tou fire immediately
    input.on("cock", function (e) {
      if (this.state === "firing" || this.state === "drawing") {
        this.cocked = true;
        input.keys.fire && this.fire();
      }
    }, this);

    // if the gun is cocked you fire
    input.on("fire", function (e) {
      if ((this.state === "firing" || this.state === "drawing") && this.cocked) {
        this.fire();
      }
    }, this);
  }

  fire () {
    this.cocked = false;
    if (this.ammo-- > 0) {
      let coords = this.target.globalToLocal(this.reticule.x, this.reticule.y);
      this.target.getShot(coords);
    }
  }

  update (e) {
    if (!this.target) {
      this.target = game.enemies[0];
      this.reticule.set({
        x: this.target.x, y: this.target.y
      });
      this.reticule.visible = true;
    }

    switch (this.state) {
      case "aiming":
        this.hand.set({ x: this.handPos.cur.e(1), y: this.handPos.cur.e(2) });

        // calculate how the circle should shrink
        let ratio = this.handPos.cur.distanceFrom(this.handPos.min) / this.handPos.dist;
        let direction = 0;
        let goal = ratio * (this.accuracy.max - this.accuracy.min) + this.accuracy.min;
        if (Math.abs(goal - this.accuracy.cur) > this.accuracy.speed * (e.delta / 1000))
          direction = goal < this.accuracy.cur ? -1 : 1;
        this.accuracy.cur += direction * this.accuracy.speed * (e.delta / 1000);

        // set and move the circle
        this.reticule.set({
          x: this.reticule.x + input.aimDelta.e(1) * this.accuracy.speed * (e.delta / 1000),
          y: this.reticule.y + input.aimDelta.e(2) * this.accuracy.speed * (e.delta / 1000),
          graphics: new createjs.Graphics()
                    .s("#000")
                    .ss(2)
                    .dc(0, 0, this.accuracy.cur)
        });

        // if the hand is on the gun we draw
        if (this.handPos.cur.distanceFrom(this.handPos.min) < 5) {
          this.state = "drawing";
          this.moveTime = 500;
        }
        break;
      case "drawing":
        this.moveTime -= e.delta;
        if (this.moveTime <= 0) {
          this.state = "firing";
          let reticulePos = $V([this.reticule.x, this.reticule.y]);
          let randomAim = reticulePos.add($V([Math.randFloat(0, this.accuracy.cur), 0]));
          randomAim = randomAim.rotate(Math.randFloat(0, 2 * Math.PI), reticulePos);
          this.reticule.set({
            x: randomAim.e(1), y: randomAim.e(2),
            graphics: new createjs.Graphics().f("#F00").s("#000").dc(0,0,2)
          });
        }
        break;
    }
  }

}
