// create a new function for StructureTower
StructureTower.prototype.defend =
  function() {
    // find closes hostile creep
    var target = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS);

    // if a hostile creep is found
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
          return;
        }
      }
    }

    if (this.energy > this.energyCapacity / 2) {
      // heal creeps in room
      var creepsInRoom = this.room.find(FIND_MY_CREEPS);
      for(let creep in creepsInRoom){
        if (creep.hits < creep.hitsMax){
          this.heal(creep);
        }
      }

      // repair walls and ramparts
      var target,
        weakestRampart,
        weakestWall;

      // get all walls
      var walls = this.room.find(FIND_STRUCTURES, {
        filter: (s) => s.structureType == STRUCTURE_WALL
      });

      // get all ramparts
      var ramparts = this.room.find(FIND_STRUCTURES, {
        filter: (s) => s.structureType == STRUCTURE_RAMPART
        && s.hits < 10000000
      });
      if (walls.length > 0 &&
        this.room.name != 'E15S13' &&
        this.room.name != 'E14S17') {
        weakestWall = _.min(walls, 'hits');
        target = weakestWall;
      }
      if (ramparts.length > 0) {
        weakestRampart = _.min(ramparts, 'hits');
        if (weakestWall != undefined){
          if(weakestRampart.hits < weakestWall.hits){
            target = weakestRampart;
          }
        }
        else{
          target = weakestRampart;
        }
      }

      // if we find something that has to be repaired
      if (target != undefined) {
        this.repair(target);
      }
    }
  };
