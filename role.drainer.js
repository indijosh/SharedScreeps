module.exports = {
  // a function to run the logic for this role
  /** @param {Creep} creep */
  run: function(creep) {
    if (creep.memory.retreating == true) {
      if (creep.room.name == creep.memory.retreatTarget) {
        var exit = creep.room.findExitTo(creep.memory.target);
        var exitPos = creep.pos.findClosestByRange(exit);
        var distanceFromTargetRoom = creep.pos.getRangeTo(exitPos);
        if (distanceFromTargetRoom < 2) {
          var exit = creep.room.findExitTo(creep.memory.home);
          // move to exit
          creep.travelTo(creep.pos.findClosestByRange(exit));
        } else {
          creep.memory.retreating = false;
        }
      } else {
        var exit = creep.room.findExitTo(creep.memory.retreatTarget);
        // move to exit
        creep.travelTo(creep.pos.findClosestByRange(exit));
        return
      }
    }
    else
    {
      if (creep.hits < creep.hitsMax)
      {
        creep.heal(creep);
        creep.memory.retreating = true;
      }
      else
      {
        const target = creep.pos.findClosestByRange(FIND_MY_CREEPS, {
          filter: function(object) {
            return object.hits < object.hitsMax;
          }
        });
        if (target && creep.heal(target) != ERR_NOT_IN_RANGE)
        {
          creep.heal(target)
        }
        else
        {
          if (creep.room.name != creep.memory.target)
          {
            // find exit to target room
            var exit = creep.room.findExitTo(creep.memory.target);
            // move to exit
            creep.travelTo(creep.pos.findClosestByRange(exit));
            // return the function to not do anything else
            return;
          }
        }
      }
    }
  }
};
