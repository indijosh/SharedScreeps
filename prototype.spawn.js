var listOfRoles = ['attacker',
  'builder',
  'claimer',
  'harvester',
  'localMover',
  'longDistanceHauler',
  'lorry',
  'miner',
  'mineralHarvester',
  'miningRoomDefender',
  'newRoomRepairer',
  'repairer',
  'upgrader',
  'wallRepairer'
];

// create a new function for StructureSpawn
StructureSpawn.prototype.spawnCreepsIfNecessary =
  function() {
    if (this.spawning == null) {
      /** @type {Room} */
      let room = this.room;

      // find all creeps in room
      /** @type {Array.<Creep>} */
      let creepsInRoom = room.find(FIND_MY_CREEPS);
      let creepsFromRoom = _(Game.creeps).filter({
        memory: {
          home: room.name
        }
      }).value();

      // count the number of creeps alive for each role in this room
      // _.sum will count the number of properties in Game.creeps filtered by the
      //  arrow function, which checks for the creep being a specific role
      /** @type {Object.<string, number>} */
      let numberOfCreeps = {};
      for (let role of listOfRoles) {
        numberOfCreeps[role] = _.sum(creepsFromRoom, (c) => c.memory.role == role);
      }
      let maxEnergy = room.energyCapacityAvailable;
      let name = undefined;

      // if no harvesters are left AND either no miners or no lorries are left
      //  create a backup creep
      if (numberOfCreeps['harvester'] == 0 && numberOfCreeps['lorry'] == 0) {
        // if there are still miners or enough energy in Storage left
        if (numberOfCreeps['miner'] > 0 ||
          (room.storage != undefined && room.storage.store[RESOURCE_ENERGY] >= 150 + 550)) {
          // create a lorry
          name = this.createLorry(150, room.name);
        }
        // if there is no miner and not enough energy in Storage left
        else {
          // create a harvester because it can work on its own
          name = this.createCustomCreep(room.energyAvailable, 'harvester', room.name);
        }
      }
      // if no backup creep is required
      else {
        // check if all sources have miners
        let sources = room.find(FIND_SOURCES);
        // iterate over all sources
        for (let source of sources) {
          // if the source has no miner
          if (!_.some(creepsInRoom, c => c.memory.role == 'miner' && c.memory.sourceId == source.id)) {
            // check whether or not the source has a container
            /** @type {Array.StructureContainer} */
            let containers = source.pos.findInRange(FIND_STRUCTURES, 1, {
              filter: s => s.structureType == STRUCTURE_CONTAINER
            });
            // if there is a container next to the source
            if (containers.length > 0 && maxEnergy >= 550) {
              // spawn a miner
              name = this.createMiner(source.id, room.name);
              break;
            }
          }
        }
      }

      // if none of the above caused a spawn command check for other roles
      if (name == undefined) {
        for (let role of listOfRoles) {
          // check for claim order
          if (role == 'claimer' && numberOfCreeps[role] < this.memory.minCreeps[role]) {
            if (room.energyAvailable > 650) {
              // try to spawn a claimer
              name = this.createClaimer(this.memory.claimRoom, room.name);
              // if that worked
              if (name != undefined && _.isString(name)) {
                // delete the claim order (could also be used for reserving)
                //delete this.memory.claimRoom;
              }
            }
          }
          // if no claim order was found, check other roles
          else if (numberOfCreeps[role] < this.memory.minCreeps[role]) {
            if (role == 'lorry') {
              name = this.createLorry(150, room.name);
            } else if (role == 'attacker') {
              name = this.createAttacker(800, room.name);
            } else {
              if (room.energyCapacityAvailable >= 800) {
                name = this.createCustomCreep(800, role, room.name);
              } else {
                name = this.createCustomCreep(maxEnergy, role, room.name);
              }
            }
            break;
          }
        }
      }

      // if none of the above caused a spawn command check need for mining room creeps
      /** @type {Object.<string, number>} */
      let numberOfMiningRoomRepairers = {},
        numberOfMiningRoomDefenders = {},
        numberOfMiningRoomHaulers = {};
      if (name == undefined) {
        // count the number of long distance miners in each room. This will only
        // work if there is vision in that room since we need to count the sources
        // in the room.
        for (let roomName in this.memory.miningRooms) {
          if (Game.rooms[roomName]) {
            // find all the sources in the room
            let sources = Game.rooms[roomName].find(FIND_SOURCES);
            // iterate over all sources
            for (let source of sources) {

              // if the source has no miner
              if (!_.some(creepsFromRoom, c => c.memory.role == 'miner' && c.memory.sourceId == source.id)) {
                // check whether or not the source has a container
                /** @type {Array.StructureContainer} */
                let containers = source.pos.findInRange(FIND_STRUCTURES, 1, {
                  filter: s => s.structureType == STRUCTURE_CONTAINER
                });
                // if there is a container next to the source
                if (containers.length > 0 && maxEnergy >= 550) {
                  // spawn a miner
                  name = this.createMiner(source.id, room.name, roomName);
                  break;
                }
              }
            }
          }

          // if we don't need a miner, spawn a repairer
          if (name == undefined) {
            numberOfMiningRoomRepairers[roomName] = _.sum(Game.creeps, (c) =>
              c.memory.role == 'newRoomRepairer' && c.memory.target == roomName)
            if (numberOfMiningRoomRepairers[roomName] < this.memory.miningRooms[roomName].numberOfMiningRoomRepairers) {
              name = this.createNewRoomRepairer(800, 'newRoomRepairer', room.name, roomName);
            }
          }

          // spawn a hauler if needed
          if (name == undefined) {
            numberOfMiningRoomHaulers[roomName] = _.sum(Game.creeps, (c) =>
              c.memory.role == 'longDistanceHauler' && c.memory.target == roomName)

            if (numberOfMiningRoomHaulers[roomName] < this.memory.miningRooms[roomName].numberOfMiningRoomHaulers) {
              name = this.createLongDistanceHauler(maxEnergy, room.name, roomName);
            }
          }

          // spawn a defender if needed
          if (name == undefined) {
            numberOfMiningRoomDefenders[roomName] = _.sum(Game.creeps, (c) =>
              c.memory.role == 'attacker' && c.memory.target == roomName)
            if (numberOfMiningRoomDefenders[roomName] < this.memory.miningRooms[roomName].numberOfMiningRoomDefenders) {
              name = this.createMiningRoomDefender(maxEnergy, room.name, roomName);
            }
          }

        }
      }
      // if we are spawning something, print the details to the console
      if (name != undefined && _.isString(name)) {
        if(Game.creeps[name].memory.target){
          console.log(this.name + " spawning " + Game.creeps[name].memory.role + " for " + Game.creeps[name].memory.target);
        }
        else{
          console.log(this.name + " spawning " + Game.creeps[name].memory.role + " for home");
        }
      }
    }
  };

