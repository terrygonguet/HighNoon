class Enemy extends createjs.Container {

  constructor () {
    super();

    this.head      = new createjs.Shape();
    this.body      = new createjs.Shape();
    this.hand      = new createjs.Shape();
    this.width     = 60;
    this.height    = 160;
    this.state     = "aiming"; // enum { "aiming", "drawing", "firing", "dying" }
    this.regX      = this.width / 2;
    this.regY      = this.height / 2;
    this.time      = 0;
    this.handRatio = 1;
    this.ammo      = 6;

    this.head.set({
      graphics: new createjs.Graphics()
                .s("#000")
                .ss(2)
                .f("#C44")
                .dc(0, 0, this.width / 4),
      x: this.width / 2, y: this.width / 4
    });
    this.body.set({
      graphics: new createjs.Graphics()
                .s("#000")
                .ss(2)
                .f("#C44")
                .r(0, 0, this.width, this.height - this.width / 2),
      x: 0, y: this.width / 2
    });
    this.hand.set({
      graphics: new createjs.Graphics()
                .s("#000")
                .ss(2)
                .f("#C44")
                .dc(0, 0, 7),
      x: -this.width / 4, y: this.height / 1.5
    })

    this.on("tick", this.update, this);

    this.addChild(this.head);
    this.addChild(this.body);
    this.addChild(this.hand);
   }

  getShot (point) {
    var partHit = this.getObjectUnderPoint(point.x, point.y, 0);
    switch (partHit) {
      case this.head:
        this.die();
        break;
      case this.body:
      case this.hand:
        if (this.state === "dying") this.die();
        else {
          this.state = "dying";
          this.time = 700;
        }
        break;
    }
  }

  update (e) {
    switch (this.state) {
      case "aiming":
        this.hand.x = -25 * this.handRatio;
        if (this.handRatio > 0) this.handRatio -= e.delta / 10000;
        else {
          this.state = "drawing";
          this.time = 500;
        }
        break;
      case "drawing":
        this.hand.y = this.height / 1.5 - (1 - this.time / 500) * 25;
        this.time -= e.delta;
        if (this.time <= 0) {
          this.state = "firing";
          this.time = 250;
        }
        break;
      case "firing":
        this.time -= e.delta;
        if (this.time <= 0) this.fire();
        break;
      case "dying":
        this.time -= e.delta;
        if (this.time <= 0) {
          this.die();
        }
        break;
    }
  }

  fire () {
    if (this.ammo-- > 0) {
      game.addChild(new Trail(
        this.hand.localToGlobal(0,0),
        {
          x: 0.1 * game.canvas.width + Math.randInt(-400,400),
          y: 0.5 * game.canvas.height + Math.randInt(-400,400)
        }
      ));
      this.time = 250;
      createjs.Sound.play("Gunshot");
    }
  }

  die () {
    game.removeChild(this);
  }

}
