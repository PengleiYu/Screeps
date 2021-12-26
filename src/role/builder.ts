import { moveToIfNotInRange } from "../utils/util";

const roleBuilder = {
  run(creep: Creep) {
    this.switchBuilderState(creep);

    if (creep.memory.working) {
      this.build(creep);
    } else {
      this.harvest(creep);
    }
  },
  harvest(creep: Creep) {
    const sourcesList = creep.room.find(FIND_SOURCES);
    const target = sourcesList[0];
    if (!target) {
      console.log("room没有source");
      return;
    }
    const result = creep.harvest(target);
    moveToIfNotInRange(creep, target, result);
  },
  build(creep: Creep) {
    const lowPriorityTypes = [STRUCTURE_ROAD].map(it => it.toString());

    function findHighPriorityDeposits() {
      const deposits = creep.room.find(FIND_CONSTRUCTION_SITES, {
        filter: site => !(lowPriorityTypes.includes(site.structureType))
      });
      return deposits[0];
    }

    function findLowPriorityDeposits() {
      const deposits = creep.room.find(FIND_CONSTRUCTION_SITES, {
        filter: site => lowPriorityTypes.includes(site.structureType)
      });
      return deposits[0];
    }

    const target = findHighPriorityDeposits() || findLowPriorityDeposits();

    if (!target) {
      console.log("room没有deposit");
      return;
    }
    const result = creep.build(target);
    moveToIfNotInRange(creep, target, result);
  },
  switchBuilderState(creep: Creep) {
    if (creep.memory.working && creep.store.energy === 0) {
      creep.memory.working = false;
      creep.say("🔄 harvest");
    }
    if (!creep.memory.working && creep.store.getFreeCapacity() === 0) {
      creep.memory.working = true;
      creep.say("🚧 build");
    }
  }
};

export {
  roleBuilder
};
