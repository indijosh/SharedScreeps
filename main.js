var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var maxNumberOfCreeps = 8;
var currentNumberOfCreeps = Object.keys(Game.creeps).length;

module.exports.loop = function() {
  for (var name in Memory.creeps) {
    if (!Game.creeps[name]) {
      delete Memory.creeps[name];
      console.log('Clearing non-existing creep memory:', name);
    }
  }
  const extensions = Game.spawns.Spawn1.room.find(FIND_MY_STRUCTURES, {
    filter: (structure) => {
      return (structure.structureType == STRUCTURE_EXTENSION)
    }
  });
  if (currentNumberOfCreeps < maxNumberOfCreeps && currentNumberOfCreeps != 0) {
    if (Game.spawns.Spawn1.room.energyAvailable >= 550) {
      var newName = Game.spawns['Spawn1'].createCreep([WORK, WORK, WORK, WORK, MOVE, MOVE, CARRY], undefined, {
        role: 'harvester'
      });
      console.log('Spawning new harvester: ' + newName);
    } else {
      console.log('Can not afford new harvester. Energy Available: ', Game.spawns.Spawn1.room.energyAvailable, ' / 550');
    }
  }
  if (Game.spawns.Spawn1.room.energyCapacityAvailable < 550) {
    console.log('true');
    var newName = Game.spawns['Spawn1'].createCreep([WORK, MOVE, CARRY], undefined, {
      role: 'harvester'
    });
  }

  if (Game.spawns.Spawn1.room.energyAvailable < Game.spawns.Spawn1.room.energyCapacityAvailable) {
    var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
    if (harvesters.length < 1) {
      for (var name in Game.creeps) {
        var creep = Game.creeps[name];
        if (creep.memory.role == 'upgrader') {
          creep.memory.upgrading = false;
          creep.memory.role == 'harvester';
        }
      };
    }
  }

  if (Game.spawns['Spawn1'].spawning) {
    var spawningCreep = Game.creeps[Game.spawns['Spawn1'].spawning.name];
    Game.spawns['Spawn1'].room.visual.text(
      //'🛠️' + spawningCreep.memory.role,
      '🛠️' + 'Spawning creep',
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
