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
    const configArr = [configOfHarvester, configOfUpgrader, configOfBuilder];
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
    }
  },
  spawnEnoughCreeps(room: Room, spawnConfig: CreepSpawnConfig) {
    const creepRole = spawnConfig.role;

    const harvesters = room.find(FIND_MY_CREEPS, {
      filter: creep => creep.memory.role === creepRole
    });
    console.log(`${creepRole}: current count=${harvesters.length}`);

    const spawn = this.getDefaultSpawn();
    if (harvesters.length >= spawnConfig.minCount
      || spawn.spawning) {
      return;
    }
    const newName = creepRole + Game.time;
    console.log(`开始孵化：${creepRole} - ${newName}`);
    spawn.spawnCreep(spawnConfig.body, newName, {
      memory: {
        role: creepRole
      }
    });
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
