// import modules
require('prototype.creep');
require('prototype.tower');
require('prototype.spawn');
require('prototype.link');
require('Traveler');
require('run.marketAnalysis');

const profiler = require('screeps-profiler');
var grafana = require('grafana-tracking');
var reaction = require('run.reaction');

// This line monkey patches the global prototypes.
//profiler.enable();
module.exports.loop = function() {
  const gameTime = Game.time;
  //profiler.wrap(function() {
  Memory.minCostOfMinerals = { H: .01, O: .01, Z: .01};
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
    if (!Game.creeps[name].spawning) {
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

  var myRooms = _(Memory.stats.roomSummary).omit(_.isUndefined).omit(_.isNull).value();

  // for each spawn
  for (let spawnName in Game.spawns) {
    if (Game.spawns[spawnName].spawning == null) {
      // run spawn logic
      Game.spawns[spawnName].spawnCreepsIfNecessary();
    }
  }

  var links = _.filter(Game.structures, s => s.structureType == STRUCTURE_LINK);
  // for each link in the room
  for (let link of links) {
    // run link logic
    link.findLinkType();
  }

  // every tenth game tick...
  //if (gameTime % 10 == 0) {
    // Run marketAnalysis
    var terminals = _.filter(Game.structures, s => s.structureType == STRUCTURE_TERMINAL);
    // for each terminal
    for (let terminal of terminals) {
      if (terminal.cooldown == 0) {
        // run market logic
        terminal.runMarketAnalysis();
      }
    //}

    // look for rooms that need building attention
    for(let room in myRooms){
      numberOfExtensions = Game.rooms[room].find(FIND_MY_STRUCTURES, {
          filter: { structureType: STRUCTURE_EXTENSION }
      });
      numberOfAvailableExtensions = CONTROLLER_STRUCTURES["extension"][Game.rooms[room].controller.level]
      if(numberOfAvailableExtensions > numberOfAvailableExtensions - numberOfExtensions){
        console.log("ROOM ", room, " IS READY FOR BUILDING")
      }
    }

    // collect grafana stats
    grafana.collect_stats();
    Memory.stats.cpu.used = Game.cpu.getUsed();
  }

  //reaction.runReaction();
  //});
}
