module.exports = {
  // a function to run the logic for this role
  /** @param {Creep} creep */
  run: function(creep) {
    // if the creep doesn't have a partner
    if (creep.memory.partner == undefined) {
      // find a creep with the attack parts
      const target = creep.pos.findClosestByRange(FIND_MY_CREEPS, {
        filter: function(otherCreeps) {
          return otherCreeps.memory.role == 'attacker' &&
            otherCreeps.memory.parter == undefined;
        }
      });
      if (target != undefined) {
        creep.memory.partner = target.id;
        target.memory.partner = creep.id;
      }
    }

    if (creep.memory.partner != undefined) {
      var partner = Game.getObjectById(creep.memory.partner);
      if(partner != undefined){
        var targetNeedsHealing;

        if (creep.room.name != partner.room.name) {
          // find exit to target room
          var exit = creep.room.findExitTo(creep.memory.partner);
          // move to exit
          creep.moveTo(creep.pos.findClosestByRange(exit));
        }
        if (creep.hits < creep.hitsMax) {
          creep.heal(creep);
        }
        else if (partner.hits < partner.hitsMax) {
          if (creep.heal(partner) == ERR_NOT_IN_RANGE) {
            creep.moveTo(partner);
          }
        }
        else {
          targetNeedsHealing = creep.pos.findClosestByRange(FIND_MY_CREEPS, {
            filter: function(object) {
              return object.hits < object.hitsMax;
            }
          });
          // if there are any damaged creeps, move to them and heal them
        }
        if (targetNeedsHealing) {
          if (creep.heal(targetNeedsHealing) == ERR_NOT_IN_RANGE) {
            creep.moveTo(targetNeedsHealing);
          }
        }
        else{
          creep.moveTo(partner.pos);
        }
      }
    }
  }
};
