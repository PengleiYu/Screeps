import { moveToIfNotInRange } from "utils/util";

const roleUpgrader = {
  run(creep: Creep) {
    this.switchWorkState(creep);
    if (creep.memory.working) {
      this.upgrade(creep);
    } else {
      this.harvest(creep);
    }
  },
  switchWorkState(creep: Creep) {
    if (creep.memory.working && creep.store.energy === 0) {
      creep.memory.working = false;
    }
    if (!creep.memory.working && creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0) {
      creep.memory.working = true;
    }
  },
  upgrade(creep: Creep) {
    const controller = creep.room.controller;
    if (!controller) {
      console.log("room没有controller");
      return;
    }

    const result = creep.upgradeController(controller);
    moveToIfNotInRange(creep, controller, result);
  },
  harvest(creep: Creep) {
    const sourcesList = creep.room.find(FIND_SOURCES);
    const sourceTarget = sourcesList[0];
    if (!sourceTarget) {
      console.log("room没有source");
      return;
    }

    const result = creep.harvest(sourceTarget);
    moveToIfNotInRange(creep, sourceTarget, result);
  }
};

export {
  roleUpgrader
};
