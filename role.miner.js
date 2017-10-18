module.exports = {
  // a function to run the logic for this role
  run: function(creep) {
    if (creep.memory.target != undefined && creep.room.name != creep.memory.target && creep.memory.working == false) {
      // find exit to target room
      var exit = creep.room.findExitTo(creep.memory.target);
      // move to exit
      creep.travelTo(creep.pos.findClosestByRange(exit));
      // return the function to not do anything else
      return;
    }

    // get source
    let source = Game.getObjectById(creep.memory.sourceId);

    if (source) {
      if (creep.memory.isCarryCreep) {
        // find container next to source
        let container = source.pos.findInRange(FIND_STRUCTURES, 1, {
          filter: s => s.structureType == STRUCTURE_CONTAINER
        })[0];
        // if creep is on top of the container
        if (container && !creep.pos.isEqualTo(container.pos)) {
            // harvest source
            creep.travelTo(container);
        }
        else {
          // if creep is by the source
          if (creep.pos.inRangeTo(source, 1)) {
            const totalCarry = _.sum(creep.carry);
            if (totalCarry >= 40) {
              link = Game.getObjectById(creep.memory.link.id)
              if (link != undefined) {
                if (totalCarry > link.energyCapacity - link.energy) {
                  creep.transfer(link, RESOURCE_ENERGY, link.energyCapacity - link.energy);
                } else {
                  creep.transfer(link, RESOURCE_ENERGY, totalCarry);
                }
              }
            }
            // if the creep is on top of a container that is not full, harvest energy.
            if(container){
              if(_.sum(container.store) < container.storeCapacity){
                creep.harvest(source);
              }
            }

            // else if there is no container and the link is full, harvest until the creep is full.
            else if(totalCarry != creep.carryCapacity){
              creep.harvest(source);
            }
          }
          // if creep is not on top of the container, move to it
          else {
            let goal = {
              pos: source.pos,
              range: 1
            };
            let ret = PathFinder.search(
              creep.pos, goal, {
                // We need to set the defaults costs higher so that we
                // can set the road cost lower in `roomCallback`
                plainCost: 2,
                swampCost: 10,

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
          }
        }
      }
      else {
        // find container next to source
        let container = source.pos.findInRange(FIND_STRUCTURES, 1, {
          filter: s => s.structureType == STRUCTURE_CONTAINER
        })[0];
        // if creep is on top of the container
        if (container) {
          if (creep.pos.isEqualTo(container.pos)) {
            // harvest source
            creep.harvest(source);
          }
          // if creep is not on top of the container
          else {
            // move towards it
            creep.travelTo(container);
          }
        }
      }
    }
  }
};
