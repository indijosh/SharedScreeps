// import modules
require('prototype.creep');
require('prototype.tower');
require('prototype.spawn');
require('prototype.link');
require('run.marketAnalysis');
var grafana = require('grafana-tracking');
var reaction = require('run.reaction');


module.exports.loop = function() {
  //Game.market.deal('59621e3df0f0c0400b5c1b67', 1, 'E61S92');
  //Game.spawns.Spawn1.memory.numberOfMiningRoomMiners = {E61S91: 1, E62S92: 2};
  //console.log(room.mineralType);
  //UNCOMMENT THIS TO RESET MEMORY
  //Game.spawns.Spawn1.memory.minCreeps = { harvester: 1, upgrader: 1};
  // check for memory entries of died creeps by iterating over Memory.creeps
  for (let name in Memory.creeps) {
    // and checking if the creep is still alive
    if (Game.creeps[name] == undefined) {
      // if not, delete the memory entry
      delete Memory.creeps[name];
    }
  }

  // for each creeps
  for (let name in Game.creeps) {
    // run creep logic if the creep isn't spawning
    if(!Game.creeps[name].spawning){
      Game.creeps[name].runRole();
    }
  }

  // find all towers
  var towers = _.filter(Game.structures, s => s.structureType == STRUCTURE_TOWER);
  // for each tower
  for (let tower of towers) {
    // run tower logic
    tower.defend();
  }

  // find the reaction lab
  //var lab = Game.getObjectById('596c771be7cf1c256fa58d00');
  //lab.runReaction();

  //const linkFrom = Game.rooms['E61S92'].lookForAt('structure', 34, 33)[0];
  //const linkTo = Game.rooms['E61S92'].lookForAt('structure', 15, 41)[0];
  //if (linkTo.energy < linkTo.energyCapacity) {
   //linkFrom.transferEnergy(linkTo);
  //} else {
  //  linkTo = Game.rooms['E61S92'].lookForAt('structure', 29, 13)[0];
  //  linkFrom.transferEnergy(linkTo);
 // }

  // for each spawn
  for (let spawnName in Game.spawns) {
    // run spawn logic
    Game.spawns[spawnName].spawnCreepsIfNecessary();
  }

  var terminals = _.filter(Game.structures, s => s.structureType == STRUCTURE_TERMINAL);
  // for each terminal
  for (let terminal of terminals) {
    // run market logic
    terminal.runMarketAnalysis();
  }

  var links = _.filter(Game.structures, s => s.structureType == STRUCTURE_LINK);
  // for each link in the room
  for (let link of links) {
    if(link.energy == link.energyCapacity && link.cooldown == 0){
      // run link logic
      link.findLinkType();
    }
  }

  //reaction.runReaction();
  grafana.collect_stats();
  Memory.stats.cpu.used = Game.cpu.getUsed();
  for (room in Memory.stats.roomSummary){
    if (room != null && room.num_enemies > 0){
      Game.notify("There are " + room.num_enemies + " attacking room " + room.room_name);
    }
  }
};
