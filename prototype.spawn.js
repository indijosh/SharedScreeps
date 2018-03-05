var listOfRoles = ['lorry',
  'builder',
  'claimer',
  'controllerAttacker',
  'harvester',
  'localMover',
  'longDistanceHauler',
  'enemyRoomHauler',
  'attacker',
  'healer',
  'miner',
  'mineralHarvester',
  'miningRoomDefender',
  'newRoomRepairer',
  'repairer',
  'upgrader',
  'rampartRepairer',
  'drainer',
  'dismantler',
  'skRoomAttacker',
  'skRoomHauler'
];

// initialization of global variables
var room = undefined;
var maxEnergy = undefined;
var name = undefined;
var creepsFromRoom = [];
var numberOfCreeps = {};

// create a new function for StructureSpawn
StructureSpawn.prototype.spawnCreepsIfNecessary =
  function() {
    // set memory value if the spawn is new to avoid console errors.
    if (this.memory.minCreeps == null || this.memory.minCreeps == undefined) {
      this.memory.minCreeps = {};
    }

    // if currently not spawning anything
    if (this.spawning == null) {
      /** @type {Room} */
      room = this.room;
      maxEnergy = room.energyCapacityAvailable;
      name = undefined;

      // find all creeps in room
      /** @type {Array.<Creep>} */
      creepsFromRoom = _(Game.creeps).filter({
        memory: {
          home: room.name
        }
      }).value();

      // count the number of creeps alive for each role in this room
      // _.sum will count the number of properties in Game.creeps filtered by the
      //  arrow function, which checks for the creep being a specific role
      /** @type {Object.<string, number>} */
      for (let role of listOfRoles) {
        numberOfCreeps[role] = _.sum(creepsFromRoom, (c) => c.memory.role == role);
      }

      this.checkForDefenderCreeps();
      if (name == undefined) {
        this.checkForBackupCreeps();
      }

      if (name == undefined) {
        this.checkForMainRoomCreeps();
      }

      if (name == undefined) {
        this.checkForMiningRoomCreeps();
      }

      if (name == undefined) {
        this.checkForSKRoomCreeps();
      }

      // spawn up to three upgraders if the room has excess energy to use
      if (name == undefined &&
        this.room.energyAvailable == this.room.energyCapacityAvailable &&
        this.room.controller.level < 3 &&
        numberOfCreeps['upgrader'] < 6
      ) {
        name = this.createCustomCreep(room.energyAvailable, 'upgrader', room.name);
      }
      // if we are spawning something, print the details to the console
      if (name != undefined && _.isString(name)) {
        if (Game.creeps[name].memory.target) {
          console.log(this.name + " spawning " + Game.creeps[name].memory.role + " for " + Game.creeps[name].memory.target);
        } else {
          console.log(this.name + " spawning " + Game.creeps[name].memory.role + " for home");
        }
      }
    }
  };

StructureSpawn.prototype.checkForDefenderCreeps =
  function() {

  };

StructureSpawn.prototype.checkForBackupCreeps =
  function() {
    // if no harvesters are left AND either no miners or no lorries are left
    //  create a backup creep
    if (numberOfCreeps['harvester'] == 0 && numberOfCreeps['lorry'] == 0 && room.energyAvailable < maxEnergy / 4) {
      // if there are still miners or enough energy in Storage left
      if (numberOfCreeps['miner'] > 0) {
        // create a lorry
        name = this.createLorry(150, room.name);
        return;
      }
      // if there is no miner and not enough energy in Storage left
      else {
        // create a harvester because it can work on its own
        name = this.createCustomCreep(room.energyAvailable, 'harvester', room.name);
        return;
      }
    }
  };

