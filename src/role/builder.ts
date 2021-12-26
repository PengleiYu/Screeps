const roleBuilder = {
  run(creep: Creep) {
    this.switchBuilderState(creep);

    if (this.isInBuilding(creep)) {
      this.build(creep);
    } else {
      this.harvest(creep);
    }
  },
  harvest(creep: Creep) {
    const sourcesList = creep.room.find(FIND_SOURCES);
    const target = sourcesList[0];
    if (!target) {
      console.error("room没有source");
      return;
    }
    if (creep.harvest(target) === ERR_NOT_IN_RANGE) {
      creep.moveTo(target, { visualizePathStyle: { stroke: "#ffaa00" } });
    }
  },
  build(creep: Creep) {
    const deposits = creep.room.find(FIND_CONSTRUCTION_SITES);
    const target = deposits[0];
    if (!target) {
      console.error("room没有deposit");
      return;
    }
    if (creep.build(target) === ERR_NOT_IN_RANGE) {
      creep.moveTo(target, { visualizePathStyle: { stroke: "#ffffff" } });
    }
  },
  switchBuilderState(creep: Creep) {
    if (this.isInBuilding(creep) && creep.store.energy === 0) {
      creep.memory.building = false;
      creep.say("🔄 harvest");
    }
    if (!this.isInBuilding(creep) && creep.store.getFreeCapacity() === 0) {
      creep.memory.building = true;
      creep.say("🚧 build");
    }
  },
  isInBuilding(creep: Creep) {
    return creep.memory.building;
  }
};

export {
  roleBuilder
};
