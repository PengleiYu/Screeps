import { roleTower } from "./tower";

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

const roleRoom = {
  run(room: Room) {
    this.spawnCreeps(room);
    this.runTower(room);
  },
  runTower(room: Room) {
    const towerList = room.find(FIND_MY_STRUCTURES, {
      filter: structure => structure.structureType === STRUCTURE_TOWER
    });
    for (const element of towerList) {
      const tower = element as StructureTower;
      roleTower.heal(tower);
      roleTower.attack(tower);
    }
  },
  spawnCreeps(room: Room) {
    const configArr = [configOfHarvester, configOfUpgrader, configOfBuilder, configOfRepairer];
    for (const config of configArr) {
      this.spawnEnoughCreeps(room, config);
    }
  },
  hintSpawning(spawn: StructureSpawn) {
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
      console.log(`${spawn.name}剩余能量:${(spawn.store.energy)}`);
    }
  },
  getRoleCount(room: Room, spawnConfig: CreepSpawnConfig) {
    let creepCount;
    const roomMemory = room.memory;
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
  },
  spawnEnoughCreeps(room: Room, spawnConfig: CreepSpawnConfig) {
    const creepRole = spawnConfig.role;

    const harvesters = room.find(FIND_MY_CREEPS, {
      filter: creep => creep.memory.role === creepRole
    });
    // console.log(`${creepRole}: current count=${harvesters.length}`);

    const spawn = this.getDefaultSpawn();
    const creepCount = this.getRoleCount(room, spawnConfig);

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
  },
  getDefaultSpawn() {
    const nameDefaultSpawn = "Spawn1";
    return Game.spawns[nameDefaultSpawn];
  }
};

export {
  roleRoom
};
