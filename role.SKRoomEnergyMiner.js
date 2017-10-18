module.exports = {
  // a function to run the logic for this role
  run: function(creep) {
    const source = Game.getObjectById(creep.memory.sourceId);
    var sourceKeeperLair = undefined;

    // get target room if not already in memory
    if (creep.memory.target == undefined) {
      creep.memory.target = source.room.name;
    }

    // move to target room if not in it
    if (creep.memory.target != undefined && creep.room.name != creep.memory.target) {
      // find exit to target room
      var exit = creep.room.findExitTo(creep.memory.target);
      // move to exit
      creep.travelTo(creep.pos.findClosestByRange(exit));
      // return the function to not do anything else
      return;
    }

    // look for soureKeeperLair by source if there isn't one in memory
    if (creep.memory.sourceKeeperLair == undefined) {
      sourceKeeperLair = source.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {
        filter: s => s.structureType == STRUCTURE_KEEPER_LAIR
      });
      creep.memory.sourceKeeperLair = sourceKeeperLair;
    }

    var closestHostileCreep = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 6);

    // if there's a hostile creep within 6 spaces, pathfind away from hostile
    if (closestHostileCreep.length > 0) {
      let targets = _.map(creep.room.find(FIND_HOSTILE_CREEPS),
        c => ({
          pos: c.pos,
          range: 5
        }));

      let ret = PathFinder.search(
        creep.pos, targets, {
          plainCost: 2,
          swampCost: 10,
          flee: true,

          roomCallback: function(roomName) {
            let room = Game.rooms[roomName];
            if (!room) return;
            let costs = new PathFinder.CostMatrix;

            room.find(FIND_STRUCTURES).forEach(function(struct) {
              if (struct.structureType === STRUCTURE_ROAD) {
                // Favor roads over plain tiles
                costs.set(struct.pos.x, struct.pos.y, 1);
              } else if (struct.structureType !== STRUCTURE_CONTAINER &&
                (struct.structureType !== STRUCTURE_RAMPART ||
                  !struct.my)) {
                // Can't walk through non-walkable buildings
                costs.set(struct.pos.x, struct.pos.y, 0xff);
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
      return;
    }

    sourceKeeperLair = Game.getObjectById(creep.memory.sourceKeeperLair.id);
    // check to see if a keeper is about to spawn and move away if necessary
    if (sourceKeeperLair.ticksToSpawn < 10 || sourceKeeperLair.ticksToSpawn == undefined) {
      let fleePoint = {
        pos: sourceKeeperLair.pos,
        range: 5
      };

      let ret = PathFinder.search(
        creep.pos, fleePoint, {
          plainCost: 2,
          swampCost: 10,
          flee: true,

          roomCallback: function(roomName) {
            let room = Game.rooms[roomName];
            if (!room) return;
            let costs = new PathFinder.CostMatrix;

            room.find(FIND_STRUCTURES).forEach(function(struct) {
              if (struct.structureType === STRUCTURE_ROAD) {
                // Favor roads over plain tiles
                costs.set(struct.pos.x, struct.pos.y, 1);
              } else if (struct.structureType !== STRUCTURE_CONTAINER &&
                (struct.structureType !== STRUCTURE_RAMPART ||
                  !struct.my)) {
                // Can't walk through non-walkable buildings
                costs.set(struct.pos.x, struct.pos.y, 0xff);
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

    if (source) {
      // find container next to source
      let container = source.pos.findInRange(FIND_STRUCTURES, 1, {
        filter: s => s.structureType == STRUCTURE_CONTAINER
      })[0];

      // if there is a container by the source
      if (container != undefined) {
        // if the creep is not on top of the container, move towards it
        if (!creep.pos.isEqualTo(container.pos)) {
          let ret = PathFinder.search(
            creep.pos, container.pos, {
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

                room.find(FIND_HOSTILE_CREEPS).forEach(function(hostileCreep) {
                  if (hostileCreep) {
                    // pit 1 5x5 swamp around the creeps
                    costs.set(hostileCreep.pos.x, hostileCreep.pos.y, 0xff);
                    for (var offsetx = -4; offsetx < 4; offsetx++) {
                      for (var offsety = -4; offsety < 4; offsety++) {
                        costs.set(hostileCreep.pos.x + offsetx, hostileCreep.pos.y + offsety, 0xff);
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

        // if the creep is on top of the container, harvest
        else {
          if (creep.memory.travellingToTarget) {
            creep.memory.travellingToTarget = false;
          }

          // if the container does need to be repaired
          if (container.hits < container.hitsMax) {
            creep.harvest(source);
            creep.repair(container);
          }

          // if the container doesn't need to be repaired
          else {
            creep.harvest(source)
          }

        }
      }

      // if there isn't a container, put a constructionSite by it and build it
      else {
        // look for a construciton site by the source
        var constructionSiteBySource = source.pos.findInRange(FIND_CONSTRUCTION_SITES, 1);
        // if there isn't a construction site by the source, create one
        if (constructionSiteBySource == undefined || constructionSiteBySource == '' || constructionSiteBySource == null) {
          var energyBySourceForConstructionSpot = source.pos.findInRange(FIND_DROPPED_RESOURCES, 1);
          if (energyBySourceForConstructionSpot.length > 1) {
            energyBySourceForConstructionSpot[0].pos.createConstructionSite(STRUCTURE_CONTAINER)
          }
        }

        // if there is a construction site by the source, go to the source and start building
        else {
          // assign the construction site to creep's memory
          if (creep.memory.targetContainerConstructionSite == undefined) {
            creep.memory.targetContainerConstructionSite = constructionSiteBySource;
          }

          const totalCarry = _.sum(creep.carry);
          // if the creep is by the source
          if (creep.pos.inRangeTo(source, 1)) {
            // if the creep is full of energy
            if (_.sum(creep.carry) == creep.carryCapacity) {
              const target = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
              creep.build(target);
              if (creep.memory.travellingToTarget) {
                creep.memory.travellingToTarget = false;
              }
            }

            // if the creep isn't full of energy
            else {
              creep.harvest(source);
            }
          }

          // if the creep is not by the source, move towards it.
          else {
            let ret = PathFinder.search(
              creep.pos, source.pos, {
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

                  room.find(FIND_HOSTILE_CREEPS).forEach(function(hostileCreep) {
                    if (hostileCreep) {
                      // pit 1 5x5 swamp around the creeps
                      costs.set(hostileCreep.pos.x, hostileCreep.pos.y, 0xff);
                      for (var offsetx = -3; offsetx < 3; offsetx++) {
                        for (var offsety = -3; offsety < 3; offsety++) {
                          costs.set(hostileCreep.pos.x + offsetx, hostileCreep.pos.y + offsety, 0xff);
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
        }
      }
    }
  }
};
