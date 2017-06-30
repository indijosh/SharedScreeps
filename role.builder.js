var roleBuilder = {

  /** @param {Creep} creep **/
  run: function(creep) {
    if (creep.memory.building && creep.carry.energy == 0) {
      creep.memory.building = false;
      creep.say('🔄 harvest');
    }
    if (!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
      creep.memory.building = true;
      creep.say('🚧 build');
    }

    if (creep.memory.building) {
      //Find Construction Sites
      var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
      if (targets.length > 0) {
        if (creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
          creep.moveTo(targets[0], {
            visualizePathStyle: {
              stroke: '#ffffff'
            }
          });
        }
      } else {
        //Find Damaged Structutes
        var closestDamagedStructure = creep.pos.findClosestByRange(FIND_STRUCTURES, {
          filter: (structure) => structure.hits < 650 && structure.hits > 0
        });
        if (closestDamagedStructure) {
          creep.moveTo(closestDamagedStructure)
          creep.repair(closestDamagedStructure);
        } else {
          creep.memory.building = false;
          creep.memory.role = 'upgrader';
        }
      }

      //Find Path to Harvest if Not Building
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

module.exports = roleBuilder;
