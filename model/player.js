class Player extends createjs.Container {

  constructor (pGame) {
    super();

    this.game     = pGame;
    this.target   = null;
    this.state    = "aiming"; // enum { "aiming", "drawing", "firing", "dying" }
    this.accuracy = {
      max: 120,
      min: 30,
      cur: 200,
      speed: 13
    };
    this.reticule = new createjs.Shape();
    this.body     = new createjs.Shape(); // gonna be an animation
    this.hand     = new createjs.Shape(); // placeholder
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

    input.on("mousemove", e => this.handPos.cur.setElements([
      (input.mouseDelta.e(1) + this.handPos.cur.e(1)).clamp(
        this.handPos.min.e(1), this.handPos.max.e(1)
      ), this.handPos.cur.e(2)
    ]));

    this.addChild(this.body);
    this.addChild(this.reticule);
    this.addChild(this.hand);

    this.on("tick", this.update, this);
  }

  update (e) {
    this.hand.set({ x: this.handPos.cur.e(1), y: this.handPos.cur.e(2) });

    if (this.target) {
      let ratio = this.handPos.cur.distanceFrom(this.handPos.min) / this.handPos.dist;
      let direction = 0;
      let goal = ratio * (this.accuracy.max - this.accuracy.min) + this.accuracy.min;
      if (Math.abs(goal - this.accuracy.cur) > this.accuracy.speed * (e.delta / 1000))
        direction = goal < this.accuracy.cur ? -1 : 1;
      this.accuracy.cur += direction * this.accuracy.speed * (e.delta / 1000);
      this.reticule.set({
        x: this.reticule.x + input.aimDelta.e(1) * this.accuracy.speed * (e.delta / 1000),
        y: this.reticule.y + input.aimDelta.e(2) * this.accuracy.speed * (e.delta / 1000),
        visible: true,
        graphics: new createjs.Graphics()
                  .s("#000")
                  .ss(2)
                  .dc(0, 0, this.accuracy.cur)
      });
    } else {
      this.target = game.enemies[0];
      this.reticule.set({
        x: this.target.x, y: this.target.y
      });
      this.reticule.visible = false;
    }
  }

}
