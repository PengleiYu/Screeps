import { ErrorMapper } from "utils/ErrorMapper";
import { RoomDecorate } from "./role/room";

import { watcher } from "./watch-client";
import { workerFactory } from "./role/creeps";

declare global {

  type ROLE_HARVESTER = "harvester";
  type ROLE_UPGRADER = "upgrader";
  type ROLE_BUILDER = "builder";
  type ROLE_REPAIRER = "repairer"
  type ROLE_TRANSFERER = "transferer"
  type CreepRole = ROLE_HARVESTER | ROLE_UPGRADER | ROLE_BUILDER | ROLE_REPAIRER | ROLE_TRANSFERER

  interface CreepSpawnConfig {
    role: CreepRole,
    minCount: number,
    body: BodyPartConstant[]
  }

// memory extension samples
  interface CreepMemory {
    role: CreepRole;
    room?: string;
    working?: boolean;
  }

  interface RoomMemory {
    roleCount: { [role: string]: number };
  }

  interface Memory {
    uuid: number;
    log: any;
  }

// `global` extension samples
  namespace NodeJS {
    interface Global {
      log: any;
    }
  }
}

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
    if (!worker) {
      console.log(`${creep.name} is null`);
      continue;
    }
    worker.run();
  }
});
