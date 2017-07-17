// create a new function for StructureTower
StructureTower.prototype.defend =
  function() {
    // find closes hostile creep
    var target = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS);

    // if one is found...
    if (target != undefined) {
      // ...FIRE!
      this.attack(target);
    }

    // if one isn't found
    if (target == undefined) {
      if (this.energy > this.energyCapacity / 2) {
        var walls = this.room.find(FIND_STRUCTURES, {
          filter: (s) => s.structureType == STRUCTURE_WALL
        });
        for (let wall of walls) {
          if (wall.hits < 1000000) {
            target = wall;
          }
          // if there is one
          if (target != undefined) {
            // break the loop
            break;
          }
        }
      }
    }

    // if we find a wall that has to be repaired
    if (target != undefined) {
      this.repair(target);
    }
  };
