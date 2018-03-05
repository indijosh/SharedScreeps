var roleBuilder = require('role.Builder')

var roleHarvester = {
	run: function(creep){
		if (creep.memory.working == undefined){
			creep.memory.working = false;
		}
		if (creep.memory.working == false && creep.carry.energy == creep.carryCapacity){
			creep.memory.working = true;
		}
		else if (creep.memory.working == true && creep.carry.energy == 0){
			creep.memory.working = false;
		}
		// harvest if creep has capacity
		if (creep.memory.working == false){
			// find all the sources in the room
			var sources = creep.room.find(FIND_SOURCES)
			// harvest the first resource in the list
			if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
		        creep.moveTo(sources[0]);
		    }
		}
		else {
			if (Game.spawns['Spawn1'].energy < Game.spawns['Spawn1'].energyCapacity){
				//move to and transfer to Spawn 1
				if (creep.transfer(Game.spawns['Spawn1'], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
			        creep.moveTo(Game.spawns['Spawn1']);
			    }
			}
			else {
				roleBuilder.run(creep);
			}
		}
	}
}
module.exports = roleHarvester
