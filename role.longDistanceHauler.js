module.exports = {
  // a function to run the logic for this role
  /** @param {Creep} creep */
  run: function(creep) {
    // if target is defined and creep is not in target room
    if (creep.memory.target != undefined &&
      creep.room.name != creep.memory.target &&
      creep.memory.working == false) {
      // find exit to target room
      var exit = creep.room.findExitTo(creep.memory.target);
      // move to exit
      creep.travelTo(creep.pos.findClosestByRange(exit));
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
        creep.depositEnergy();
      }

      // if not in target room
      else {
        // find exit to target room
        var exit = creep.room.findExitTo(creep.memory.home);
        // move to exit
        creep.travelTo(creep.pos.findClosestByRange(exit));
      }
    }

    // if creep is supposed to get energy
    else {
      // if creep is in target room
      if (creep.room.name == creep.memory.target) {
        // if creep doesn't already have a target container in memory
        if (creep.memory.targetContainer == undefined) {
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
            creep.travelTo(container);
          }
        }

        // if creep cannot find a target container, move to the idle flag
        else {
          // idleFlag = _.find(Game.flags, (c) =>
          //   c.room.name == creep.memory.target);
          // if (idleFlag != undefined) {
          //   if (!creep.pos.inRangeTo(idleFlag, 1)) {
          //     creep.travelTo(idleFlag.pos);
          //   }
          // }
        }
      }

      // if not in target room
      else {
        // find exit to target room
        var exit = creep.room.findExitTo(creep.memory.target);
        // move to exit
        creep.travelTo(creep.pos.findClosestByRange(exit));
      }
    }
  }
};
