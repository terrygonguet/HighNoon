class SpashScreen extends createjs.Container {

  constructor(pGame) {
    super();
    this.state   = "room"; // enum : { "room", "joined", "countdown", "started" }
    this.overlay = $("<div></div>").css({
      "width": "100%",
      "height": "100%",
      "background-color": "rgba(255,0,0,0.5)",
      "position": "absolute",
      "top": 0,
      "left": 0,
      "display": "flex",
      "flex-flow": "column nowrap",
      "align-items": "center",
      "justify-content": "center",
      "color": "#DDD",
      "font-family": "Montserrat"
    });
    this.div = $("<form></form>");
    this.txbRoom = $("<input name='room' id='room' />").attr("placeholder", "room name");
    this.txtRoom = $("<label for='room'>Join room : </label>");
    this.txtCountdown = $("<p>Waiting for opponent</p>").css({
      "font-size": "100px"
    }).hide();
    this.btnJoin = $("<input type='submit' value='Join'/>");
    this.time    = 0;

    this.div.submit(e => {
      game.socket.emit("joinroom", { room:this.txbRoom.val() });
      game.canvas.requestPointerLock();
      e.preventDefault();
    });

    this.div
      .append(this.txtRoom)
      .append(this.txbRoom)
      .append(this.btnJoin);

    this.overlay
      .append(this.div)
      .append(this.txtCountdown)
      .appendTo("#wrapper");

    this.on("tick", this.update, this);

    pGame.socket.on("start", (data) => this.start(data));
    pGame.socket.on("pause", () => this.pause());
    pGame.socket.on("joingame", () => {
      this.state = "joined";
      this.txtCountdown.show();
      this.div.hide();
    });
    pGame.socket.on("countdown", (data) => {
      if (data.countdown <= 0) this.reallyStart();
      else this.txtCountdown.text(data.countdown);
    });
  }

  start (data) {
    this.state = "countdown";
    if (data.countdown <= 0) this.reallyStart(true);
    else this.txtCountdown.text(data.countdown);
  }

  // Too lazy to rename all the methods so deal with it
  reallyStart (fromStart = false) {
    this.overlay.hide();
    this.state = "started";
    if (fromStart) game.reallyStarted = true;
    else game.player.state = "aiming";
  }

  pause () {
    this.state = "joined";
    this.txtCountdown.text("Waiting for opponent").show();
    this.div.hide();
    this.overlay.fadeIn();
  }

  update (e) {
    switch (this.state) {
      case "room":

        break;
      case "joined":

        break;
      case "countdown":

        break;
      case "started":

        break;
    }
  }

}
