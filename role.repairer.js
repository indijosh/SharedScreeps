var roleBuilder = require('role.builder');

module.exports = {
  // a function to run the logic for this role
  /** @param {Creep} creep */
  run: function(creep) {
    // if creep is trying to repair something but has no energy left
    if (creep.memory.working == true && creep.carry.energy == 0) {
      // switch state
      creep.memory.working = false;
    }
    // if creep is harvesting energy but is full
    else if (creep.memory.working == false && creep.carry.energy == creep.carryCapacity) {
      // switch state
      creep.memory.working = true;
    }

    // if creep is supposed to repair something
    if (creep.memory.working == true) {
      // find closest structure with less than max hits
      // Exclude walls because they have way too many max hits and would keep
      // our repairers busy forever. We have to find a solution for that later.
      var structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
          // the second argument for findClosestByPath is an object which takes
          // a property called filter which can be a function
          // we use the arrow operator to define it
          filter: (s) => s.hits < s.hitsMax &&
          s.structureType != STRUCTURE_WALL &&
          s.structureType != STRUCTURE_RAMPART
      });
      if (structure == undefined) {
        var structure = creep.room.find(FIND_STRUCTURES, {
          // the second argument for findClosestByPath is an object which takes
          // a property called filter which can be a function
          // we use the arrow operator to define it
          filter: (s) => s.hits < 1000000 &&
            s.structureType == STRUCTURE_RAMPART
        });
        var lowest = structure[0]
        for (ram in structure) {
          if (structure[ram].hits < lowest.hits) {
            lowest = structure[ram];
          }
        }
        if (structure.length > 0) {
          if (creep.repair(lowest) == ERR_NOT_IN_RANGE) {
            creep.travelTo(lowest);
          }
        }
      }
      // if we find one
      else {
        // try to repair it, if it is out of range
        if (creep.repair(structure) == ERR_NOT_IN_RANGE) {
          // move towards it
          creep.travelTo(structure);
        }
      }

      // if we can't find one
      if (structure == undefined) {
        roleBuilder.run(creep);
      }
    }

    // if creep is supposed to get energy
    else {
      creep.getEnergy(true, true);
    }
  }
};
