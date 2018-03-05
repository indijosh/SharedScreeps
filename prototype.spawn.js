var listOfRoles = [
	'harvester',
	'upgrader',
	'builder'
]

var numberOfCreeps = {};

StructureSpawn.prototype.spawnCreepsIfNeccessary = function (){
	if (this.spawning == null){
		name = undefined;
		var creepName = "C" + Game.time.toString(26).slice(-6) + Math.random().toString(26).slice(-3).toUpperCase();

		for (let role of listOfRoles){
			numberOfCreeps[role] = _.sum(Game.creeps, (c) => c.memory.role == role);
		}

		if (numberOfCreeps['harvester'] < 2){
			this.spawnCreep([WORK,CARRY,MOVE], creepName, {
				memory: {
					role: 'harvester',
					working: false
				}
			});
		}
		else if (numberOfCreeps['builder'] < 1){
			this.spawnCreep([WORK,CARRY,MOVE], creepName, {
				memory: {role: 'builder'}
			});
		}
		else if (numberOfCreeps['upgrader'] < 2){
			this.spawnCreep([WORK,CARRY,MOVE], creepName, {
				memory: {role: 'upgrader'}
			});
		}
	}
}