// create a new function for StructureSpawn
StructureSpawn.prototype.createNewRoomRepairer =
  function(energy, roleName, home, target) {
    // create a balanced body as big as possible with the given energy
    var numberOfParts = Math.floor(energy / 200);
    // make sure the creep is not too big (more than 50 parts)
    numberOfParts = Math.min(numberOfParts, Math.floor(50 / 3));
    var body = [];
    for (let i = 0; i < numberOfParts; i++) {
      body.push(WORK);
    }
    for (let i = 0; i < numberOfParts; i++) {
      body.push(CARRY);
    }
    for (let i = 0; i < numberOfParts; i++) {
      body.push(MOVE);
    }

    // create creep with the created body and the given role
    return this.createCreep(body, undefined, {
      role: roleName,
      working: false,
      home: home,
      target: target
    });
  };

// create a new function for StructureSpawn
StructureSpawn.prototype.createCustomCreep =
  function(energy, roleName, home) {
    // create a balanced body as big as possible with the given energy
    var numberOfParts = Math.floor(energy / 200);
    // make sure the creep is not too big (more than 50 parts)
    numberOfParts = Math.min(numberOfParts, Math.floor(50 / 3));
    var body = [];
    for (let i = 0; i < numberOfParts; i++) {
      body.push(WORK);
    }
    for (let i = 0; i < numberOfParts; i++) {
      body.push(CARRY);
    }
    for (let i = 0; i < numberOfParts; i++) {
      body.push(MOVE);
    }

    // create creep with the created body and the given role
    return this.createCreep(body, undefined, {
      role: roleName,
      working: false,
      home: home
    });
  };

// create a new function for StructureSpawn
StructureSpawn.prototype.createLongDistanceHarvester =
  function(energy, numberOfWorkParts, home, target, sourceIndex) {
    // create a body with the specified number of WORK parts and one MOVE part per non-MOVE part
    var body = [];
    for (let i = 0; i < numberOfWorkParts; i++) {
      body.push(WORK);
    }

    // 150 = 100 (cost of WORK) + 50 (cost of MOVE)
    energy -= 150 * numberOfWorkParts;

    var numberOfParts = Math.floor(energy / 100);
    // make sure the creep is not too big (more than 50 parts)
    numberOfParts = Math.min(numberOfParts, Math.floor((50 - numberOfWorkParts * 2) / 2));
    for (let i = 0; i < numberOfParts; i++) {
      body.push(CARRY);
    }
    for (let i = 0; i < numberOfParts + numberOfWorkParts; i++) {
      body.push(MOVE);
    }

    // create creep with the created body
    return this.createCreep(body, undefined, {
      role: 'longDistanceHarvester',
      home: home,
      target: target,
      sourceIndex: sourceIndex,
      working: false
    });
  };

