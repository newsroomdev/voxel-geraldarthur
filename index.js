var createEngine = require('voxel-engine');
var walk = require('voxel-walk');
var sky = require('voxel-sky');
var highlight = require('voxel-highlight');
var fly = require('voxel-fly');
var createDrone = require('voxel-drone');

// World Generator
// create world, attach to document, engage!
var game = createEngine({
  generate: function(x, y, z) {
    return (Math.sqrt(x*x + y*y + z*z) > 20 || y*y > 10) ? 0 : (Math.random() * 2) + 1;
  },
  chunkDistance: 2,
  texturePath: './textures/',
  materials: [
    'obsidian',
    ['grass', 'dirt', 'grass_dirt'],
    'grass',
    'plank'
  ],
  worldOrigin: [0, 0, 0],
  lightsDisabled: false,
});
var container = document.body;
game.appendTo(container);

var createSky = require('voxel-sky')(game);
var sky = createSky();
game.on('tick', sky);

// add some trees
var createTree = require('voxel-forest');
for (var i = 0; i < 20; i++) {
  createTree(game, { bark: 4, leaves: 3 });
}

// Player Generator
// add gerald
var createPlayer = require('voxel-player')(game);
var gerald = createPlayer('./textures/geraldarthur.png');
gerald.possess();
gerald.yaw.position.set(2, 14, 4);

// Interaction & Events
// highlight blocks, hold <Ctrl> for block placement
var blockPosPlace, blockPosErase
var hl = game.highlighter = highlight(game, { color: 0xff0000 })
hl.on('highlight', function (voxelPos) { blockPosErase = voxelPos })
hl.on('remove', function (voxelPos) { blockPosErase = null })
hl.on('highlight-adjacent', function (voxelPos) { blockPosPlace = voxelPos })
hl.on('remove-adjacent', function (voxelPos) { blockPosPlace = null })

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

// fly
// var makeFly = fly(game);
// makeFly(gerald);
// makeFly(game.controls.target());

// walk
game.on('tick', function() {
  walk.render(gerald.playerSkin);
  var vx = Math.abs(gerald.velocity.x);
  var vz = Math.abs(gerald.velocity.z);
  if (vx > 0.001 || vz > 0.001) walk.stopWalking();
  else walk.startWalking();
})

// ability to explode voxels
var explode = require('voxel-debris')(game);
game.on('mousedown', function (pos) {
  if (erase) explode(pos);
  else game.createBlock(pos, 1);
});
var erase = true;
function ctrlToggle (ev) { erase = !ev.ctrlKey }
window.addEventListener('keydown', ctrlToggle);
window.addEventListener('keyup', ctrlToggle);

window.addEventListener('keydown', function (ev) {
  if (ev.keyCode === 'R'.charCodeAt(0)) gerald.toggle()
})

// Drone Generator
// create a drone
// create a drone
var drone = window.drone = createDrone(game);
var item = drone.item();
item.mesh.position.set(0, -1200, -300);
game.addItem(item);

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

