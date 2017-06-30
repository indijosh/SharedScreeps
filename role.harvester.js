var roleHarvester = {

  /** @param {Creep} creep **/
  run: function(creep) {
    if (creep.memory.transporting && creep.carry.energy == 0) {
      creep.memory.transporting = false;
      creep.say('🔄 harvest');
    }
    if (!creep.memory.transporting && creep.carry.energy == creep.carryCapacity) {
      creep.memory.transporting = true;
      creep.say('🚛 haul');
    }

    if (creep.memory.transporting) {
      const extensions = creep.room.find(FIND_MY_STRUCTURES, {
        filter: (structure) => {
          return (structure.structureType == STRUCTURE_EXTENSION && structure.energy < structure.energyCapacity)
        }
      });
      if (extensions.length > 0) {
        if (creep.transfer(extensions[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveTo(extensions[0], {
            visualizePathStyle: {
              stroke: '#ffffff'
            }
          });
        }
      } else if (Game.spawns['Spawn1'].energy < Game.spawns['Spawn1'].energyCapacity) {
        if (creep.transfer(Game.spawns.Spawn1, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveTo(Game.spawns.Spawn1, {
            visualizePathStyle: {
              stroke: '#ffffff'
            }
          });
        }
      } else if(Object.keys(Game.creeps).length < 8){
        creep.memory.transporting = 'false';
      }
      else{
        creep.memory.transporting = 'false';
        creep.memory.role = 'builder';
      }
    } else {
      var sources = creep.room.find(FIND_SOURCES);
      if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
        creep.moveTo(sources[0], {
          visualizePathStyle: {
            stroke: '#ffaa00'
          }
        });
      }
    }
  }
};
module.exports = roleHarvester;
