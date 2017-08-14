// create a new function for StructureTower
StructureTower.prototype.defend =
  function() {
    // find closes hostile creep
    var target = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS);

    // if one is found...
    if (target != undefined) {
      //this.attack(target);
      var bodyHasAttackPart = false
      for (var part in target.body) {
        if (target.body[part].type == 'attack' || target.body[part].type == 'ranged_attack') {
          bodyHasAttackPart = true;
        }
      }
      if (bodyHasAttackPart == true) {
        isAlly = false;
        for (ally in Memory.allies) {
          if (target.owner.username == ally) {
            isAlly = true;
          }
        }
        if (!isAlly) {
          // ...FIRE!
          this.attack(target);
        }
      }
    }

    // if one isn't found
    if (target == undefined) {
      if (this.energy > this.energyCapacity / 2) {
        var walls = this.room.find(FIND_STRUCTURES, {
          filter: (s) => s.structureType == STRUCTURE_WALL
        });
        for (let wall of walls) {
          if (wall.hits < 1700000) {
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
