var roleUpgrader = require('role.upgrader');

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

    // if creep is trying to complete a constructionSite but has no energy left
    if (creep.memory.working == true && creep.carry.energy == 0) {
      // switch state
      creep.memory.working = false;
    }
    // if creep is harvesting energy but is full
    else if (creep.memory.working == false && creep.carry.energy == creep.carryCapacity) {
      // switch state
      creep.memory.working = true;
    }

    // if creep is supposed to complete a constructionSite
    if (creep.memory.working == true) {
      // find if creep has a constructionSite in memory
      if (creep.memory.constructionSite != undefined) {
        constructionSite = Game.getObjectById(creep.memory.constructionSite.id)
        // try to build, if the constructionSite is not in range
        if (constructionSite) {
          if (creep.build(constructionSite) == ERR_NOT_IN_RANGE) {
            // move towards the constructionSite
            creep.moveTo(constructionSite);
          }
        } else {
          delete creep.memory.constructionSite;
        }

        if (constructionSite < 100) {
          creep.memory.constructionSite == '';
        }
      }
      // if creep does not have a constructionSite in memory
      else {
        // try to find one
        var constructionSite = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
        // if a constructionSite is found
        if (constructionSite != undefined) {
          creep.memory.constructionSite = constructionSite;
        }
        // if no constructionSite is found
        else {
          // go upgrading the controller
          roleUpgrader.run(creep);
        }
      }
    }
    // if creep is supposed to get energy
    else {
      creep.getEnergy(true, true);
    }
  }
};
