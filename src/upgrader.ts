const roleUpgrader = {
  run(creep: Creep) {
    const isNoEnergy = creep.store.energy === 0;
    if (isNoEnergy) {
      this.harvest(creep);
    } else {
      this.upgrade(creep);
    }
  },
  upgrade(creep: Creep) {
    const controller = creep.room.controller;
    if (!controller) {
      console.error("room没有controller");
      return;
    }

    if (creep.upgradeController(controller) === ERR_NOT_IN_RANGE) {
      creep.moveTo(controller);
    }
  },
  harvest(creep: Creep) {
    const sourcesList = creep.room.find(FIND_SOURCES);
    const sourceTarget = sourcesList[0];
    if (!sourceTarget) {
      console.error("room没有source");
      return;
    }

    if (creep.harvest(sourceTarget) === ERR_NOT_IN_RANGE) {
      creep.moveTo(sourceTarget);
    }
  }
};

export {
  roleUpgrader
};
