module.exports = {
  // a function to run the logic for this role
  /** @param {Creep} creep */
  run: function(creep) {
    // if creep is bringing energy to a structure but has no energy left
    if (creep.memory.working == true && _.sum(creep.carry) == 0) {
      // switch state
      creep.memory.working = false;
    }
    // if creep is collecting energy but is full
    else if (creep.memory.working == false &&
      creep.carry.energy == creep.carryCapacity ||
      _.sum(creep.carry) == creep.carryCapacity) {
      // switch state
      creep.memory.working = true;
    }

    // if creep is supposed to transfer to a structure
    if (creep.memory.working == true) {
      var enemyCreeps = creep.room.find(FIND_HOSTILE_CREEPS);
      var structure;

      if(enemyCreeps.length > 1){
        var structures = creep.room.find(FIND_MY_STRUCTURES, {
          filter: (s) => (s.structureType == STRUCTURE_TOWER)
        });
        structure = _.min(structures, 'energy');
      }

      // find closest spawn or extension which is not full
      if (structure == undefined) {
        structure = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
          filter: (s) => (s.structureType == STRUCTURE_SPAWN ||
              s.structureType == STRUCTURE_EXTENSION) &&
            s.energy < s.energyCapacity
        });
      }

      // put energy in nuker if there is one
      if (structure == undefined) {
        structure = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
          filter: (s) => s.structureType == STRUCTURE_NUKER &&
          s.energy < s.energyCapacity
        });
      }

      // find a tower if there aren't any spawns or extensions
      if (structure == undefined) {
        var structures = creep.room.find(FIND_MY_STRUCTURES, {
          filter: (s) => (s.structureType == STRUCTURE_TOWER)
        });
        structure = _.min(structures, 'energy');
      }

      // look for the terminal if it has less than 100k energy
      if (structure == undefined && creep.room.terminal != undefined) {
        structure = creep.room.terminal;
        if (structure.store[RESOURCE_ENERGY] >= 100000) {
          structure = undefined;
        }
      }

      // if there is nothing else to put energy in, put it in storage
      if (structure == undefined && creep.room.storage != undefined) {
        structure = creep.room.storage;
      }

      // if we found something to put it in
      if (structure != undefined) {
        // try to transfer energy, if it is not in range
        for (const resourceType in creep.carry) {
          if (creep.transfer(structure, resourceType) == ERR_NOT_IN_RANGE) {
            creep.travelTo(structure);
          }
        }
      }
    }

    // if creep is supposed to get energy
    else {
      var container;
      var controllerContainer;

      //var storage = _.filter(creep.room.find(FIND_STRUCTURES), s => s.structureType == STRUCTURE_STORAGE);

      // get energy from storage first
      if (creep.room.storage != undefined) {
        if (creep.room.storage.store[RESOURCE_ENERGY] > 10000) {
          container = creep.room.storage;
        }
      }

      // if there is nothing in storage, get energy from link by storage
      if (container == undefined) {
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
      }

      // if there is nothing in storage or if there is nothing in the link,
      // get energy from a container that isn't by the controller
      if (container == undefined) {
        // look for container by controller
        containerController = creep.room.controller.pos.findInRange(FIND_STRUCTURES, 3, {
          filter: s => s.structureType == STRUCTURE_CONTAINER
        })[0];

        // if there isn't a container by the controller, look for nearest container
        if (containerController != undefined) {
          // find closest container
          container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: s => s.structureType == STRUCTURE_CONTAINER &&
              s.store[RESOURCE_ENERGY] >= 90 &&
              s.id != containerController.id
          });
        }

        // if there is a container by the controller, look for the nearest container
        // that isn't by the controller
        else {
          container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: s => s.structureType == STRUCTURE_CONTAINER &&
              s.store[RESOURCE_ENERGY] >= 90
          });
        }
      }

      // if one was found
      if (container != undefined) {
        creep.memory.linksByMiner = container.pos.findInRange(FIND_STRUCTURES, 1, {
          filter: s => s.structureType == STRUCTURE_LINK
        });

        // try to withdraw energy, if the container is not in range
        if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          // move towards it
          creep.travelTo(container);
        }
      }
      if (container == undefined && _.sum(creep.carry) > 0){
        creep.memory.working == true;
      }
    }
  }
};
