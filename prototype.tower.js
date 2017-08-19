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
          if (target.owner.username == Memory.allies[ally]) {
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
          if (wall.hits < 2000000) {
            target = wall;
          }
          // if there is one
          if (target != undefined) {
            // break the loop
            break;
          }
        }
        var ramparts = this.room.find(FIND_STRUCTURES, {
          filter: (s) => s.structureType == STRUCTURE_RAMPART
        });
        for (let percentage = 0.0001; percentage <= .1; percentage = percentage + 0.0001) {
          // find a rampart with less than percentage hits
          for (let rampart of ramparts) {
            if (rampart.hits / rampart.hitsMax < percentage) {
              target = rampart;
              break
            }
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
