module.exports = {
  // a function to run the logic for this role
  run: function(creep) {
    if (creep.memory.target != undefined && creep.room.name != creep.memory.target && creep.memory.working == false) {
      // find exit to target room
      var exit = creep.room.findExitTo(creep.memory.target);
      // move to exit
      creep.moveTo(creep.pos.findClosestByRange(exit));
      // return the function to not do anything else
      return;
    }

    // get source
    let source = Game.getObjectById(creep.memory.sourceId);
    // find container next to source
    let container = source.pos.findInRange(FIND_STRUCTURES, 1, {
      filter: s => s.structureType == STRUCTURE_CONTAINER
    })[0];

    // if creep is on top of the container
    if(container){
       if (creep.pos.isEqualTo(container.pos)) {
      // harvest source
      creep.harvest(source);
    }
    // if creep is not on top of the container
    else {
      // move towards it
      creep.moveTo(container);
    } 
    }
    
  }
};
