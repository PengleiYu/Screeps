// example declaration file - remove these and add your own custom typings


type ROLE_HARVESTER = "harvester";
type ROLE_UPGRADER = "upgrader";
type ROLE_BUILDER = "builder";
type ROLE_REPAIRER = "repairer"
type ROLE_TRANSFERER = "transferer"
declare type CreepRole = ROLE_HARVESTER | ROLE_UPGRADER | ROLE_BUILDER | ROLE_REPAIRER | ROLE_TRANSFERER

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
declare namespace NodeJS {
  interface Global {
    log: any;
  }
}
