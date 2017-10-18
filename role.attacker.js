module.exports = {
  // a function to run the logic for this role
  /** @param {Creep} creep */
  run: function(creep) {
    var isAttackingCreeps = true,
    isAttackingWalls = false,
    isAttackingHostileStructures = true;
    // if target is defined and creep is not in target room
    if (creep.memory.target != undefined && creep.room.name != creep.memory.target) {
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
                    costs.set(hostileCreep.pos.x, hostileCreep.pos.y, 5);
                    for (var offsetx = -5; offsetx < 5; offsetx++) {
                      for (var offsety = -5; offsety < 5; offsety++) {
                        costs.set(hostileCreep.pos.x + offsetx, hostileCreep.pos.y + offsety, 5);
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
          creep.travelTo(creep.pos.findClosestByRange(exitToRoom));
        }
      }
      return;
    }

    var enemyCreeps = creep.room.find(FIND_HOSTILE_CREEPS);
    if (enemyCreeps.length > 0 && creep.room.name != creep.memory.target) {
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
      return;
    }

    // if creep is in target room, find nearest hostile creep
    else {
      var target;
      if(isAttackingCreeps){
        // find nearest hostile creep
        target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        // if there is a hostile creep target
        if (target != undefined) {
          isAlly = false;
          for (ally in Memory.allies) {
            if (target.owner.username == Memory.allies[ally]) {
              isAlly = true;
            }
          }
          if (!isAlly) {
            // ...FIRE!
            // if hostile creep is in range
            if (creep.attack(target) != ERR_NOT_IN_RANGE) {
              // ATTACK!
              creep.attack(target);
              creep.say("ATTACK 🗡️");
              // if hostile creep is not in range
            } else if (creep.attack(target) == ERR_NOT_IN_RANGE) {
              // move towards hostile creep
              creep.travelTo(target);
            }
          }
        }
        else{
          target = undefined
        }
      }
      if(isAttackingWalls && target == undefined){
        target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
          // the second argument for findClosestByPath is an object which takes
          // a property called filter which can be a function
          // we use the arrow operator to define it
          filter: (s) => (s.structureType == STRUCTURE_WALL)
        });
        if(target != undefined){
          if (creep.attack(target) != ERR_NOT_IN_RANGE) {
            // ATTACK!
            creep.attack(target);
            creep.say("ATTACK 🗡️");
            // if the hostile structure is NOT in range
          }
          else if (creep.attack(target) == ERR_NOT_IN_RANGE) {
            // move towards hostile structure
            creep.travelTo(target);
          }
        }
      }
      // find hostile structure if nothing has been found so far
      if (isAttackingHostileStructures && target == undefined) {
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
          target = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {
            // the second argument for findClosestByPath is an object which takes
            // a property called filter which can be a function
            // we use the arrow operator to define it
            filter: (s) => (s.structureType == STRUCTURE_RAMPART)
          });
        }
        // if there is a hostile structure
        if (target != undefined) {
          isAlly = false;
          for (ally in Memory.allies) {
            if(target.owner != undefined)
            {
              if (target.owner.username == Memory.allies[ally]) {
                isAlly = true;
              }
            }
          }
          if (!isAlly) {
            target = Game.getObjectById('598781e85627db4542315ae7')
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
      //}
      //}

    }
  }
};
