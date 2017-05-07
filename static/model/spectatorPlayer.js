class SpectatorPlayer extends Player {

  constructor(hasDrawn) {
    super(1);
    this.hand.target = 1;
    if (hasDrawn) {
      this.state = "firing";
      this.hand.set({
        x: 0.5 * game.canvas.width, y: 0.4 * game.canvas.height
      });
      this.gun.visible = !hasDrawn;
    }
  }

  setHandlers() {
    // no handlers, this is all controlled through Game and the socket
    // this empty method is there to override Player.setHandlers
  }

  moveHandTo (handRatio) {
    this.hand.target = handRatio;
  }

  fire (data) {
    if (!data.empty) {
      game.addChild(new Trail(this.hand, data));
      createjs.Sound.play("Gunshot");
    } else
      createjs.Sound.play("Empty");
  }

  cock () {
    createjs.Sound.play("Cocking");
  }

  update (e) {
    switch (this.state) {
      case "aiming" :
        let diff = this.hand.target - this.handRatio;
        if (Math.abs(diff) > e.delta / 250) {
          this.handRatio += Math.sign(diff) * e.delta / 500;
        }
        this.hand.cur = this.hand.min.add(
          this.hand.max.subtract(this.hand.min).x(this.handRatio)
        );
        this.hand.set({ x: this.hand.cur.e(1), y: this.hand.cur.e(2) });
        break;
      case "drawing":
        this.time -= e.delta;
        this.animate();
        if (this.time <= 0) this.state = "firing";
        break;
    }
  }

}
