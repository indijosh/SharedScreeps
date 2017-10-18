module.exports = {
  // a function to run the logic for this role
  /** @param {Creep} creep */
  run: function(creep) {
    // if creep is bringing energy to the controller but has no energy left
    if (creep.memory.working == true && creep.carry.energy == 0) {
      // switch state
      creep.memory.working = false;
    }
    // if creep is harvesting energy but is full
    else if (creep.memory.working == false && creep.carry.energy == creep.carryCapacity) {
      // switch state
      creep.memory.working = true;
    }

    // if creep is supposed to transfer energy to the controller
    if (creep.memory.working == true) {
      // instead of upgraderController we could also use:
      // if (creep.transfer(creep.room.controller, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {

      // try to upgrade the controller
      if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
        // if not in range, move towards the controller
        creep.travelTo(creep.room.controller);
      }
    }


    // if creep is supposed to get energy
    else {
      var controller = creep.room.controller;

      // find links by the controller
      let controllerLink = controller.pos.findInRange(FIND_STRUCTURES, 3, {
        filter: s => s.structureType == STRUCTURE_LINK
      })[0];

      // if a link is found and it has enough energy...
      if (controllerLink != undefined &&
        controllerLink.energy >= creep.carryCapacity) {
        if (creep.withdraw(controllerLink, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          // move towards it
          creep.travelTo(controllerLink);
        }
      }

      // if there is no link or if the link doesn't have enough energy,
      // look for a container by controller
      if (controllerLink == undefined || controllerLink.energy < creep.carryCapacity) {
        // find a container by the controller
        let controllerContainer = controller.pos.findInRange(FIND_STRUCTURES, 3, {
          filter: s => s.structureType == STRUCTURE_CONTAINER
        })[0];
        // if one is found and it had enough energy...
        if (controllerContainer != undefined &&
          controllerContainer.store[RESOURCE_ENERGY] >= creep.carryCapacity) {
          if (creep.withdraw(controllerContainer, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            // move towards it
            creep.travelTo(controllerContainer);
          }
        }
        // if no link or no container is found...
        else {
          creep.getEnergy(true, true);
        }
      }
    }
  }
};
