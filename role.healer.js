module.exports = {
  // a function to run the logic for this role
  /** @param {Creep} creep */
  run: function(creep) {
    if (creep.memory.target != undefined && creep.room.name != creep.memory.target) {
      // find exit to target room
      var exit = creep.room.findExitTo(creep.memory.target);
      // move to exit
      creep.travelTo(creep.pos.findClosestByRange(exit));
      // return the function to not do anything else
      return;
    }
    if (creep.memory.partner == undefined) {
      creep.memory.partner = creep.pos.findClosestByRange(FIND_MY_CREEPS, {
        filter: function(otherCreep) {
          return otherCreep.memory.role == 'attacker' ||
          otherCreep.memory.role == 'dismantler';
        }
      });
    }
    else
    {
      partner = Game.getObjectById(creep.memory.partner.id);
      if (partner.hits < partner.hitsMax) {
        if (creep.heal(partner) == ERR_NOT_IN_RANGE) {
          creep.travelTo(partner);
        }
      }
      else if(creep.hits < creep.hitsMax){
        creep.heal(creep);
      }
      else{
        creep.travelTo(partner.pos);
      }
    }
  }
};
