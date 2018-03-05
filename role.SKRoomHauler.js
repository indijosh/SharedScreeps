module.exports = {
  // a function to run the logic for this role
  /** @param {Creep} creep */
  run: function(creep) {
    // Make sure there aren't any hostile creeps within 5 spaces of the creep
    closestTarget = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    if (closestTarget != undefined) {
      if (creep.pos.inRangeTo(closestTarget, 5)) {
        let targets = _.map(creep.room.find(FIND_HOSTILE_CREEPS),
          c => ({
            pos: c.pos,
            range: 3
          }));

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
        return;
      }
    }

    // if creep is bringing energy to a structure but has no energy left
    if (creep.memory.working == true && creep.carry.energy == 0) {
      // switch state
      creep.memory.working = false;
    }
    // if creep is picking up energy but is full
    else if (creep.memory.working == false && creep.carry.energy == creep.carryCapacity) {
      // switch state
      creep.memory.working = true;
      delete creep.memory.targetContainer;
    }
    // if creep is supposed to transfer energy to a structure
    if (creep.memory.working == true) {
      // if in home room
      creep.depositEnergy();
    }
    // if creep is supposed to get energy
    else {
      var container;
      if(creep.memory.targetContainer != undefined){
        container = Game.getObjectById(creep.memory.targetContainer);
        // if the target has no energy left, delte it
        if(_.sum(container.store) <= 40 || container.amount == 0)
        {
          delete creep.memory.targetContainer;
          return;
        }
        // try to pickup or withdraw energy
        if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE ||
        creep.pickup(container) == ERR_NOT_IN_RANGE) {
          // move towards it
          creep.travelTo(container, {
            maxRooms: 1
          });
          return;
        }
      }

      // if creep doesn't already have a target container in memory
      if (creep.memory.targetContainer == undefined) {
        // make sure creep can see target room
        if(Game.rooms[creep.memory.target]){
          var highestContainer, highestDroppedEnergy;
          // Find the container with the most energy and isn't empty.
          var target = Game.rooms[creep.memory.target].find(FIND_STRUCTURES, {
            filter: (structure) => {
              return (structure.structureType == STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] > 0);
            }
          });

          if (target.length) {
            var allContainer = [];
            // Calculate the percentage of energy in each container.
            for (var i = 0; i < target.length; i++) {
              allContainer.push({
                energyAmount: _.sum(target[i].store),
                id: target[i].id
              });
            }
            // Get the container containing the most energy.
            highestContainer = _.max(allContainer, function(container) {
              return container.energyAmount;
            });
          }

          // add dropped energy to target list
          var droppedEnergy = Game.rooms[creep.memory.target].find(FIND_DROPPED_RESOURCES);

          if(droppedEnergy.length) {
            var allDroppedEnergy = [];
            // Calculate the percentage of energy in each container.
            for (var i = 0; i < droppedEnergy.length; i++) {
              allDroppedEnergy.push({
                energyAmount: _.sum(droppedEnergy[i].amount),
                id: droppedEnergy[i].id
              });
            }
            // Get the dropped energy by highest amount of energy.
            highestDroppedEnergy = _.max(allDroppedEnergy, function(droppeEnergy) {
              return droppeEnergy.energyAmount;
            });
          }
          if(highestContainer != undefined && highestDroppedEnergy != undefined){
            highestDroppedEnergy.energyAmount > highestContainer.energyAmount ?
            creep.memory.targetContainer = highestDroppedEnergy.id :
            creep.memory.targetContainer = highestContainer.id
          }
          else if (highestContainer == undefined && highestDroppedEnergy != undefined){
            creep.memory.targetContainer = highestDroppedEnergy.id;
          }
          else if (highestDroppedEnergy == undefined && highestContainer != undefined){
            creep.memory.targetContainer = highestContainer.id;
          }
          else{
            console.log("Cannot find anything to pickup in room " + creep.memory.target);
            return;
          }
        }

        // if creep can't find target room, scout it out
        else{
          var exit = creep.room.findExitTo(creep.memory.target);
          creep.travelTo(creep.pos.findClosestByRange(exit), {maxRooms:1});
          return;
        }
      }

      // if creep cannot find a target container, move to the idle flag
      if (creep.memory.targetContainer == undefined) {
        idleFlag = _.find(Game.flags, (c) =>
          creep.room.name == creep.memory.target);
        if (idleFlag != undefined) {
          if (!creep.pos.inRangeTo(idleFlag, 1)) {
            creep.travelTo(idleFlag.pos, {
              maxRooms: 1
            });
          }
        }
      }
    }
  }
};
