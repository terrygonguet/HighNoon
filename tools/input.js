class Input extends createjs.EventDispatcher {

  constructor () {
    super();

    this.keys = {
      fire: false,
      cock: false,
      dodgeLeft: false,
      dodgeRight: false,
      dodgeDown: false
    };

    // changeable bindings
    this.bindings = {
      dodgeLeft: "q",
      dodgeRight: "w",
      dodgeDown: "e"
    };

    // native events listeners
    window.addEventListener("keydown", e => this.getEvent(e), true);
    window.addEventListener("keyup", e => this.getEvent(e), true);
    window.addEventListener("mousedown", e => this.getEvent(e), true);
    window.addEventListener("mouseup", e => this.getEvent(e), true);
    window.addEventListener("focus", e => this.getEvent(e), false);
    window.addEventListener("blur", e => this.getEvent(e), false);
    $("#game").on("contextmenu", null, null, false); // to prevent right click menu

    // to keep track of which keys are  pressed
    this.on("fire", e => this.keys.fire = true);
    this.on("cock", e => this.keys.cock = true);
    this.on("dodgeLeft", e => this.keys.dodgeLeft = true);
    this.on("dodgeRight", e => this.keys.dodgeRight = true);
    this.on("dodgeDown", e => this.keys.dodgeDown = true);

    this.on("fireU", e => this.keys.fire = false);
    this.on("cockU", e => this.keys.cock = false);
    this.on("dodgeLeftU", e => this.keys.dodgeLeft = false);
    this.on("dodgeRightU", e => this.keys.dodgeRight = false);
    this.on("dodgeDownU", e => this.keys.dodgeDown = false);
  }

  getEvent (e) {
    const event = new createjs.Event("");
    // the event name means down, with a U suffix means up
    switch (e.type) {
      case "mousedown":
        switch (e.button) {
          case 0: event.type = "fire"; break;
          case 2: event.type = "cock"; break;
        }
        break;
      case "mouseup":
        switch (e.button) {
          case 0: event.type = "fireU"; break;
          case 2: event.type = "cockU"; break;
        }
        break;
      case "keydown":
        switch (e.key) {
          case this.bindings.dodgeDown: event.type = "dodgeDown"; break;
          case this.bindings.dodgeLeft: event.type = "dodgeLeft"; break;
          case this.bindings.dodgeRight: event.type = "dodgeRight"; break;
        }
        break;
      case "keyup":
        switch (e.key) {
          case this.bindings.dodgeDown: event.type = "dodgeDownU"; break;
          case this.bindings.dodgeLeft: event.type = "dodgeLeftU"; break;
          case this.bindings.dodgeRight: event.type = "dodgeRightU"; break;
        }
        break;
      case "focus" :
      case "blur" :
        break;
    }
    event.type !== "" && this.dispatchEvent(even);
  }

}

const input = new Input();
