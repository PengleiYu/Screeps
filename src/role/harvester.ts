import { getDefaultSpawn } from "../utils";

const roleHarvester = {
  run(harvester: Creep) {
    // creep容量未满则收获能量，否则转移能量
    const isCreepNotFull = harvester.store.getFreeCapacity() > 0;
    if (isCreepNotFull) {
      this.harvest(harvester);
    } else {
      this.transfer(harvester);
    }
  },
  harvest(harvester: Creep) {
    const sourceList = harvester.room.find(FIND_SOURCES);
    const sourceTarget = sourceList[0];
    if (harvester.harvest(sourceTarget) === ERR_NOT_IN_RANGE) {// 尝试收获，不在距离内则移动过去
      harvester.moveTo(sourceTarget);
    }
  },
  transfer(harvester: Creep) {
    const spawn = getDefaultSpawn();
    if (harvester.transfer(spawn, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {// 尝试转移，不在距离内则移动过去
      harvester.moveTo(spawn);
    }
  }
};
export {
  roleHarvester
};
