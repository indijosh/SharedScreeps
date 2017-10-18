module.exports = {
  // a function to run the logic for this role
  /** @param {Creep} creep */
  run: function(creep) {
    var isAttackingWalls = true,
      isAttackingHostileStructures = false;
    // if target is defined and creep is not in target room
    if (creep.memory.target != undefined && creep.room.name != creep.memory.target) {
      // find exit to target room
      var exit = creep.room.findExitTo(creep.memory.target);
      // move to exit
      creep.travelTo(creep.pos.findClosestByRange(exit));
      // return the function to not do anything else
      return;
    }

    // if creep is in target room, find nearest hostile structure
    var target;
    if(creep.memory.target == 'E14S12'){
      target = Game.getObjectById('5985f250a689d74fc7f68724');
      if (creep.dismantle(target) == ERR_NOT_IN_RANGE) {
        creep.travelTo(target);
      }
    }
    else{
      if (isAttackingWalls && target == undefined) {
        target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
          filter: {
            structureType: STRUCTURE_WALL
          }
        });
        if (target) {
          if (creep.dismantle(target) == ERR_NOT_IN_RANGE) {
            creep.travelTo(target);
          }
        }
      }
      // if there is NOT a hostile creep
      else if (isAttackingHostileStructures && target == undefined) {
        if (target == undefined) {
          // find a hostile structure
          target = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {
            // the second argument for findClosestByPath is an object which takes
            // a property called filter which can be a function
            // we use the arrow operator to define it
            filter: (s) => (s.structureType == STRUCTURE_EXTENSION)
          });
        }
        if (target == undefined) {
          // find a hostile structure
          target = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES);
          if (creep.attack(target) != ERR_NOT_IN_RANGE) {
            // ATTACK!
            creep.attack(target);
            creep.say("ATTACK 🗡️");
            // if the hostile structure is NOT in range
          }
        }
        // if there is a hostile structure
        if (target != undefined) {
          isAlly = false;
          for (ally in Memory.allies) {
            if (target.owner != undefined) {
              if (target.owner.username == Memory.allies[ally]) {
                isAlly = true;
              }
            }
          }
          if (!isAlly) {
            // if hostile structure is in range
            if (creep.attack(target) != ERR_NOT_IN_RANGE) {
              // ATTACK!
              creep.attack(target);
              creep.say("ATTACK 🗡️");
              // if the hostile structure is NOT in range
            } else if (creep.attack(target) == ERR_NOT_IN_RANGE) {
              // move towards hostile structure
              creep.travelTo(target);
            }
          }
        }
      }
    }
  }
};
