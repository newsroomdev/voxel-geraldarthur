var createEngine = require('voxel-engine');
var createDrone = require('voxel-drone');
var walk = require('voxel-walk');
var highlight = require('voxel-highlight');
var sky = require('voxel-sky');

var urls = {
  "brothel": "http://a.tiles.mapbox.com/v3/geraldrich.HStreets/page.html#10.00/29.7488/-95.2185",
  "class-act": "https://github.com/geraldarthur",
  "houston": "http://data.codeforhouston.com/",
  "fatalities": "http://app1.kuhf.org/vehicle-fatalities-texas.html",
  "homepage": "http://geraldarthur.com/",
  "nprapps": "http://blog.apps.npr.org/2013/06/06/how-to-setup-a-developers-environment.html",
  "texas": "http://www.dailytexanonline.com/search/site/gerald%20rich",
  "tt": "http://www.texastribune.org/search/?q=gerald+rich&x=-1081&y=-128",
  "tumblr": "http://storyboard.tumblr.com/post/27329227111/dear-class-of-2012-now-what-although-theres"
}

var links = Object.keys(urls)

// World Generator
// create world, attach to document, engage!
var game = createEngine({
  generate: function(x, y, z) {
    return (Math.sqrt(x*x + y*y + z*z) > 20 || y*y > 10) ? 0 : (Math.random() * 2) + 1;
  },
  texturePath: './textures/',
  materials: ['dirt', 'grass'].concat(links),
  controls: { discreteFire: true }
});
game.appendTo(document.body);

var createSky = require('voxel-sky')(game);
var sky = createSky();
game.on('tick', sky);

var z = -5;
var y = 5;
links.map(function(slide) {
  game.setBlock([0, y, z], slide);
  z += 2;
  if (z > 5) {
    z = -5,
    y += 2
  }
});

game.on('setBlock', function(pos, val, old) {
  if (old === 1 || val === 1) return
  var url = urls[links[old - 3]]
  window.open(url, "_blank")
})

// Player Generator
// add gerald
var createPlayer = require('voxel-player')(game);
var gerald = createPlayer('./textures/geraldarthur.png');
gerald.possess();
gerald.yaw.position.set(2, 14, 4);

// Interaction & Events
// highlight blocks, hold <Ctrl> for block placement
var blockPosPlace, blockPosErase;
var hl = game.highlighter = highlight(game, { color: 0xff0000 });
hl.on('highlight', function (voxelPos) { blockPosErase = voxelPos });
hl.on('remove', function (voxelPos) { blockPosErase = null });
hl.on('highlight-adjacent', function (voxelPos) { blockPosPlace = voxelPos });
hl.on('remove-adjacent', function (voxelPos) { blockPosPlace = null });

// create blocks
var currentMaterial = 1;

game.on('fire', function (target, state) {
  var position = blockPosPlace;
  if (position) {
    game.createBlock(position, currentMaterial);
  }
  else {
    position = blockPosErase;
    if (position) game.setBlock(position, 0);
  }
})

// // fly
// // var makeFly = fly(game);
// // makeFly(gerald);
// // makeFly(game.controls.target());

// walk
game.on('tick', function() {
  walk.render(gerald.playerSkin);
  var vx = Math.abs(gerald.velocity.x);
  var vz = Math.abs(gerald.velocity.z);
  if (vx > 0.001 || vz > 0.001) walk.stopWalking();
  else walk.startWalking();
})

window.addEventListener('keydown', function (ev) {
  if (ev.keyCode === 'R'.charCodeAt(0)) gerald.toggle();
})

game.interact.on('release', function() { game.paused = true });
game.interact.on('attain', function() { game.paused = false });

// Drone Generator
// create a drone
var drone = createDrone(game);
game.addItem(drone.item());

// show the video monitor
// drone.viewCamera();

// handle entering a command
window.addEventListener('keyup', function(e) {
  if (e.keyCode !== 13) return;
  var el = document.getElementById('cmd');
  if (document.activeElement === el) {
    var cmd = el.value, res;
    try {
      if (cmd.indexOf('(') === -1) {
        // logo ftw!
        logodrone.convertAndSend(cmd);
      } else if (el.value !== '') {
        res = eval('drone.' + el.value);
      }
    } catch (err) {
      res = err.message;
    }
    el.setAttribute('placeholder', res);
    el.value = '';
    el.blur();
  } else {
    el.focus();
  }
});

// log navdata
var battery = document.querySelector('#battery');
drone.on('navdata', function(data) {
  battery.innerHTML = data.demo.batteryPercentage + '%';
  //console.log(data);
});

