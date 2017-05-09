class Enemy extends createjs.Container {

  constructor (role, hasDrawn) {
    super();

    this.head      = new createjs.Shape();
    this.body      = new createjs.Shape();
    this.hand      = new createjs.Shape();
    this.role      = role;
    this.width     = 60;
    this.height    = 160;
    this.dodged    = false;
    this.state     = "aiming"; // enum { "aiming", "drawing", "firing", "dying" }
    this.regX      = this.width / 2;
    this.regY      = this.height / 2;
    this.time      = 0;
    this.handRatio = 1;
    this.drawTime  = 250;

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
      x: -this.width / 3, y: this.height / 1.5
    });
    if (hasDrawn) {
      this.hand.set({ x: 0, y: this.height / 1.5 - 25 });
      this.state = "firing";
    }

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
          if (game.role != 3)
            game.socket.emit("getshot", { role: this.role });
          this.state = "dying";
          this.time = 700;
        }
        break;
    }
  }

  moveHandTo (handRatio) {
    this.handRatio = handRatio;
  }

  dodge (side) {
    this.drawTime = 600;
    if (this.state !== "firing") this.drawGun();
    let dir = (side === "left" ? 1 : -1); // reversed for the enemy
    this.dodged = this.on("tick", function (e) {
      this.x += dir * (e.delta/1000) * game.canvas.width * 0.2;
      this.y += (e.delta/1000) * this.height / 2;
      this.rotation += dir * 90 * (e.delta/1000);
      if (Math.abs(this.rotation) >= 90) this.off("tick", this.dodged);
    }, this);
  }

  cock () {
    // createjs.Sound.play("Cocking");
  }

  drawGun () {
    this.state = "drawing";
    this.time  = this.drawTime;
    this.hand.x = 0;
  }

  fumble () {
    this.drawTime = 750;
    this.time = this.drawTime;
  }

  update (e) {
    switch (this.state) {
      case "aiming":
        this.hand.x = (-this.width / 3) * this.handRatio;
        break;
      case "drawing":
        this.hand.y = this.height / 1.5 - (1 - this.time / this.drawTime) * 25;
        this.time -= e.delta;
        if (this.time <= 0) {
          this.state = "firing";
        }
        break;
      case "firing":

        break;
      case "dying":
        this.time -= e.delta;
        if (this.time <= 0) {
          this.die();
        }
        break;
    }
  }

  fire (data) {
    if (!data.empty) {
      game.addChild(new Trail(
        this.hand.localToGlobal(0,0),
        {
          x: 0.1 * game.canvas.width + Math.randInt(-400,400),
          y: 0.5 * game.canvas.height + Math.randInt(-400,400)
        }
      ));
      createjs.Sound.play("Gunshot");
    } else
      createjs.Sound.play("Empty");

  }

  die () {
    game.removeChild(this);
    if (game.role != 3)
      game.socket.emit("die", { role: this.role });
  }

}
