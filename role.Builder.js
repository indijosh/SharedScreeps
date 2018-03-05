var roleUpgrader = require('role.Upgrader');

var roleBuilder = {
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
			if (creep.carry.energy == creep.carryCapacity){
				creep.memory.working == true;
			}
		}
		else {
			const target = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES);
			if(target) {
			    if(creep.build(target) == ERR_NOT_IN_RANGE) {
			        creep.moveTo(target);
			    }
			}
			else {
				roleUpgrader.run(creep);
			}
		}
	}
}
module.exports = roleBuilder
