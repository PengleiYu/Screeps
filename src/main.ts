import { ErrorMapper } from "utils/ErrorMapper";
import { roleHarvester } from "./role/harvester";
import { roleBuilder } from "./role/builder";
import { roleRoom } from "./role/room";

import { watcher } from "./watch-client";
import { Upgrader } from "./role/roles";


// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  watcher();


  // Automatically delete memory of missing creeps
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
    }
  }

  for (const name in Game.rooms) {
    const room = Game.rooms[name];
    roleRoom.run(room);
  }

  for (const name in Game.creeps) {
    const creep = Game.creeps[name];
    switch (creep.memory.role) {
      case "harvester":
        roleHarvester.run(creep);
        break;
      case "upgrader":
        new Upgrader(creep).run();
        break;
      case "builder":
        roleBuilder.run(creep);
        break;
    }
  }
});
