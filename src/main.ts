import { ErrorMapper } from "utils/ErrorMapper";

function createFirstCreep() {
  const firstCreep = "Harvester1";
  if (firstCreep in Game.creeps) return;

  console.log(`${firstCreep} 不存在，需要创建`);
  const result = Game.spawns.Spawn1.spawnCreep([WORK, CARRY, MOVE], firstCreep);
  console.log(`result=${result}`);
}

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  console.log(`Current game tick is ${Game.time}`);
  createFirstCreep();

  // Automatically delete memory of missing creeps
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
    }
  }
});
