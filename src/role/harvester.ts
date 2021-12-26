import { moveToIfNotInRange } from "../utils/util";

const roleHarvester = {
  run(creep: Creep) {
    this.switchWorkState(creep);

    if (creep.memory.working) {
      this.harvest(creep);
    } else {
      this.transfer(creep);
    }
  },
  switchWorkState(creep: Creep) {
    if (!creep.memory.working && creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
      creep.memory.working = true;
      creep.say("🔄 harvest");
    }
    if (creep.memory.working && creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
      creep.memory.working = false;
      creep.say("🚧 transfer");
    }
  },
  harvest(creep: Creep) {
    const sourceList = creep.room.find(FIND_SOURCES);
    const sourceTarget = sourceList[0];
    const result = creep.harvest(sourceTarget);
    moveToIfNotInRange(creep, sourceTarget, result);
  },
  transfer(creep: Creep) {
    const target = this.getTransferTarget(creep);
    if (!target) {
      console.log("没有可转移的目标");
      return;
    }

    const result = creep.transfer(target, RESOURCE_ENERGY);
    moveToIfNotInRange(creep, target, result);
  },
  getTransferTarget(creep: Creep): Structure<any> {
    const targetList = creep.room.find(FIND_STRUCTURES, {
      filter(structure) {
        const isEnergyStruct =
          structure.structureType === STRUCTURE_EXTENSION
          || structure.structureType === STRUCTURE_SPAWN
          || structure.structureType === STRUCTURE_TOWER;
        if (!isEnergyStruct) {
          return false;
        }

        const store = (structure as any).store as Store<RESOURCE_ENERGY, false>;
        return store.getFreeCapacity(RESOURCE_ENERGY) > 0;
      }
    });

    return targetList[0];
  }
};
export {
  roleHarvester
};
