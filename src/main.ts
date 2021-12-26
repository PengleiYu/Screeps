import { ErrorMapper } from "utils/ErrorMapper";
import { roleHarvester } from "./role/harvester";
import { roleUpgrader } from "./role/upgrader";


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

  for (const name in Game.creeps) {
    const creep = Game.creeps[name];
    switch (creep.memory.role) {
      case "harvester":
        roleHarvester.run(creep);
        break;
      case "upgrader":
        roleUpgrader.run(creep);
        break;
    }
  }
});
