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
    else if (creep.memory.working == false && _.sum(creep.carry) == creep.carryCapacity) {
      // switch state
      creep.memory.working = true;
    }

    // if creep is supposed to transfer energy to a structure
    if (creep.memory.working == true) {
      var structure = Game.getObjectById('5959b82391d54b1bd3baa6c7');

      // if we found one
      if (structure != undefined) {
        // try to transfer energy, if it is not in range
        if (creep.transfer(structure, RESOURCE_OXYGEN) == ERR_NOT_IN_RANGE) {
          // move towards it
          creep.moveTo(structure);
        }
      }
    }
    // if creep is supposed to get energy
    else {
      //find dropped energy
      const terminal = Game.getObjectById('596ce85b12cb743678d82cd0');
      if (terminal != undefined) {
        if (creep.withdraw(terminal, RESOURCE_OXYGEN) == ERR_NOT_IN_RANGE) {
          creep.moveTo(terminal);
        }
      }
    }
  }
};
