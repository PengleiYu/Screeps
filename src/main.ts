import { ErrorMapper } from "utils/ErrorMapper";
import { roleHarvester } from "./role/harvester";
import { roleUpgrader } from "./role/upgrader";
import { roleBuilder } from "./role/builder";
import { getDefaultSpawn } from "./utils";

function spawnEnoughHarvesterCreeps() {
  const harvesters = _.filter(Game.creeps, (creep: Creep) => creep.memory.role === "harvester");
  console.log(`harvesters: ${harvesters.length}`);

  const spawn = getDefaultSpawn();
  if (harvesters.length < 2) {
    const newName = "Harvester" + Game.time;
    spawn.spawnCreep([WORK, CARRY, MOVE], newName, {
      memory: {
        role: "harvester"
      }
    });
  }
  if (spawn.spawning) {
    const name = spawn.spawning.name;
    const spawningCreep = Game.creeps[name];
    spawn.room.visual.text(
      `🛠${spawningCreep.memory.role}`,
      spawn.pos.x + 1, spawn.pos.y,
      {
        align: "left", opacity: 0.8
      }
    );
  }
}

function towerAttack() {
  const tower: StructureTower | null = Game.getObjectById("133657a2080568fba448bf4d");
  if (!tower) return;

  const closestStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
    filter: (structure) => structure.hits < structure.hitsMax
  });
  if (closestStructure) {
    tower.repair(closestStructure);
  }

  const closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
  if (closestHostile) {
    tower.attack(closestHostile);
  }
}


// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  console.log(`Current game tick is ${Game.time}`);


  // Automatically delete memory of missing creeps
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
    }
  }
  spawnEnoughHarvesterCreeps();
  towerAttack();


  for (const name in Game.creeps) {
    const creep = Game.creeps[name];
    switch (creep.memory.role) {
      case "harvester":
        roleHarvester.run(creep);
        break;
      case "upgrader":
        roleUpgrader.run(creep);
        break;
      case "builder":
        roleBuilder.run(creep);
        break;
    }
  }
});
