module.exports = {
  // a function to run the logic for this role
  run: function(creep) {

    // if not in target room
    if (creep.room.name != creep.memory.target) {
      var hostileCreeps = creep.room.find(FIND_HOSTILE_CREEPS);
      {
        if(hostileCreeps.length > 0){
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
          var exitToRoom = creep.room.findExitTo(creep.memory.target);
          creep.moveTo(creep.pos.findClosestByRange(exitToRoom));
        }
      }

    } else {
      creep.room.findExitTo(creep.memory.home);
      // try to claim controller
      if (creep.claimController(creep.room.controller) == ERR_NOT_IN_RANGE) {
        // move towards the controller
        creep.moveTo(creep.room.controller);
      }
      // if global control level is too low
      if (creep.claimController(creep.room.controller) == ERR_GCL_NOT_ENOUGH) {
        // try to reserve room
        if (creep.reserveController(creep.room.controller) == ERR_NOT_IN_RANGE) {
          // move towards the controller
          creep.moveTo(creep.room.controller);
        }
      }
    }
  }
};
