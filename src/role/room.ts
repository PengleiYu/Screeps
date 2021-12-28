import { TowerDecorator } from "./tower";

const configOfHarvester: CreepSpawnConfig = {
  role: "harvester",
  minCount: 1,
  body: [WORK, CARRY, MOVE]
};
const configOfUpgrader: CreepSpawnConfig = {
  role: "upgrader",
  minCount: 1,
  body: [WORK, CARRY, MOVE]
};
const configOfBuilder: CreepSpawnConfig = {
  role: "builder",
  minCount: 3,
  body: [WORK, CARRY, MOVE]
};
const configOfRepairer: CreepSpawnConfig = {
  role: "repairer",
  minCount: 2,
  body: [WORK, CARRY, MOVE]
};

class RoomDecorate {
  private readonly room: Room;

  constructor(room: Room) {
    this.room = room;
  }

  public run() {
    this.spawnCreeps();
    this.runTower();
  }

  private runTower() {
    const towerList = this.room.find(FIND_MY_STRUCTURES, {
      filter: structure => structure.structureType === STRUCTURE_TOWER
    });
    for (const element of towerList) {
      const tower = element as StructureTower;
      const decorator = new TowerDecorator(tower);
      decorator.run();
    }
  }

  private spawnCreeps() {
    const configArr = [configOfHarvester, configOfUpgrader, configOfBuilder, configOfRepairer];
    for (const config of configArr) {
      this.spawnEnoughCreeps(config);
    }
  }

  private spawnEnoughCreeps(spawnConfig: CreepSpawnConfig) {
    const creepRole = spawnConfig.role;

    const harvesters = this.room.find(FIND_MY_CREEPS, {
      filter: creep => creep.memory.role === creepRole
    });
    // console.log(`${creepRole}: current count=${harvesters.length}`);

    const spawn = this.getDefaultSpawn();
    const creepCount = this.getRoleCount(spawnConfig);

    if (harvesters.length >= creepCount || spawn.spawning) {
      return;
    }
    const newName = creepRole + Game.time;
    spawn.spawnCreep(spawnConfig.body, newName, {
      memory: {
        role: creepRole
      }
    });
    console.log(`开始孵化：${creepRole} - ${newName}`);
    this.hintSpawning(spawn);
  }

  private hintSpawning(spawn: StructureSpawn) {
    if (spawn.spawning) {
      const name = spawn.spawning.name;
      const spawningCreep = Game.creeps[name];
      this.room.visual.text(
        `🛠${spawningCreep.memory.role}`,
        spawn.pos.x + 1, spawn.pos.y,
        {
          align: "left", opacity: 0.8
        }
      );
      console.log(`${spawn.name}剩余能量:${(spawn.store.energy)}`);
    }
  }

  private getRoleCount(spawnConfig: CreepSpawnConfig) {
    let creepCount;
    const roomMemory = this.room.memory;
    if (!roomMemory.roleCount) {
      roomMemory.roleCount = {};
    }
    const roleCount = roomMemory.roleCount;
    if (spawnConfig.role in roleCount) {
      creepCount = roomMemory.roleCount[spawnConfig.role];
    }
    if (!creepCount) {
      creepCount = spawnConfig.minCount;
    }
    return creepCount;
  }

  getDefaultSpawn() {
    const nameDefaultSpawn = "Spawn1";
    return Game.spawns[nameDefaultSpawn];
  }
}

export {
  RoomDecorate
};