// create a new function for StructureSpawn
StructureSpawn.prototype.createNewRoomBuilder =
  function(energy, numberOfWorkParts, home, target, sourceIndex) {
    // create a body with the specified number of WORK parts and one MOVE part per non-MOVE part
    var body = [];
    for (let i = 0; i < numberOfWorkParts; i++) {
      body.push(WORK);
    }

    // 150 = 100 (cost of WORK) + 50 (cost of MOVE)
    energy -= 150 * numberOfWorkParts;

    var numberOfParts = Math.floor(energy / 100);
    // make sure the creep is not too big (more than 15 parts)
    numberOfParts = Math.min(numberOfParts, Math.floor((15 - numberOfWorkParts * 2) / 2));
    for (let i = 0; i < numberOfParts; i++) {
      body.push(CARRY);
    }
    for (let i = 0; i < numberOfParts + numberOfWorkParts; i++) {
      body.push(MOVE);
    }

    // create creep with the created body
    return this.createCreep(body, undefined, {
      role: 'newRoomBuilder',
      home: home,
      target: target,
      sourceIndex: sourceIndex,
      working: false
    });
  };

// create a new function for StructureSpawn
StructureSpawn.prototype.createClaimer =
  function(target, home) {
    return this.createCreep([CLAIM, CLAIM, MOVE, MOVE], undefined, {
      role: 'claimer',
      target: target,
      home: home
    });
  };

// create a new function for StructureSpawn
StructureSpawn.prototype.createMiner =
  function(sourceId, home) {
    return this.createCreep([WORK, WORK, WORK, WORK, WORK, MOVE], undefined, {
      needsBoosting: true,
      role: 'miner',
      sourceId: sourceId,
      home: home
    });
  };

// create a new function for StructureSpawn
StructureSpawn.prototype.createLorry =
  function(energy, home) {
    // create a body with twice as many CARRY as MOVE parts
    var numberOfParts = Math.floor(energy / 150);
    // make sure the creep is not too big (more than 50 parts)
    numberOfParts = Math.min(numberOfParts, Math.floor(50 / 3));
    var body = [];
    for (let i = 0; i < numberOfParts * 2; i++) {
      body.push(CARRY);
    }
    for (let i = 0; i < numberOfParts; i++) {
      body.push(MOVE);
    }

    // create creep with the created body and the role 'lorry'
    return this.createCreep(body, undefined, {
      role: 'lorry',
      working: false,
      home: home
    });
  };

// create a new function for StructureSpawn
StructureSpawn.prototype.createLongDistanceHauler =
  function(energy, home, target) {
    // create a balanced body as big as possible with the given energy
    var numberOfParts = Math.floor(energy / 50);

    // make sure the creep isn't more than 50 parts
    numberOfParts = Math.min(numberOfParts, 50);

    var body = [];
    for (let i = 0; i < numberOfParts / 2; i++) {
      body.push(MOVE);
      body.push(CARRY);
    }
    // create creep with the created body and the role 'lorry'
    return this.createCreep(body, undefined, {
      role: 'longDistanceHauler',
      working: false,
      home: home,
      target: target
    });
  };

// create a new function for StructureSpawn
StructureSpawn.prototype.createMiningRoomDefender =
  function(energy, home, target) {
    // create a balanced body as big as possible with the given energy
    var numberOfParts = Math.floor(energy / 50);
    // make sure the creep is not too big (more than 50 parts)
    numberOfParts = Math.min(numberOfParts, Math.floor(50 / 3));
    var body = [];
    for (let i = 0; i < numberOfParts; i++) {
      body.push(MOVE);
    }
    for (let i = 0; i < numberOfParts / 3 - 1; i++) {
      body.push(ATTACK);
      body.push(RANGED_ATTACK);
      body.push(TOUGH);
    }
    body.push(HEAL);

    // create creep with the created body and the role 'lorry'
    return this.createCreep(body, undefined, {
      role: 'attacker',
      working: false,
      home: home,
      target: target
    });
  };

// create a new function for StructureSpawn
StructureSpawn.prototype.createAttacker =
  function(energy, home) {
    // create a body with twice as many ATTACK as MOVE parts
    var numberOfParts = Math.floor(energy / 150);
    // make sure the creep is not too big (more than 50 parts)
    numberOfParts = Math.min(numberOfParts, Math.floor(50 / 3));
    var body = [];
    for (let i = 0; i < numberOfParts; i++) {
      body.push(ATTACK);
      body.push(MOVE);
    }

    // create creep with the created body and the role 'attack'
    return this.createCreep(body, undefined, {
      role: 'attacker',
      target: 'E16S18',
      home: home
    });
  };
