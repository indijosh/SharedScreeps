module.exports = {
  // a function to run the logic for this role
  /** @param {Creep} creep */
  run: function(creep) {
    // if creep is bringing energy to a structure but has no energy left
    if (creep.memory.working == true && _.sum(creep.carry) == 0) {
      // switch state
      creep.memory.working = false;
    }
    // if creep is harvesting energy but is full
    else if (creep.memory.working == false &&
      creep.carry.energy == creep.carryCapacity ||
      _.sum(creep.carry) == creep.carryCapacity) {
      // switch state
      creep.memory.working = true;
    }
    // if creep is supposed to transfer to a structure
    if (creep.memory.working == true) {
      var structure;
      if (creep.carry.H > 0) {
        var structure = creep.room.terminal;
      }

      // find closest spawn or extension which is not full
      if (structure == undefined) {
        // find closest spawn or extension which is not full
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
      if (structure == undefined) {
        structure = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
          filter: (s) => (s.structureType == STRUCTURE_TOWER) &&
            s.energy < s.energyCapacity
        });
      }

      // look for the terminal first if it has less than 100k energy
      if (structure == undefined && creep.room.terminal != undefined) {
        structure = creep.room.terminal;
        if (structure.store[RESOURCE_ENERGY] >= 100000) {
          structure = undefined;
        }
      }

      // if there is nothing else to put it in, put it in storage
      if (structure == undefined && creep.room.storage != undefined) {
        structure = creep.room.storage;
      }

      // if we found something to put it in
      if (structure != undefined) {
        // try to transfer energy, if it is not in range
        for (const resourceType in creep.carry) {
          if (creep.transfer(structure, resourceType) == ERR_NOT_IN_RANGE) {
            creep.moveTo(structure);
          }
        }
      }
    }
    // if creep is supposed to get energy
    else {
      var container;
      // look for link by storage
      var links = _.filter(creep.room.find(FIND_STRUCTURES), s => s.structureType == STRUCTURE_LINK);

      // for each link in the room
      for (let link of links) {
        let isStorageLink = link.pos.findInRange(FIND_STRUCTURES, 2, {
          filter: s => s.structureType == STRUCTURE_STORAGE
        })[0];
        if (isStorageLink != undefined && link.energy > 0) {
          container = link;
        }
      }

      if (container == undefined) {
        // find closest container
        container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
          filter: s => s.structureType == STRUCTURE_CONTAINER &&
            s.store[RESOURCE_ENERGY] >= 90
        });
      }

      // if there is no dropped energy or container with energy
      if (container == undefined && creep.room.energyAvailable != creep.room.energyCapacityAvailable) {
        // find a storage container to draw energy from
        container = creep.room.storage;
      }

      // if one was found
      if (container != undefined) {
        creep.memory.linksByMiner = container.pos.findInRange(FIND_STRUCTURES, 1, {
          filter: s => s.structureType == STRUCTURE_LINK
        });

        // try to withdraw energy, if the container is not in range
        if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          // move towards it
          creep.moveTo(container);
        }
      }
    }
  }
};
