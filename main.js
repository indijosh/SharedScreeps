var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var desiredNumberOfHarvesters = 2
var desiredNumberOfBuilders = 2
var maxNumberOfCreeps = 4

module.exports.loop = function() {
  for (var name in Memory.creeps) {
    if (!Game.creeps[name]) {
      delete Memory.creeps[name];
      console.log('Clearing non-existing creep memory:', name);
    }
  }
	var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');

  if (Object.keys(Game.creeps).length < maxNumberOfCreeps) {
    if (harvesters.length < desiredNumberOfHarvesters) {
      var newName = Game.spawns['Spawn1'].createCreep([WORK, WORK, WORK, MOVE, MOVE, CARRY], undefined, {
        role: 'harvester'
      });
      console.log('Spawning new harvester: ' + newName);
    }

    var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
    if (builders.length < desiredNumberOfBuilders) {
      var newName = Game.spawns['Spawn1'].createCreep([WORK, WORK, WORK, MOVE, MOVE, CARRY], undefined, {
        role: 'builder'
      });
      console.log('Spawning new builder: ' + newName);
    }
  }

  if (Game.spawns.Spawn1.room.energyAvailable, Game.spawns.Spawn1.room.energyCapacityAvailable) {
    if (harvesters.length < 1) {
      for (var name in Game.creeps) {
        var creep = Game.creeps[name];
        if (creep.memory.role == 'upgrader') {
          creep.memory.role == 'harvester';
        }
      }
    }

  }

  if (Game.spawns['Spawn1'].spawning) {
    var spawningCreep = Game.creeps[Game.spawns['Spawn1'].spawning.name];
    Game.spawns['Spawn1'].room.visual.text(
      '🛠️' + spawningCreep.memory.role,
      Game.spawns['Spawn1'].pos.x + 1,
      Game.spawns['Spawn1'].pos.y, {
        align: 'left',
        opacity: 0.8
      });
  }

  for (var name in Game.creeps) {
    var creep = Game.creeps[name];
    if (creep.memory.role == 'harvester') {
      roleHarvester.run(creep);
    }
    if (creep.memory.role == 'upgrader') {
      roleUpgrader.run(creep);
    }
    if (creep.memory.role == 'builder') {
      roleBuilder.run(creep);
    }
  }
}
