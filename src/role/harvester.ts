import { getDefaultSpawn } from "../utils";

const roleHarvester = {
  run(creep: Creep) {
    // creep容量未满则收获能量，否则转移能量
    const isCreepNotFull = creep.store.getFreeCapacity() > 0;
    if (isCreepNotFull) {
      this.harvest(creep);
    } else {
      this.transfer(creep);
    }
  },
  harvest(creep: Creep) {
    const sourceList = creep.room.find(FIND_SOURCES);
    const sourceTarget = sourceList[0];
    if (creep.harvest(sourceTarget) === ERR_NOT_IN_RANGE) {// 尝试收获，不在距离内则移动过去
      creep.moveTo(sourceTarget, { visualizePathStyle: { stroke: "#ffaa00" } });
    }
  },
  transfer(creep: Creep) {
    const target = this.getTransferTarget(creep);
    if (!target) {
      console.log("没有可转移的目标");
      return;
    }

    if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {// 尝试转移，不在距离内则移动过去
      creep.moveTo(target, { visualizePathStyle: { stroke: "#ffffff" } });
    }
  },
  getTransferTarget(creep: Creep): Structure<any> {
    const targetList = creep.room.find(FIND_STRUCTURES, {
      filter(structure) {
        const isEnergyStruct = structure.structureType === STRUCTURE_EXTENSION
          || structure.structureType === STRUCTURE_SPAWN;
        if (!isEnergyStruct) {
          return false;
        }
        const it = structure as StructureSpawn | StructureExtension;
        return it.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
      }
    });

    return targetList[0];
  }
};
export {
  roleHarvester
};
