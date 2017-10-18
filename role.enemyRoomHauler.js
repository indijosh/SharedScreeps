module.exports = {
  // a function to run the logic for this role
  /** @param {Creep} creep */
  run: function(creep) {
    const totalCarryAmount = _.sum(creep.carry);
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
    if (creep.memory.working == true && totalCarryAmount == 0) {
      if(creep.ticksToLive > 200){
        // switch state
        creep.memory.working = false;
      }
      else{
        creep.suicide();
      }
    }
    // if creep is picking up energy but is full
    else if (creep.memory.working == false && totalCarryAmount == creep.carryCapacity) {
      // switch state
      creep.memory.working = true;
    }

    // if creep is supposed to transfer minerals to a structure
    if (creep.memory.working == true) {
      if(creep.room.name == creep.memory.home){
        var terminal = creep.pos.findClosestByPath(FIND_STRUCTURES, {
          filter: s => (s.structureType == STRUCTURE_TERMINAL)
        });
        if(terminal != undefined){
          if (creep.transfer(terminal, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            // move towards it
            creep.travelTo(terminal);
          }
        }
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
        var enemyTerminal = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {
          filter: s => (s.structureType == STRUCTURE_TERMINAL)
        });
        if(enemyTerminal != undefined){
          if (creep.withdraw(enemyTerminal, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            // move towards it
            creep.travelTo(enemyTerminal);
          }
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
