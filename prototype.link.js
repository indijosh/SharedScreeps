// create a new function for StructureTower
StructureLink.prototype.findLinkType =
  function() {
    //console.log(this);
    let isMinerLink = this.pos.findInRange(FIND_SOURCES, 2)[0];
    if (isMinerLink != undefined) {
      var storageLink = this.findStorageLink();
    }
    if(storageLink != undefined){
        this.transferEnergy(storageLink, this.energy);
    }
  };

StructureLink.prototype.findStorageLink =
  function() {
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
