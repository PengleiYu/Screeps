import { roleTower } from "./tower";

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
    this.spawnEnoughHarvesterCreeps(room);
  },
  spawnEnoughHarvesterCreeps(room: Room) {
    const harvesters = room.find(FIND_MY_CREEPS, {
      filter: creep => creep.memory.role === "harvester"
    });
    console.log(`harvesters: ${harvesters.length}`);

    const spawn = this.getDefaultSpawn();
    if (harvesters.length < 1) {
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
  },
  getDefaultSpawn() {
    const nameDefaultSpawn = "Spawn1";
    return Game.spawns[nameDefaultSpawn];
  }
};

export {
  roleRoom
};
