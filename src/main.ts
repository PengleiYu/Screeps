import { ErrorMapper } from "utils/ErrorMapper";
import { RoomDecorate } from "./role/room";

import { watcher } from "./watch-client";
import { workerFactory } from "./role/creeps";


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
    const decorate = new RoomDecorate(room);
    decorate.run();
  }

  for (const name in Game.creeps) {
    const creep = Game.creeps[name];
    const worker = workerFactory(creep);
    worker.run();
  }
});
