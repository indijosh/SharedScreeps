// import modules
require('prototype.creep');
require('prototype.tower');
require('prototype.spawn');

var minHarvester = 0;
var minUpgrader = 2;
var minBuilder = 1;
var minRepairer = 2;
var minLorry = 1;
var minClaimer = 0;
var minLongDistanceHarvester = 2;
var minNumberOfNewRoomBuilders = 1;

var Room1 = 'E61S92';
var Room2 = 'E61S91';

module.exports.loop = function() {
    //UNCOMMENT THIS TO RESET MEMORY
    //Game.spawns.Spawn1.memory.minCreeps = { harvester: minHarvester, upgrader: minUpgrader, builder: minBuilder, repairer: minRepairer, lorry: minLorry, claimer: minClaimer };
    //Game.spawns.Spawn1.memory.minLongDistanceHarvesters = {E61S91:minLongDistanceHarvester };
    Game.spawns.Spawn1.memory.minNewRoomBuilders = {E61S91:minNumberOfNewRoomBuilders };

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
        // run creep logic
        Game.creeps[name].runRole();
    }

    // find all towers
    var towers = _.filter(Game.structures, s => s.structureType == STRUCTURE_TOWER);
    // for each tower
    for (let tower of towers) {
        // run tower logic
        tower.defend();
    }

    // for each spawn
    for (let spawnName in Game.spawns) {
        // run spawn logic
        Game.spawns[spawnName].spawnCreepsIfNecessary();
    }
};
