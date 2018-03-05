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
    var targetStructure;
    var controllerContainer;
    var homeRoom = Game.rooms[creep.memory.home];

    // if we can see our home room...
    if (homeRoom != undefined) {
      // look for storage
      targetStructure = homeRoom.find(FIND_MY_STRUCTURES, {
        filter: (s) => s.structureType == STRUCTURE_STORAGE &&
          _.sum(s.store) < s.storeCapacity
      });
      
        // if we found a target
      if (targetStructure != undefined) {
        // try to transfer energy, if it is not in range
        for (const resourceType in creep.carry) {
          if (creep.transfer(targetStructure[0], resourceType) == ERR_NOT_IN_RANGE) {
            creep.travelTo(targetStructure[0]);
          }
        }
      }

      // if the storage is full, drop it into the container by the controller
      if (targetStructure == undefined) {
        controllerContainer = homeRoom.controller.pos.findInRange(FIND_STRUCTURES, 3, {
         filter: s => s.structureType == STRUCTURE_CONTAINER &&
            s.store[RESOURCE_ENERGY] < s.storeCapacity
        })[0];
        if (controllerContainer != undefined) {
          targetStructure = controllerContainer;
        }
      }

      // if the storage and the controllerContainer are full, store it in the terminal
      if (targetStructure == undefined) {
        if (homeRoom.terminal != undefined) {
          if (homeRoom.terminal.store[RESOURCE_ENERGY] <= 50000) {
            targetStructure = homeRoom.terminal;
          }
        }
      }

      
    }
    // if we can't see our home room, set up a scouting mission to go to it
    else {
      console.log("Cannot see room ", homeRoom);
    }
  }
