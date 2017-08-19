module.exports = {
  // a function to run the logic for this role
  /** @param {Creep} creep */
  run: function(creep) {
    if(creep.hits < creep.hitsMax){
      creep.move(BOTTOM);
      creep.heal(creep);
    }
    else{
      if (creep.memory.target == undefined) {
        creep.memory.target = Game.flags.Flag1
      } else if (creep.room.name != creep.memory.target.room.name) {
        // find exit to target room
        var exit = creep.room.findExitTo(creep.memory.target.room.name);
        // move to exit
        creep.moveTo(creep.pos.findClosestByRange(exit));
        // return the function to not do anything else
        return;
      } else if (creep.room.name == creep.memory.target.room.name) {
        const target = creep.pos.findClosestByRange(FIND_MY_CREEPS, {
          filter: function(object) {
            return object.hits < object.hitsMax;
          }
        });
        if (target) {
          if (creep.heal(target) == ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
            creep.say("🚑 HEALING")
          }
        }
        else if(creep.pos != Game.flags.Flag1){
          creep.moveTo(Game.flags.Flag1);
        }
      }
    }
  }
};