StructureSpawn.prototype.checkForMainRoomCreeps =
  function() {
    // check if all sources have miners
    let sources = room.find(FIND_SOURCES);
    // iterate over all sources
    for (let source of sources) {
      // if the source has no miner
      if (!_.some(creepsFromRoom, c => c.memory.role == 'miner' && c.memory.sourceId == source.id)) {
        // look for links by the source
        let links = source.pos.findInRange(FIND_STRUCTURES, 2, {
          filter: s => s.structureType == STRUCTURE_LINK
        })[0];

        // if there is a link, spawn a miner with carry parts for depositing
        // in the link.
        if (links != undefined) {
          name = this.createMiner(source.id, room.name, true, links);
          return;
        } else {
          // check whether or not the source has a container
          /** @type {Array.StructureContainer} */
          let containers = source.pos.findInRange(FIND_STRUCTURES, 1, {
            filter: s => s.structureType == STRUCTURE_CONTAINER
          });
          // if there is a container next to the source
          if (containers.length > 0 && maxEnergy >= 550) {
            // spawn a miner
            name = this.createMiner(source.id, room.name, false, '');
            return;
          }
        }
      }
    }

    // spawn a mineral harvester if needed
    if (name == undefined && room.controller.level >= 6) {
      // find the mineral source
      let mineralSource = this.room.find(FIND_MINERALS)[0];

      // if the mineral source isn't empty or if it's about to regerate,
      // create a mineral harvest
      if (mineralSource.mineralAmount > 0 || mineralSource.ticksToRegeneration <= 20) {
        // make sure there's an extractor by the mineral source
        const extractor = this.room.find(FIND_STRUCTURES, {
          filter: s => s.structureType == STRUCTURE_EXTRACTOR
        });

        if (extractor != undefined) {
          if (!_.some(creepsFromRoom, c => c.memory.role == 'mineralHarvester')) {
            // look for a container by the mineral
            let container = mineralSource.pos.findInRange(FIND_STRUCTURES, 2, {
              filter: s => s.structureType == STRUCTURE_CONTAINER
            })[0];

            // if there is a container, spawn a harvester
            if (container != undefined) {
              name = this.createCustomCreep(800, 'mineralHarvester', room.name);
              return;
            }
          }
        }
        // if there isn't an extractor on the mineral, build one
        else {
          mineralSource.pos.createConstructionSite(STRUCTURE_EXTRACTOR);
        }
      }
    }

    for (let role of listOfRoles) {
      // check for claim order
      if (role == 'claimer' && numberOfCreeps[role] < this.memory.minCreeps[role]) {
        if (room.energyAvailable > 650) {
          // try to spawn a claimer
          name = this.createClaimer(this.memory.claimRoom, room.name, 'claimer');
          return;
        }
      }
      // check for controllerAttacker
      if (role == 'controllerAttacker' && numberOfCreeps[role] < this.memory.minCreeps[role]) {
        if (room.energyAvailable >= 3500) {
          // try to spawn a claimer
          name = this.createControllerAttacker(this.memory.claimRoom, room.name, 'controllerAttacker');
          return;
        }
      }

      // if no claim order or control attacker, check other roles
      else if (numberOfCreeps[role] < this.memory.minCreeps[role]) {
        if (role == 'lorry') {
          name = this.createLorry(maxEnergy, room.name);
          return;
        } else if (role == 'attacker') {
          if (this.memory.attackTarget != undefined) {
            if (maxEnergy < 850) {
              name = this.createAttacker(room.energyAvailable, room.name, this.memory.attackTarget);
              return;
            } else {
              name = this.createAttacker(maxEnergy, room.name, this.memory.attackTarget);
              return;
            }
          }
        } else if (role == 'healer') {
          if (maxEnergy < 700) {
            name = this.createHealer(room.energyAvailable, room.name);
            return;
          } else {
            name = this.createHealer(maxEnergy, room.name);
            return;
          }
        } else if (role == 'drainer') {
          if (maxEnergy >= 900) {
            name = this.createDrainer(900, room.name);
            return;
          }
        } else if (role == 'dismantler') {
          name = this.createDismantler(maxEnergy, room.name);
          return;
        } else if (role == 'upgrader' && this.room.energyAvailable >= 1200) {
          name = this.createBigUpgrader(1200, room.name)
          return;
        } else {
          if (maxEnergy >= 800) {
            name = this.createCustomCreep(800, role, room.name);
            return;
          } else {
            name = this.createCustomCreep(maxEnergy, role, room.name);
            return;
          }
        }
      }
    }
  };

