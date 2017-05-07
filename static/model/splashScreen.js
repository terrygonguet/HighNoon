class SpashScreen {

  constructor(pGame) {
    // enum : { "room", "joined", "countdown", "started", "roundend" }
    this.state   = "room";
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
    this.form = $("<form></form>");
    this.txbRoom = $("<input name='room' id='room' autofocus placeholder='room name' />");
    this.txtRoom = $("<label for='room'>Join room : </label>");
    this.btnJoin = $("<input type='submit' value='Join'/>");

    this.txtCountdown = $("<p>Waiting for opponent</p>").css({
      "font-size": "100px"
    }).hide();
    this.txtScore = $("<p>Player 1 : 0 / 0 : Player2</p>").hide();
    this.btnReady = $("<button>Ready</button>").hide();

    this.time    = 0;

    this.form.submit(e => {
      game.socket.emit("joinroom", { room:this.txbRoom.val() });
      e.preventDefault();
    });

    this.btnReady
      .click(e => {
        game.socket.emit("ready");
        this.btnReady[0].disabled = true;
        game.canvas.requestPointerLock();
      });

    this.form
      .append(this.txtRoom)
      .append(this.txbRoom)
      .append(this.btnJoin);

    this.overlay
      .append(this.form)
      .append(this.txtCountdown)
      .append(this.txtScore)
      .append(this.btnReady)
      .appendTo("#wrapper");

    pGame.socket.on("start", (data) => this.start(data));
    pGame.socket.on("pause", () => this.pause());
    pGame.socket.on("joingame", () => {
      this.state = "joined";
      this.txtCountdown.show();
      this.txtScore.hide();
      if (game.role !== 3) this.btnReady.show();
      this.form.hide();
    });
    pGame.socket.on("countdown", (data) => {
      if (data.countdown <= 0) this.reallyStart();
      else this.txtCountdown.text(data.countdown);
    });
    pGame.socket.on("roundend", (data) => this.roundEnd(data));

  }

  roundEnd (data) {
    console.log(data);
    this.state = "roundEnd";
    game.player.state = "countdown";
    document.exitPointerLock();
    if (game.role === 3) {
      this.txtCountdown.text("PLAYER " + data.win + " WON");
    } else if (data.win === 0) {
      this.txtCountdown.text("DRAW");
    } else if (data.win === game.role) {
      this.txtCountdown.text("SURVIVED");
    } else {
      this.txtCountdown.text("KILLED");
    }
    this.txtCountdown.show();
    this.txtScore
      .text("Player1 : " + data.player1 + " / " + data.player2 + " : Player2")
      .show();
    if (game.role !== 3) this.btnReady.show()[0].disabled = false;
    this.form.hide();
    this.overlay.fadeIn();
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
    this.form.hide();
    this.txtScore.hide();
    this.btnReady.hide();
    this.overlay.fadeIn();
  }

}
