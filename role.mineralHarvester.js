var roleBuilder = require('role.lorry');

module.exports = {
  // a function to run the logic for this role
  /** @param {Creep} creep */
  run: function(creep) {
    // if creep is bringing minerals to a structure but has no minerals left
    if (creep.memory.working == true && _.sum(creep.carry) == 0) {
      // switch state
      creep.memory.working = false;
    }

    // if creep is harvesting minerals but is full
    else if (creep.memory.working == false && _.sum(creep.carry) == creep.carryCapacity) {
      // switch state
      creep.memory.working = true;
    }

    // if creep is supposed to transfer minerals to a structure
    if (creep.memory.working == true) {
      // find out if the terminal needs resources
      var structure = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
        filter: s => (s.structureType == STRUCTURE_TERMINAL)
        && RESOURCE_OXYGEN in s.store < 10000
      });

      if (structure == undefined) {
        // find closest lab, extend to container later?
        structure = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
          filter: (s) => (s.structureType == STRUCTURE_LAB) &&
            s.mineralAmount < s.mineralCapacity
        });
      }

      if (structure == undefined) {
        roleUpgrader.run(creep);
      }

      // if we found one
      if (structure != undefined) {
        // try to transfer minerals, if it is not in range
        if (creep.transfer(structure, RESOURCE_OXYGEN) == ERR_NOT_IN_RANGE) {
          // move towards it
          creep.moveTo(structure);
        }
      }
    }

    // if creep is supposed to harvest minerals from source
    else {
      // find out if the container by the extractor is empty
      let source = Game.getObjectById('59691cf905e5ee31d16c0757');
      if (source) {
        // find container next to source if it has oxygen
        let container = source.pos.findInRange(FIND_STRUCTURES, 1, {
          filter: s => (s.structureType == STRUCTURE_CONTAINER) &&
            s.store[RESOURCE_OXYGEN] > 0
        })[0];
        // withdraw oxygen from container
        if (container) {
          if (creep.withdraw(container, RESOURCE_OXYGEN) == ERR_NOT_IN_RANGE) {
            creep.moveTo(container);
          }
        } else {
          var extractor = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
            filter: (s) => (s.structureType == STRUCTURE_EXTRACTOR)
          });
          var mineralDeposit = Game.getObjectById('58dbc91b34e898064bcc2d9d');
          if (creep.harvest(mineralDeposit) == ERR_NOT_IN_RANGE) {
            creep.moveTo(extractor);
          }
        }
      }
    }
  }
};