StructureSpawn.prototype.checkForMiningRoomCreeps =
  function() {
    // if none of the above caused a spawn command check need for mining room creeps
    /** @type {Object.<string, number>} */
    let numberOfMiningRoomRepairers = {},
      numberOfMiningRoomDefenders = {},
      numberOfMiningRoomHaulers = {},
      numberOfEnemyRoomHaulers = {},
      numberOfMiningRoomClaimers = {};

    // count the number of long distance miners in each room. This will only
    // work if there is vision in that room since we need to count the sources
    // in the room.
    for (let roomName in this.memory.miningRooms) {
      var enemiesInRoom;
      if (Game.rooms[roomName] != undefined) {
        enemiesInRoom = Game.rooms[roomName].find(FIND_HOSTILE_CREEPS);
        if (enemiesInRoom.length > 0 && !_.some(creepsFromRoom, c =>
            c.memory.role == 'attacker' && c.memory.target == roomName)) {
          if (room.energyAvailable >= 1300) {
            name = this.createAttacker(1300, room.name, roomName);
            return;
          } else {
            name = this.createAttacker(room.energyAvailable, room.name, roomName);
            return;
          }
        } else if (enemiesInRoom.length == 0 && Game.rooms[roomName].controller.level == 0) {
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
                name = this.createMiner(source.id, room.name, false, '');
                return;
              }
            }
          }
          // if we don't need a miner, spawn a claimer
          if (name == undefined) {
            //console.log(roomName, Game.rooms[roomName].controller.reservation)
            numberOfMiningRoomClaimers[roomName] = _.sum(Game.creeps, (c) =>
              c.memory.role == 'roomReserver' && c.memory.target == roomName)
            if (numberOfMiningRoomClaimers[roomName] == 0) {
              if (Game.rooms[roomName].controller.reservation == undefined ||
                Game.rooms[roomName].controller.reservation.ticksToEnd < 4000) {
                name = this.createClaimer(roomName, room.name, 'roomReserver');
                return;
              }
            }
          }
        }
      }
      // if we don't need a claimer, spawn a repairer
      if (name == undefined) {
        numberOfMiningRoomRepairers[roomName] = _.sum(Game.creeps, (c) =>
          c.memory.role == 'newRoomRepairer' && c.memory.target == roomName)
        if (numberOfMiningRoomRepairers[roomName] < this.memory.miningRooms[roomName].numberOfMiningRoomRepairers) {
          if (room.energyCapacityAvailable >= 800) {
            name = this.createNewRoomRepairer(800, 'newRoomRepairer', room.name, roomName);
            return;
          } else {
            name = this.createNewRoomRepairer(maxEnergy, 'newRoomRepairer', room.name, roomName);
            return;
          }
        }
      }

      // spawn a hauler if needed
      if (name == undefined) {
        numberOfMiningRoomHaulers[roomName] = _.sum(Game.creeps, (c) =>
          c.memory.role == 'longDistanceHauler' && c.memory.target == roomName)

        if (numberOfMiningRoomHaulers[roomName] < this.memory.miningRooms[roomName].numberOfMiningRoomHaulers) {
          name = this.createLongDistanceHauler(maxEnergy, room.name, roomName, false);
          return;
        }
      }

      // spawn a hauler if needed
      if (name == undefined) {
        numberOfEnemyRoomHaulers[roomName] = _.sum(Game.creeps, (c) =>
          c.memory.role == 'enemyRoomHauler' && c.memory.target == roomName)

        if (numberOfEnemyRoomHaulers[roomName] < this.memory.miningRooms[roomName].numberOfEnemyRoomHaulers) {
          name = this.createEnemyRoomHauler(maxEnergy, room.name, roomName);
          return;
        }
      }

      // spawn a defender if needed
      if (name == undefined) {
        numberOfMiningRoomDefenders[roomName] = _.sum(Game.creeps, (c) =>
          c.memory.role == 'attacker' && c.memory.target == roomName)
        if (numberOfMiningRoomDefenders[roomName] < this.memory.miningRooms[roomName].numberOfMiningRoomDefenders) {
          name = this.createMiningRoomDefender(maxEnergy, room.name, roomName);
          return;
        }
      }
    }
  };

