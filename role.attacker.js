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
        isAlly = false;
        for (ally in Memory.allies) {
          if (creepTarget.owner.username == ally) {
            isAlly = true;
          }
        }
        if (!isAlly) {
          // ...FIRE!
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

      }
      // if there is NOT a hostile creep
      if (creepTarget == undefined) {
        var structureTarget;
        if (structureTarget == undefined) {
          // find a hostile structure
          structureTarget = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {
            // the second argument for findClosestByPath is an object which takes
            // a property called filter which can be a function
            // we use the arrow operator to define it
            filter: (s) => (s.structureType == STRUCTURE_EXTENSION)
          });
        }
        if (structureTarget == undefined) {
          // find a hostile structure
          structureTarget = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES);
        }
        // if there is a hostile structure
        if (structureTarget != undefined) {
          isAlly = false;
          for (ally in Memory.allies) {
            if (structureTarget.owner.username == ally) {
              isAlly = true;
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
        if (creep.room.name == 'E16S17') {
          if (creep.memory.rampartTarget == undefined || creep.memory.rampartTarget == null) {
            const ramparts = [];

            ramparts.push(Game.getObjectById('598f7b9498f80c6dddef6e49'));
            ramparts.push(Game.getObjectById('598f7b4661033e6de7d6bb6d'));

            let creepsInRoom = creep.room.find(FIND_MY_CREEPS);

            // iterate over ramparts
            for (let rampart of ramparts) {
              // if the source has no miner
              if (!_.some(creepsInRoom, c => c.memory.role == 'attacker' &&
                  c.memory.rampartTarget != undefined &&
                  c.memory.rampartTarget.id == rampart.id)) {
                creep.memory.rampartTarget = rampart;
              }
            }
          } else {
            creep.moveTo(Game.getObjectById(creep.memory.rampartTarget.id));
          }
        }
      }
    }
  }
};
