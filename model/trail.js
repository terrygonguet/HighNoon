class Trail extends createjs.Shape {

  constructor(ptFrom, ptTo) {
      super();

      this.graphics.s("#000").s(2)
                   .mt(ptFrom.x, ptFrom.y)
                   .lt(ptTo.x, ptTo.y);

      this.on("tick", function (e) {
        this.alpha -= e.delta / 1000;
        if (this.alpha <= 0) game.removeChild(this);
      }, this);
  }

}
