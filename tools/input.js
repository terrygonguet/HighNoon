class Input extends createjs.EventDispatcher {

  constructor () {
    super();

    this.keys = {
      fire      : false,
      cock      : false,
      dodgeLeft : false,
      dodgeRight: false,
      dodgeDown : false
      // aimUp     : false,
      // aimDown   : false,
      // aimRight  : false,
      // aimLeft   : false
    };
    this.aimDelta = $V([0,0]);
    this.mouseDelta = $V([0,0]);

    // changeable bindings
    this.bindings = {
      dodgeLeft : "q",
      dodgeRight: "e",
      dodgeDown : "w"
      // aimUp     : "w",
      // aimDown   : "s",
      // aimRight  : "a",
      // aimLeft   : "d"
    };

    // native events listeners
    window.addEventListener("keydown", e => this.getEvent(e), true);
    window.addEventListener("keyup", e => this.getEvent(e), true);
    window.addEventListener("mousedown", e => this.getEvent(e), true);
    window.addEventListener("mouseup", e => this.getEvent(e), true);
    window.addEventListener("mousemove", e => this.getEvent(e), true);
    window.addEventListener("focus", e => this.getEvent(e), false);
    window.addEventListener("blur", e => this.getEvent(e), false);
    $("#game").on("contextmenu", null, null, false); // to prevent right click menu
    document.addEventListener("pointerlockchange",  () => {});
  }

  getEvent (e) {
    const event = new createjs.Event("");
    // the event name means down, with a U suffix means up
    switch (e.type) {
      case "mousedown":
        switch (e.button) {
          case 0:
            event.type = "fire";
            this.keys.fire = true;
            break;
          case 2:
            event.type = "cock";
            this.keys.cock = true;
            break;
        }
        break;
      case "mouseup":
        switch (e.button) {
          case 0:
            event.type = "fireU";
            this.keys.fire = false;
            break;
          case 2:
            event.type = "cockU";
            this.keys.cock = false;
            break;
        }
        break;
      case "keydown":
        switch (e.key) {
          case this.bindings.dodgeDown:
            event.type = "dodgeDown";
            this.keys.dodgeDown = true;
            break;
          case this.bindings.dodgeLeft:
            event.type = "dodgeLeft";
            this.keys.dodgeLeft = true;
            break;
          case this.bindings.dodgeRight:
            event.type = "dodgeRight";
            this.keys.dodgeRight = true;
            break;
          // case this.bindings.aimUp :
          //   this.keys.aimUp = true;
          //   break;
          // case this.bindings.aimDown :
          //   this.keys.aimDown = true;
          //   break;
          // case this.bindings.aimLeft :
          //   this.keys.aimLeft = true;
          //   break;
          // case this.bindings.aimRight :
          //   this.keys.aimRight = true;
          //   break;
        }
        this.updateDelta();
        break;
      case "keyup":
        switch (e.key) {
          case this.bindings.dodgeDown:
            event.type = "dodgeDownU";
            this.keys.dodgeDown = false;
            break;
          case this.bindings.dodgeLeft:
            event.type = "dodgeLeftU";
            this.keys.dodgeLeft = false;
            break;
          case this.bindings.dodgeRight:
            event.type = "dodgeRightU";
            this.keys.dodgeRight = false;
            break;
          // case this.bindings.aimUp :
          //   this.keys.aimUp = false;
          //   break;
          // case this.bindings.aimDown :
          //   this.keys.aimDown = false;
          //   break;
          // case this.bindings.aimLeft :
          //   this.keys.aimLeft = false;
          //   break;
          // case this.bindings.aimRight :
          //   this.keys.aimRight = false;
          //   break;
        }
        this.updateDelta();
        break;
      case "focus" : break;
      case "blur" :
        document.exitPointerLock();
        break;
      case "mousemove" :
        if (document.pointerLockElement) {
          event.type = "mousemove";
          this.mouseDelta = $V([e.movementX, e.movementY]);
        } else
          this.mouseDelta = $V([0,0]);
        break;
    }
    event.original = e;
    event.type !== "" && this.dispatchEvent(event);
  }

  updateDelta() {
    // this.aimDelta = $V([
    //     Number(-this.keys.aimRight + this.keys.aimLeft),
    //     Number(-this.keys.aimUp + this.keys.aimDown)
    // ]);
  }

}

const input = new Input();
