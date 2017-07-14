module.exports = {
  // a function to run the logic for this role
  run: function(creep) {
    // if in target room
    if (creep.room.name != creep.memory.target) {
      // find exit to target room
      var exit = creep.room.findExitTo(creep.memory.target);
      // move to exit
      creep.moveTo(creep.pos.findClosestByRange(exit));
    } else {
      creep.room.findExitTo(creep.memory.home);
      // try to claim controller
      if (creep.claimController(creep.room.controller) == ERR_NOT_IN_RANGE) {
        // move towards the controller
        creep.moveTo(creep.room.controller);
      }
      // if global control level is too low
      else if (creep.claimController(creep.room.controller) == ERR_GCL_NOT_ENOUGH) {
        // try to reserve room
        if (creep.reserveController(creep.room.controller) == ERR_NOT_IN_RANGE) {
          // move towards the controller
          creep.moveTo(creep.room.controller);
        }
      }
    }
  }
};
