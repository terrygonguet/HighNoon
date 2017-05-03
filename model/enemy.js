class Enemy extends createjs.Shape {

  constructor () {
    super();

    this.graphics.s("#000")
                 .ss(2)
                 .f("#C44")
                 .r(0,0,100,180);
    this.regX = 50;
    this.regY = 90;
  }

}