StructureSpawn.prototype.checkForSKRoomCreeps =
  function() {
    /** @type {Object.<string, number>} */
    let skRoomAttacker = {},
    skRoomHauler = {};

    // loop through skRooms in memory
    for (let roomName in this.memory.skRooms) {
      // try to spawn an attacker for the room
      skRoomAttacker[roomName] = _.sum(Game.creeps, (c) =>
        c.memory.role == 'skRoomAttacker' && c.memory.target == roomName)
      if (skRoomAttacker[roomName] == 0) {
        name = this.createSKRoomAttacker(roomName, room.name, 'skRoomAttacker');
        return;
      }

      // if there's already an attacker and it has less than 200 ticks, start
      // creating another one.
      if (skRoomAttacker[roomName] == 1) {
        skRoomAttackerCreep = _.find(Game.creeps, (c) =>
          c.memory.role == 'skRoomAttacker' && c.memory.target == roomName)
        if (skRoomAttackerCreep) {
          if (skRoomAttackerCreep.ticksToLive < 200) {
            name = this.createSKRoomAttacker(roomName, room.name, 'skRoomAttacker');
            return;
          }
        }
      }

      // if we can see the room, start spawning stuff. If we can't,
      // we need to send in attackers
      if (Game.rooms[roomName]) {
        // spawn hauler if needed
        skRoomHauler[roomName] = _.sum(Game.creeps, (c) =>
          c.memory.role == 'SKRoomHauler' && c.memory.target == roomName)

        if (skRoomHauler[roomName] < this.memory.skRooms[roomName].skRoomHaulers) {
          name = this.createLongDistanceHauler(maxEnergy, room.name, roomName, true);
          return;
        }

        // find all the sources in the room
        let sources = Game.rooms[roomName].find(FIND_SOURCES);
        // iterate over all sources
        for (let source of sources) {
          // if the source has no miner
          if (!_.some(creepsFromRoom, c => c.memory.role == 'SKRoomEnergyMiner' && c.memory.sourceId == source.id)) {
            // spawn a miner
            name = this.createSKMiner(source.id, room.name);
            return;
          }
        }
      }
    }
  };



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
    var creepName = "C" + Game.time.toString(26).slice(-6) + Math.random().toString(26).slice(-3).toUpperCase();

    // create creep with the created body and the given role
    var trySpawn = this.spawnCreep(body, creepName, {
      memory: {
        role: roleName,
        working: false,
        home: home,
        target: target
      }
    });
    return (trySpawn == 0 ? creepName : undefined);
  };

StructureSpawn.prototype.createCustomCreep =
  function(energy, roleName, home) {
    // create a balanced body as big as possible with the given energy
    var numberOfParts = Math.floor(energy / 66.6666);
    // make sure the creep is not too big (more than 50 parts)
    numberOfParts = Math.min(numberOfParts, Math.floor(50 / 3));
    var body = [];
    for (let i = 0; i < _.floor(numberOfParts / 3); i++) {
      body.push(WORK);
    }
    for (let i = 0; i < _.floor(numberOfParts / 3); i++) {
      body.push(CARRY);
    }
    for (let i = 0; i < _.floor(numberOfParts / 3); i++) {
      body.push(MOVE);
    }
    var creepName = "C" + Game.time.toString(26).slice(-6) + Math.random().toString(26).slice(-3).toUpperCase();

    // create creep with the created body and the given role
    var trySpawn = this.spawnCreep(body, creepName, {
      memory: {
        role: roleName,
        working: false,
        home: home
      }
    });
    return (trySpawn == 0 ? creepName : undefined);
  };

StructureSpawn.prototype.createBigUpgrader =
  function(energy, home) {
    // create a body with twice as many ATTACK as MOVE parts
    var numberOfParts = _.floor(energy / 75);
    // make sure the creep is not too big (more than 50 parts)
    numberOfParts = Math.min(numberOfParts, 50);
    var body = [];
    body.push(CARRY, CARRY);
    for (let i = 0; i < _.floor(numberOfParts / 2); i++) {
      body.push(WORK);
    }
    for (let i = 0; i < _.floor(numberOfParts / 4); i++) {
      body.push(MOVE);
    }
    var creepName = "C" + Game.time.toString(26).slice(-6) + Math.random().toString(26).slice(-3).toUpperCase();

    // create creep with the created body and the role 'attack'
    var trySpawn = this.spawnCreep(body, creepName, {
      memory: {
        role: 'upgrader',
        working: false,
        home: home
      }
    });
    return (trySpawn == 0 ? creepName : undefined);
  };

