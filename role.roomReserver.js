module.exports = {
  // a function to run the logic for this role
  run: function(creep) {
    // if in target room
    if (creep.room.name != creep.memory.target) {
      // find exit to target room
      var exit = creep.room.findExitTo(creep.memory.target);
      // move to exit
      creep.travelTo(creep.pos.findClosestByRange(exit));
    }
    else {
      creep.room.findExitTo(creep.memory.home);

      if(creep.signController(creep.room.controller, "Hi. Please don't hurt me. 💗") == ERR_NOT_IN_RANGE) {
        creep.travelTo(creep.room.controller);
      }

      // try to claim controller
      // if (creep.attackController(creep.room.controller) == ERR_NOT_IN_RANGE && Game.spawns['Spawn1'].memory.claimRoom == creep.room.name) {
      //   // move towards the controller
      //   creep.travelTo(creep.room.controller);
      // }
      // try to reserve room
      if (creep.reserveController(creep.room.controller) == ERR_NOT_IN_RANGE) {
        // move towards the controller
        creep.travelTo(creep.room.controller);
      }
    }
  }
};
