module.exports = {
  // a function to run the logic for this role
  run: function(creep) {
    // if not in target room
    if (creep.room.name != creep.memory.target) {
      var exitToRoom = creep.room.findExitTo(creep.memory.target);
      creep.travelTo(creep.pos.findClosestByRange(exitToRoom));
    }

    // if in target room
    else {
      // heal the creep if it's injured.
      if (creep.hits < creep.hitsMax) {
        creep.heal(creep);
      }

      // look for source keepers in the room
      closestTarget = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);

      if (closestTarget != undefined) {
        // make sure there aren't any creeps within three spaces of creep
        if (creep.pos.inRangeTo(closestTarget, 5)) {
          let targets = _.map(creep.room.find(FIND_HOSTILE_CREEPS),
            c => ({ pos: c.pos, range: 3 }));

          let ret = PathFinder.search(
            creep.pos, targets, {
              // We need to set the defaults costs higher so that we
              // can set the road cost lower in `roomCallback`
              plainCost: 2,
              swampCost: 10,
              flee: true,

              roomCallback: function(roomName) {

                let room = Game.rooms[roomName];
                // In this example `room` will always exist, but since
                // PathFinder supports searches which span multiple rooms
                // you should be careful!
                if (!room) return;
                let costs = new PathFinder.CostMatrix;

                room.find(FIND_STRUCTURES).forEach(function(struct) {
                  if (struct.structureType === STRUCTURE_ROAD) {
                    // Favor roads over plain tiles
                    costs.set(struct.pos.x, struct.pos.y, 1);
                  }
                });

                // Avoid creeps in the room
                room.find(FIND_CREEPS).forEach(function(creep) {
                  costs.set(creep.pos.x, creep.pos.y, 0xff);
                });

                return costs;
              },
            }
          );
          let pos = ret.path[0];
          creep.move(creep.pos.getDirectionTo(pos));
        }

        // if the creep is in range, attack it.
        if (creep.rangedAttack(closestTarget) != ERR_NOT_IN_RANGE) {
          creep.rangedAttack(closestTarget);
        }

        // if hostile creep is not in range, move to it
        else if (creep.rangedAttack(closestTarget) == ERR_NOT_IN_RANGE) {
          creep.travelTo(closestTarget);
        }
      }

      // if there are no source keepers in the room, look for the spawn that
      // is respawning next
      else {
        var sourceKeeperLairs = creep.room.find(FIND_HOSTILE_STRUCTURES, {
          filter: (s) => (s.structureType == STRUCTURE_KEEPER_LAIR)
        });
        //console.log(JSON.stringify(sourceKeeperLairs));
        var soonestSpawningSourceKeeperLair = _.min(sourceKeeperLairs, "ticksToSpawn");
        if (!creep.pos.inRangeTo(soonestSpawningSourceKeeperLair, 3)) {
          creep.travelTo(soonestSpawningSourceKeeperLair);
        }
      }
    }
  }
};
