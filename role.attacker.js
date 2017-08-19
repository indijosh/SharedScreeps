module.exports = {
  // a function to run the logic for this role
  /** @param {Creep} creep */
  run: function(creep) {
    if (creep.memory.target == undefined || creep.memory.target == '') {
      flags = Game.flags;
      for (flag in flags) {
        // console.log(flags[flag].color, flags[flag].secondaryColor, JSON.stringify(flags[flag].pos.roomName));
        if (flags[flag].color == 1) {
          if (flags[flag].secondaryColor == 10) {
            creep.memory.target = flags[flag].pos.roomName;
          }
        }
      }
    }
    // if target is defined and creep is not in target room
    if (creep.memory.target != undefined &&
      creep.room.name != creep.memory.target &&
      creep.hits == creep.hitsMax) {
      // find exit to target room
      var exit = creep.room.findExitTo(creep.memory.target);
      // move to exit
      creep.moveTo(creep.pos.findClosestByRange(exit));
      // return the function to not do anything else
      return;
    }
    // if creep is in target room, find nearest hostile creep
    else {
      if (creep.hits < creep.hitsMax / 2) {
        creep.move(BOTTOM);
        return;
      }
      // find nearest hostile creep
      // var creepTarget = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
      // if there is a hostile creep target
      // if (creepTarget != undefined) {
      //   isAlly = false;
      //   for (ally in Memory.allies) {
      //     if (creepTarget.owner.username == Memory.allies[ally]) {
      //       isAlly = true;
      //     }
      //   }
      //   if (!isAlly) {
      //     // ...FIRE!
      //     // if hostile creep is in range
      //     if (creep.attack(creepTarget) != ERR_NOT_IN_RANGE) {
      //       // ATTACK!
      //       creep.attack(creepTarget);
      //       creep.say("ATTACK 🗡️");
      //       // if hostile creep is not in range
      //     } else if (creep.attack(creepTarget) == ERR_NOT_IN_RANGE) {
      //       // move towards hostile creep
      //       creep.moveTo(creepTarget);
      //     }
      //   }
      //
      // }
      // if there is NOT a hostile creep
      //else{
      //if (creepTarget == undefined) {
      var structureTarget = Game.getObjectById('5985f38e16d9334fe3a70cc8');
      // if (structureTarget == undefined) {
      //   // find a hostile structure
      //   structureTarget = creep.pos.findClosestByPath(FIND_STRUCTURES, {
      //     // the second argument for findClosestByPath is an object which takes
      //     // a property called filter which can be a function
      //     // we use the arrow operator to define it
      //     filter: (s) => (s.structureType == STRUCTURE_WALL)
      //   });
      // }
      // if (structureTarget == undefined) {
      //   // find a hostile structure
      //   structureTarget = creep.pos.findClosestByPath(FIND_STRUCTURES, {
      //     // the second argument for findClosestByPath is an object which takes
      //     // a property called filter which can be a function
      //     // we use the arrow operator to define it
      //     filter: (s) => (s.structureType == STRUCTURE_WALL)
      //   });
      // }
      if (structureTarget == undefined) {
        // find a hostile structure
        structureTarget = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES);
      }
      // if there is a hostile structure
      if (structureTarget != undefined) {
        isAlly = false;
        for (ally in Memory.allies) {
          if(structureTarget.owner != undefined){
            if(structureTarget.owner.username == Memory.allies[ally]) {
              isAlly = true;
            }
          }
        }
        if (!isAlly) {
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
      }
      //}
      //}

    }
  }
};