StructureSpawn.prototype.createLongDistanceHarvester =
  function(energy, numberOfWorkParts, home, target, sourceIndex) {
    // create a body with the specified number of WORK parts and one MOVE part per non-MOVE part
    var body = [];
    for (let i = 0; i < numberOfWorkParts + _.random(0, 8); i++) {
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
    var creepName = "C" + Game.time.toString(26).slice(-6) + Math.random().toString(26).slice(-3).toUpperCase();

    // create creep with the created body
    var trySpawn = this.spawnCreep(body, creepName, {
      memory: {
        role: 'longDistanceHarvester',
        home: home,
        target: target,
        sourceIndex: sourceIndex,
        working: false
      }
    });
    return (trySpawn == 0 ? creepName : undefined);
  };

StructureSpawn.prototype.createNewRoomBuilder =
  function(energy, numberOfWorkParts, home, target, sourceIndex) {
    target = 'E16S13';
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

    var creepName = "C" + Game.time.toString(26).slice(-6) + Math.random().toString(26).slice(-3).toUpperCase();

    // create creep with the created body
    var trySpawn = this.spawnCreep(body, creepName, {
      memory: {
        role: 'newRoomBuilder',
        home: home,
        target: target,
        sourceIndex: sourceIndex,
        working: false
      }
    });
    return (trySpawn == 0 ? creepName : undefined);
  };

StructureSpawn.prototype.createClaimer =
  function(target, home, role) {
    var creepName = "C" + Game.time.toString(26).slice(-6) + Math.random().toString(26).slice(-3).toUpperCase();

    var trySpawn = this.spawnCreep([CLAIM, CLAIM, MOVE, MOVE], creepName, {
      memory: {
        role: role,
        target: target,
        home: home
      }
    });
    return (trySpawn == 0 ? creepName : undefined);
  };

StructureSpawn.prototype.createControllerAttacker =
  function(target, home, role) {
    var creepName = "C" + Game.time.toString(26).slice(-6) + Math.random().toString(26).slice(-3).toUpperCase();

    var trySpawn = this.spawnCreep([CLAIM, CLAIM, CLAIM, CLAIM, CLAIM, MOVE, MOVE, MOVE, MOVE, MOVE], creepName, {
      memory: {
        role: role,
        target: target,
        home: home
      }
    });
    return (trySpawn == 0 ? creepName : undefined);
  };

StructureSpawn.prototype.createMiner =
  function(sourceId, home, needCarryParts, link) {
    var creepName = "C" + Game.time.toString(26).slice(-6) + Math.random().toString(26).slice(-3).toUpperCase();

    if (needCarryParts == false) {
      var trySpawn = this.spawnCreep([WORK, WORK, WORK, WORK, WORK, MOVE], creepName, {
        memory: {
          needsBoosting: true,
          role: 'miner',
          sourceId: sourceId,
          home: home,
          isCarryCreep: false,
          link: ""
        }
      });
    }
    if (needCarryParts == true) {
      var trySpawn = this.spawnCreep([WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE], creepName, {
        memory: {
          needsBoosting: true,
          role: 'miner',
          sourceId: sourceId,
          home: home,
          isCarryCreep: true,
          link: link
        }
      });
    }
    return (trySpawn == 0 ? creepName : undefined);
  };

StructureSpawn.prototype.createLorry =
  function(energy, home) {
    // figure out how many body parts we can make by taking the energy
    // and divide it by 50 (the cost of a move or carry part)
    var numberOfParts = Math.floor(energy / 50);
    // make sure the creep is not too big (no more than 25 parts)
    // 30 parts gives a carry capacity of 750
    numberOfParts = Math.min(numberOfParts, 30);
    var body = [];
    for (let i = 0; i < _.floor(numberOfParts / 2); i++) {
      body.push(MOVE);
      body.push(CARRY);
    }
    var creepName = "C" + Game.time.toString(26).slice(-6) + Math.random().toString(26).slice(-3).toUpperCase();

    // create creep with the created body and the role 'lorry'
    var trySpawn = this.spawnCreep(body, creepName, {
      memory: {
        role: 'lorry',
        working: false,
        home: home
      }
    });
    return (trySpawn == 0 ? creepName : undefined);
  };

StructureSpawn.prototype.createLongDistanceHauler =
  function(energy, home, target, isSKHauler) {
    var role = 'longDistanceHauler'

    // create a balanced body as big as possible with the given energy
    var numberOfParts = Math.floor(energy / 50);

    // make sure the creep isn't more than 50 parts
    numberOfParts = Math.min(numberOfParts, 50);

    var body = [];
    if(isSKHauler){
      body.push(WORK);
      role = 'SKRoomHauler';
    }
    for (let i = 0; i < _.floor(numberOfParts / 2 - 1); i++) {
      body.push(MOVE);
      body.push(CARRY);
    }
    var creepName = "C" + Game.time.toString(26).slice(-6) + Math.random().toString(26).slice(-3).toUpperCase();

    // create creep with the created body and the role 'longDistanceHauler'
    var trySpawn = this.spawnCreep(body, creepName, {
      memory: {
        role: role,
        working: false,
        home: home,
        target: target
      }
    });
    return (trySpawn == 0 ? creepName : undefined);
  };

StructureSpawn.prototype.createEnemyRoomHauler =
  function(energy, home, target) {
    // create a balanced body as big as possible with the given energy
    var numberOfParts = Math.floor(energy / 50);

    // make sure the creep isn't more than 50 parts
    numberOfParts = Math.min(numberOfParts, 50);

    var body = [];
    for (let i = 0; i < _.floor(numberOfParts / 2); i++) {
      body.push(MOVE);
      body.push(CARRY);
    }
    var creepName = "C" + Game.time.toString(26).slice(-6) + Math.random().toString(26).slice(-3).toUpperCase();

    // create creep with the created body and the role 'enemyRoomHauler'
    var trySpawn = this.spawnCreep(body, creepName, {
      memory: {
        role: 'enemyRoomHauler',
        working: false,
        home: home,
        target: target
      }
    });
    return (trySpawn == 0 ? creepName : undefined);
  };

StructureSpawn.prototype.createMiningRoomDefender =
  function(energy, home, target) {
    // create a balanced body as big as possible with the given energy
    var numberOfParts = Math.floor(energy / 50);
    // make sure the creep is not too big (more than 50 parts)
    numberOfParts = Math.min(numberOfParts, Math.floor(50 / 3));
    var body = [];
    for (let i = 0; i < numberOfParts; i++) {
      body.push(TOUGH);
    }
    for (let i = 0; i < numberOfParts / 3; i++) {
      body.push(ATTACK);
      body.push(RANGED_ATTACK);
      body.push(MOVE);
    }
    var creepName = "C" + Game.time.toString(26).slice(-6) + Math.random().toString(26).slice(-3).toUpperCase();

    // create creep with the created body and the role 'miningRoomDefender'
    var trySpawn = this.spawnCreep(body, creepName, {
      memory: {
        role: 'attacker',
        working: false,
        home: home,
        target: target
      }
    });
    return (trySpawn == 0 ? creepName : undefined);
  };

StructureSpawn.prototype.createAttacker =
  function(energy, home, target) {
    // create a body with twice as many ATTACK as MOVE parts
    var numberOfParts = _.floor(energy / 65);
    // make sure the creep is not too big (more than 50 parts)
    numberOfParts = Math.min(numberOfParts, 50);

    var body = [];
    for (let i = 0; i < _.floor(numberOfParts / 2); i++) {
      body.push(ATTACK);
      body.push(MOVE);
    }
    var creepName = "C" + Game.time.toString(26).slice(-6) + Math.random().toString(26).slice(-3).toUpperCase();

    // create creep with the created body and the role 'attack'
    var trySpawn = this.spawnCreep(body, creepName, {
      memory: {
        role: 'attacker',
        working: false,
        home: home,
        target: target
      }
    });
    return (trySpawn == 0 ? creepName : undefined);
  };

StructureSpawn.prototype.createHealer =
  function(energy, home) {
    // create a body with twice as many ATTACK as MOVE parts
    var numberOfParts = _.floor(energy / 150);
    // make sure the creep is not too big (more than 50 parts)
    numberOfParts = Math.min(numberOfParts, 50);
    var body = [];
    for (let i = 0; i < _.floor(numberOfParts / 2); i++) {
      body.push(HEAL);
      body.push(MOVE);
    }
    var creepName = "C" + Game.time.toString(26).slice(-6) + Math.random().toString(26).slice(-3).toUpperCase();

    // create creep with the created body and the role 'attack'
    var trySpawn = this.spawnCreep(body, creepName, {
      memory: {
        role: 'healer',
        working: false,
        home: home
      }
    });
    return (trySpawn == 0 ? creepName : undefined);
  };

StructureSpawn.prototype.createDrainer =
  function(energy, home) {
    // create a body with twice as many ATTACK as MOVE parts
    var numberOfParts = _.floor(energy / 150);
    // make sure the creep is not too big (more than 50 parts)
    numberOfParts = Math.min(numberOfParts, 50);
    var body = [];
    for (let i = 0; i < _.floor(numberOfParts / 2); i++) {
      body.push(HEAL);
      body.push(MOVE);
    }
    var creepName = "C" + Game.time.toString(26).slice(-6) + Math.random().toString(26).slice(-3).toUpperCase();

    // create creep with the created body and the role 'attack'
    var trySpawn = this.spawnCreep(body, creepName, {
      memory: {
        role: 'drainer',
        retreating: false,
        retreatTarget: 'E17S13',
        target: this.memory.attackTarget,
        home: home
      }
    });
    return (trySpawn == 0 ? creepName : undefined);
  };

StructureSpawn.prototype.createDismantler =
  function(energy, home) {
    // create a body with twice as many ATTACK as MOVE parts
    var numberOfParts = _.floor(energy / 75);
    // make sure the creep is not too big (more than 50 parts)
    numberOfParts = Math.min(numberOfParts, 50);
    var body = [];
    for (let i = 0; i < _.floor(numberOfParts / 2); i++) {
      body.push(WORK);
      body.push(MOVE);
    }
    var creepName = "C" + Game.time.toString(26).slice(-6) + Math.random().toString(26).slice(-3).toUpperCase();

    // create creep with the created body and the role 'attack'
    var trySpawn = this.spawnCreep(body, creepName, {
      memory: {
        role: 'dismantler',
        retreating: false,
        target: this.memory.attackTarget,
        home: home
      }
    });
    return (trySpawn == 0 ? creepName : undefined);
  };

StructureSpawn.prototype.createSKRoomAttacker =
  function(target, home, role) {
    var body = [];
    for (let i = 0; i < 24; i++) {
      body.push(MOVE);
    }
    for (let i = 0; i < 20; i++) {
      body.push(RANGED_ATTACK);
    }
    for (let i = 0; i < 4; i++) {
      body.push(HEAL);
    }

    var creepName = "C" + Game.time.toString(26).slice(-6) + Math.random().toString(26).slice(-3).toUpperCase();

    // create creep with the created body and the role 'attack'
    var trySpawn = this.spawnCreep(body, creepName, {
      memory: {
        role: role,
        target: target,
        home: home
      }
    });
    return (trySpawn == 0 ? creepName : undefined);
  };

StructureSpawn.prototype.createSKMiner =
  function(sourceId, home) {
    var body = [];
    body.push(CARRY);
    for (let i = 0; i < 10; i++) {
      body.push(WORK);
    }
    for (let i = 0; i < 5; i++) {
      body.push(MOVE);
    }

    var creepName = "C" + Game.time.toString(26).slice(-6) + Math.random().toString(26).slice(-3).toUpperCase();

    var trySpawn = this.spawnCreep(body, creepName, {
      memory: {
        needsBoosting: true,
        role: 'SKRoomEnergyMiner',
        sourceId: sourceId,
        home: home,
      }
    });
    return (trySpawn == 0 ? creepName : undefined);
  };
