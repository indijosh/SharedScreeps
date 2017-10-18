// create a new function for StructureTower
StructureLink.prototype.findLinkType = function() {
  let isMinerLink = this.pos.findInRange(FIND_SOURCES, 2)[0];
  if (isMinerLink != undefined) {
    if (this.energy == this.energyCapacity && this.cooldown == 0) {
      var storageLink = this.findStorageLink();
      if (storageLink != undefined) {
        this.transferEnergy(storageLink, this.energy);
      }
    }
  } else {
    let isStorageLink = this.pos.findInRange(FIND_STRUCTURES, 2, {
      filter: s => s.structureType == STRUCTURE_STORAGE
    })[0];

    if (isStorageLink != undefined) {
      if (this.room.energyAvailable == this.room.energyCapacityAvailable && this.energy > 0 && this.cooldown == 0) {
        var controllerLink = this.findControllerLink();
        if (controllerLink != undefined) {
          // FIND OUT HOW TO SEND ENERGY TO LINK THAT IS ONLY PARTIALLY FULL
          this.transferEnergy(controllerLink, this.energy);
        }
      }
    }
  }
};
StructureLink.prototype.findStorageLink = function() {
  var links = _.filter(this.room.find(FIND_STRUCTURES), s => s.structureType == STRUCTURE_LINK);
  // for each link in the room
  for (let link of links) {
    let isStorageLink = link.pos.findInRange(FIND_STRUCTURES, 2, {
      filter: s => s.structureType == STRUCTURE_STORAGE
    })[0];
    if (isStorageLink != undefined) {
      return link
    }
  }
};
StructureLink.prototype.findControllerLink = function() {
  var links = _.filter(this.room.find(FIND_STRUCTURES), s => s.structureType == STRUCTURE_LINK);
  // for each link in the room
  for (let link of links) {
    let isControllerLink = link.pos.findInRange(FIND_STRUCTURES, 2, {
      filter: s => s.structureType == STRUCTURE_CONTROLLER
    })[0];
    if (isControllerLink != undefined) {
      return link
    }
  }
};
