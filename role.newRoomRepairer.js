var roleBuilder = require('role.builder');

module.exports = {
  // a function to run the logic for this role
  /** @param {Creep} creep */
  run: function(creep) {
    if (creep.memory.target != undefined && creep.room.name != creep.memory.target) {
      var enemyCreeps = creep.room.find(FIND_HOSTILE_CREEPS);
      if(enemyCreeps.length > 0){
        const exitDir = creep.room.findExitTo(creep.memory.target);
        const exit = creep.pos.findClosestByRange(exitDir);
        let ret = PathFinder.search(
          creep.pos, exit, {
            // We need to set the defaults costs higher so that we
            // can set the road cost lower in `roomCallback`
            plainCost: 1,
            swampCost: 5,

            roomCallback(roomName) {
              let room = Game.rooms[roomName];
              // In this example `room` will always exist, but since
              // PathFinder supports searches which span multiple rooms
              // you should be careful!
              if (!room) return;
              let costs = new PathFinder.CostMatrix;

              room.find(FIND_STRUCTURES).forEach(function(struct) {
                costs.set(struct.pos.x, struct.pos.y, 0xff);
              });

              room.find(FIND_HOSTILE_CREEPS).forEach(function(hostileCreep) {
                if (hostileCreep) {
                  // pit 1 5x5 swamp around the creeps
                  costs.set(hostileCreep.pos.x, hostileCreep.pos.y, 10);
                  for (var offsetx = -5; offsetx < 5; offsetx++) {
                    for (var offsety = -5; offsety < 5; offsety++) {
                      costs.set(hostileCreep.pos.x + offsetx, hostileCreep.pos.y + offsety, 10);
                    }
                  }
                }
              });
              return costs;
            },
          }
        );

        let pos = ret.path[0];

        creep.move(creep.pos.getDirectionTo(pos));
      }
      else{
        // find exit to target room
        var exitRoom = creep.room.findExitTo(creep.memory.target);
        // move to exit
        creep.moveTo(creep.pos.findClosestByRange(exitRoom));
        // return the function to not do anything else
        return;
      }
    }
    else{
      // if creep is trying to repair something but has no energy left
      if (creep.memory.working == true && creep.carry.energy == 0) {
        // switch state
        creep.memory.working = false;
      }
      // if creep is harvesting energy but is full
      else if (creep.memory.working == false && creep.carry.energy == creep.carryCapacity) {
        // switch state
        creep.memory.working = true;
      }

      // if creep is supposed to repair something
      if (creep.memory.working == true) {
        // find closest structure with less than max hits
        // Exclude walls because they have way too many max hits and would keep
        // our repairers busy forever. We have to find a solution for that later.
        var structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
          // the second argument for findClosestByPath is an object which takes
          // a property called filter which can be a function
          // we use the arrow operator to define it
          filter: (s) => s.hits < s.hitsMax && s.structureType != STRUCTURE_WALL
        });

        // if we find one
        if (structure != undefined) {
          // try to repair it, if it is out of range
          if (creep.repair(structure) == ERR_NOT_IN_RANGE) {
            // move towards it
            creep.moveTo(structure);
          }
        }
        // if we can't fine one
        else {
          roleBuilder.run(creep);
        }
      }
      // if creep is supposed to get energy
      else{
        creep.getEnergy(true, true);
      }
    }
  }
};
