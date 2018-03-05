var roleHarvester = require('role.Harvester');
var roleUpgrader = require('role.Upgrader');
var roleBuilder = require('role.Builder')
require('prototype.spawn');

module.exports.loop = function() {

	//for each creep
	for(var name in Game.creeps){

		//create creep variable
		var creep = Game.creeps[name];

		//run harvester role if the creep's memory is harvester
		if(creep.memory.role == "harvester"){
			roleHarvester.run(creep)
		}

		//run uprader role if the creep's memory is upgrader
		if(creep.memory.role == "upgrader"){
			roleUpgrader.run(creep)
		}

		if(creep.memory.role == "builder"){
			roleBuilder.run(creep)
		}
	}

	for(let spawnName in Game.spawns){
		if (Game.spawns[spawnName].spawning == null){
			Game.spawns[spawnName].spawnCreepsIfNeccessary();
		}
	}
}
