module.exports = {
  // a function to run the logic for this role
  /** @param {Creep} creep */
  run: function(creep) {
    // if target is defined and creep is not in target room
    if (creep.memory.target != undefined && creep.room.name != creep.memory.target && creep.memory.working == false) {
      // find exit to target room
      var exit = creep.room.findExitTo(creep.memory.target);
      // move to exit
      creep.moveTo(creep.pos.findClosestByRange(exit));
      // return the function to not do anything else
      return;
    }
    // if creep is bringing energy to a structure but has no energy left
    if (creep.memory.working == true && creep.carry.energy == 0) {
      // switch state
      creep.memory.working = false;
    }
    // if creep is picking up energy but is full
    else if (creep.memory.working == false && creep.carry.energy == creep.carryCapacity) {
      // switch state
      creep.memory.working = true;
      delete creep.memory.targetContainer;
    }

    // if creep is supposed to transfer energy to a structure
    if (creep.memory.working == true) {
      // if in home room
      if (creep.room.name == creep.memory.home) {
        var structure;
        // look for the link structure if spawn is full
        if(creep.memory.target == 'E62S92'){
            if(creep.room.energyAvailable == creep.room.energyCapacityAvailable){
                structure = Game.rooms['E61S92'].lookForAt('structure', 34, 33)[0];
                if (structure.energy >= (structure.energyCapacity / 2))
                {
                    structure == undefined;
                }
            }
        }

        // if the link structure isn't there or if it's full
        if (structure == undefined || structure.energy == structure.energyCapacity) {
          // find closest spawn, extension or tower which is not full
          var structure = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
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
              (s.energyCapacity - s.energy) >= _.sum(creep.carry)
          });
        }

        // look for the terminal first if it has less than 100k energy
        if (structure == undefined && creep.room.terminal != undefined) {
          structure = creep.room.terminal;
          if (structure.store[RESOURCE_ENERGY] >= 100000) {
            structure = undefined;
          }
        }

        // if there are no spawns, extensions or towers that aren't full
        if (structure == undefined) {
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
      // if not in target room
      else {
        // find exit to target room
        var exit = creep.room.findExitTo(creep.memory.home);
        // move to exit
        creep.moveTo(creep.pos.findClosestByRange(exit));
      }
    }
    // if creep is supposed to get energy
    else {
        const droppedResource = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES);
        if(droppedResource){
            if(creep.pickup(droppedResource) == ERR_NOT_IN_RANGE) {
                creep.moveTo(droppedResource);
            }
        }
      // if creep is in target room
      if (creep.room.name == creep.memory.target) {
        // if creep doesn't already have a target container in memory
        if (creep.memory.targetContainer == undefined)
        {
          // Find the container with the most energy and isn't empty.
          var target = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
              return (structure.structureType == STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] > 0);
            }
          });

          if (target.length) {
            var allContainer = [];
            // Calculate the percentage of energy in each container.
            for (var i = 0; i < target.length; i++) {
              allContainer.push({
                energyPercent: ((target[i].store.energy / target[i].storeCapacity) * 100),
                id: target[i].id
              });
            }
            // Get the container containing the most energy.
            var highestContainer = _.max(allContainer, function(container) {
              return container.energyPercent;
            });

            // set the target in memory so the creep dosen't
            // change target in the middle of the room.
            creep.memory.targetContainer = highestContainer.id;
          }
        }

        // if creep has a target container
        if (creep.memory.targetContainer != undefined) {
          // try to withdraw energy, if the container is not in range
          let container = Game.getObjectById(creep.memory.targetContainer);
          if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            // move towards it
            creep.moveTo(container);
          }
        }
      }

      // if not in target room
      else {
        // find exit to target room
        var exit = creep.room.findExitTo(creep.memory.target);
        // move to exit
        creep.moveTo(creep.pos.findClosestByRange(exit));
      }
    }
  }
};
