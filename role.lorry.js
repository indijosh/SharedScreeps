module.exports = {
  // a function to run the logic for this role
  /** @param {Creep} creep */
  run: function(creep) {
    // if creep is bringing energy to a structure but has no energy left
    if (creep.memory.working == true && creep.carry.energy == 0) {
      // switch state
      creep.memory.working = false;
    }
    // if creep is harvesting energy but is full
    else if (creep.memory.working == false && creep.carry.energy == creep.carryCapacity) {
      // switch state
      creep.memory.working = true;
    }

    // if creep is supposed to transfer energy to a structure
    if (creep.memory.working == true) {
      var structure;

      // find closest spawn, extension or tower which is not full
      if (structure == undefined) {
        // find closest spawn, extension or tower which is not full
        structure = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
          // the second argument for findClosestByPath is an object which takes
          // a property called filter which can be a function
          // we use the arrow operator to define it
          filter: (s) => (s.structureType == STRUCTURE_SPAWN ||
              s.structureType == STRUCTURE_EXTENSION) &&
            s.energy < s.energyCapacity
        });
      }
      // find a tower if there aren't any spawns or extensions
      if (structure == undefined){
        structure = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
          filter: (s) => (s.structureType == STRUCTURE_TOWER) &&
            s.energy < s.energyCapacity
        });
      }

      // look for the terminal first if it has less than 100k energy
      if (structure == undefined && creep.room.terminal != undefined) {
        structure = creep.room.terminal;
        if (structure.energy >= 100000) {
          structure = undefined;
        }
      }

      if (structure == undefined && creep.room.storage != undefined) {
        structure = creep.room.storage;
      }

      // if we found one
      if (structure != undefined) {
        // try to transfer energy, if it is not in range
        if (creep.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          // move towards it
          creep.moveTo(structure);
        }
      }
    }
    // if creep is supposed to get energy
    else {
      //find dropped energy
      //let droppedResources = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES)
      //if (droppedResources == undefined) {
        // find closest container
        let container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
          filter: s => s.structureType == STRUCTURE_CONTAINER &&
            s.store[RESOURCE_ENERGY] >= 90
        });
        // if there is no dropped energy or container with energy
        if (container == undefined) {
          // find a storage container to draw energy from
          container = creep.room.storage;
        }

        // if one was found
        if (container != undefined) {
          // try to withdraw energy, if the container is not in range
          if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            // move towards it
            creep.moveTo(container);
          }
        }
      } //else if (droppedResources != undefined) {
        //if (creep.pickup(droppedResources) == ERR_NOT_IN_RANGE) {
        //  creep.moveTo(droppedResources);
        //}
      //}
    //}
  }
};
