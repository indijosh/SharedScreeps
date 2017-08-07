module.exports = {
  runReaction: function() {
    localRoom = Game.rooms['E61S92'];
    // get all labs
    var labs = localRoom.find(FIND_MY_STRUCTURES, {
      filter: {
        structureType: STRUCTURE_LAB
      }
    });
    for (let lab of labs) {
      if (lab.mineralType == 'UO') {
        var reactionLab = lab;
      }
      if (lab.mineralType == 'O') {
        var oxygenLab = lab;
      }
      if (lab.mineralType == 'U') {
        var utriumLab = lab;
      }
    }
    if (reactionLab && oxygenLab && utriumLab) {
      if(reactionLab.cooldown < 1){
        reactionLab.runReaction(oxygenLab, utriumLab);
      }
    }
  }
};
