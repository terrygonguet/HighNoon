/* Loads all the necessary game files and handles loading screen */

/** Only globals allowed :
 *  game, input, queue, debug
 */
var game;
const queue = new createjs.LoadQueue();
const debug = false;
const socket = io("http://localhost/");

(function () {
  queue.on("complete", handleComplete, this);
  queue.on("fileload", handleFileLoad, this);
  queue.on("fileerror", handleFileError, this);
  queue.installPlugin(createjs.Sound);

  // loading screen
  const stage = new createjs.Stage("game");
  const bar = new createjs.Shape();
  bar.graphics.ss(5);
  bar.set({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2
  });
  const txt = new createjs.Text("Loading", "50px Montserrat", "#000");
  txt.set({
    x: window.innerWidth / 2,
    y: window.innerHeight / 3,
    textAlign: "center"
  });
  let nbLoaded = 0;
  stage.canvas.width = window.innerWidth;
  stage.canvas.height = window.innerHeight;
  stage.addChild(bar);
  stage.addChild(txt);
  stage.update();

  // Files to load
  queue.manifest = [
    // Scripts ----------------------------------
    {id: "Tools", src:"tools/tools.js"},
    {id: "Input Manager", src:"tools/input.js"},
    {id: "Game", src:"model/game.js"},
    {id: "Player", src:"model/player.js"},
    {id: "Enemy", src:"model/enemy.js"},
    {id: "Trail", src:"model/trail.js"},

    // Sprites ----------------------------------------

    // Sounds ----------------------------------------
    {id: "Gunshot", src: "resources/gunshot.wav"},
    {id: "Empty", src: "resources/empty.wav"},
    {id: "Cocking", src: "resources/cocking.wav"}
  ];
  queue.loadManifest(queue.manifest);

  function handleComplete() {
    console.log("Loading complete.");
    stage.removeChild(bar);
    stage.removeChild(txt);
    stage.update();
    game = new Game("game");
    resizeCanvas();
    game.canvas.onclick = function () {
      game.canvas.requestPointerLock();
    };
  }

  function handleFileLoad	(e) {
    nbLoaded ++;
    bar.graphics.s("#000").a(0, 0, 50, -Math.PI/2, (nbLoaded / queue.manifest.length) * (2 * Math.PI) - Math.PI/2).es();
    stage.update();
    console.log(e.item.id + " loaded.");
  }

  function handleFileError (e) {
    console.log(e.item.id + " failed.");
  }

  // to keep the canvas in full page size
  window.addEventListener('resize', resizeCanvas, false);
  function resizeCanvas() {
    if (!game) return;
    game.canvas.width = window.innerWidth;
    game.canvas.height = window.innerHeight;
  }
})();
