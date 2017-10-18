var roles = {
  harvester: require('role.harvester'),
  upgrader: require('role.upgrader'),
  builder: require('role.builder'),
  repairer: require('role.repairer'),
  rampartRepairer: require('role.rampartRepairer'),
  longDistanceHarvester: require('role.longDistanceHarvester'),
  longDistanceHauler: require('role.longDistanceHauler'),
  enemyRoomHauler: require('role.enemyRoomHauler'),
  newRoomBuilder: require('role.newRoomBuilder'),
  newRoomRepairer: require('role.newRoomRepairer'),
  claimer: require('role.claimer'),
  miner: require('role.miner'),
  lorry: require('role.lorry'),
  mineralHarvester: require('role.mineralHarvester'),
  miningRoomDefender: require('role.miningRoomDefender'),
  localMover: require('role.localMover'),
  attacker: require('role.attacker'),
  healer: require('role.healer'),
  roomReserver: require('role.roomReserver'),
  drainer: require('role.drainer'),
  dismantler: require('role.dismantler'),
  controllerAttacker: require('role.controllerAttacker'),
  skRoomAttacker: require('role.SKRoomAttacker'),
  SKRoomEnergyMiner: require('role.SKRoomEnergyMiner'),
  SKRoomHauler: require('role.SKRoomHauler')
};

Creep.prototype.runRole =
  function() {
    roles[this.memory.role].run(this);
  };

/** @function
    @param {bool} useContainer
    @param {bool} useSource */
Creep.prototype.getEnergy =
  function(useContainer, useSource) {
    /** @type {StructureContainer} */
    let container;

    // if the Creep should look for containers
    if (useContainer) {
      // find closest container or storage with energy
      container = this.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: s => (s.structureType == STRUCTURE_CONTAINER ||
          s.structureType == STRUCTURE_STORAGE) &&
          s.store[RESOURCE_ENERGY] > 0
      });

      // if one was found
      if (container != undefined) {
        // try to withdraw energy, if the container is not in range
        if (this.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          // move towards it
          this.travelTo(container);
        }
      }
    }
    // if no container was found look for sources if there are no miners
    if (container == undefined && useSource) {
      // find closest source
      var source = this.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
      // try to harvest energy, if the source is not in range
      if (this.harvest(source) == ERR_NOT_IN_RANGE) {
        // move towards it
        this.travelTo(source);
      }
    }
  };

Creep.prototype.depositEnergy =
  function() {
    creep = this;
    let targets = [];
    var structure;
    var controllerContainer;
    var homeRoom = Game.rooms[creep.memory.home];

    if(creep.room.energyAvailable == creep.room.energyCapacityAvailable){
      // look for container by controller
      controllerContainer = this.room.controller.pos.findInRange(FIND_STRUCTURES, 3, {
        filter: s => s.structureType == STRUCTURE_CONTAINER &&
          s.store[RESOURCE_ENERGY] < s.storeCapacity
      })[0];
    }

    if (controllerContainer != undefined) {
      targets.push(controllerContainer);
    }

    // find closest spawn or extension which is not full
    if (structure == undefined) {
      // find closest spawn or extension which is not full
      structure = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
        // the second argument for findClosestByPath is an object which takes
        // a property called filter which can be a function
        // we use the arrow operator to define it
        filter: (s) => (s.structureType == STRUCTURE_SPAWN ||
            s.structureType == STRUCTURE_EXTENSION) &&
          s.energy < s.energyCapacity
      });
    }

    // find a tower if there aren't any spawns or extensions
    if (structure == undefined) {
      structure = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
        filter: (s) => (s.structureType == STRUCTURE_TOWER) &&
          (s.energyCapacity - s.energy) >= _.sum(creep.carry)
      });
    }

    // look for the terminal first if it has less than 100k energy
    if (structure == undefined && creep.room.terminal != undefined) {
      if (creep.room.terminal.store[RESOURCE_ENERGY] <= 50000) {
        structure = creep.room.terminal;
      }
    }

    // if there is nothing else to put it in, put it in storage
    if (structure == undefined && creep.room.storage != undefined) {
      structure = creep.room.storage;
    }

    if (structure != undefined) {
      targets.push(structure)
    }

    if (targets.length > 1) {
      structure = creep.pos.findClosestByRange(targets);
    }

    // if we found something to put it in
    if (structure != undefined) {
      // try to transfer energy, if it is not in range
      for (const resourceType in creep.carry) {
        if (creep.transfer(structure, resourceType) == ERR_NOT_IN_RANGE) {
          creep.travelTo(structure, {maxRooms: 1});
        }
      }
    }
  }
