class Player extends createjs.Container {

  constructor () {
    super();

    this.on("tick", this.update, this);
  }

  update (e) {

  }

}
