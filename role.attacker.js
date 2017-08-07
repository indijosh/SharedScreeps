module.exports = {
  // a function to run the logic for this role
  /** @param {Creep} creep */
  run: function(creep) {
    // if target is defined and creep is not in target room
    if (creep.memory.target != undefined && creep.room.name != creep.memory.target) {
      // find exit to target room
      var exit = creep.room.findExitTo(creep.memory.target);
      // move to exit
      creep.moveTo(creep.pos.findClosestByRange(exit));
      // return the function to not do anything else
      return;
    }
    // if creep is in target room, find nearest hostile creep
    else {
      // find nearest hostile creep
      var creepTarget = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
      // if there is a hostile creep target
      if (creepTarget != undefined) {
        // if hostile creep is in range
        if (creep.attack(creepTarget) != ERR_NOT_IN_RANGE) {
          // ATTACK!
          creep.attack(creepTarget);
          creep.say("ATTACK 🗡️");
          // if hostile creep is not in range
        } else if (creep.attack(creepTarget) == ERR_NOT_IN_RANGE) {
          // move towards hostile creep
          creep.moveTo(creepTarget);
        }
      }
      // if there is NOT a hostile creep
      else {
        // find a hostile structure
        var structureTarget = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES);
        // if there is a hostile structure
        if (structureTarget != undefined) {
          // if hostile structure is in range
          if (creep.attack(structureTarget) != ERR_NOT_IN_RANGE) {
            // ATTACK!
            creep.attack(structureTarget);
            creep.say("ATTACK 🗡️");
            // if the hostile structure is NOT in range
          } else if (creep.attack(structureTarget) == ERR_NOT_IN_RANGE) {
            // move towards hostile structure
            creep.moveTo(structureTarget);
          }
        }
        else{
          flagName = "idle" + creep.memory.target;
          flag = Game.flags[flagName];
          if (flag){
            creep.moveTo(flag);
          }
        }
      }
    }
  }
};
