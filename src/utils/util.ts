function moveToIfNotInRange(creep: Creep, target: { pos: RoomPosition }, returnCode: ScreepsReturnCode) {
  if (returnCode === ERR_NOT_IN_RANGE) {
    const color = creep.memory.working ? "#ffffff" : "#ffaa00";
    creep.moveTo(target, {
      visualizePathStyle: {
        stroke: color
      }
    });
  }
}

function forceGetEnergyStore(structure: Structure): Store<RESOURCE_ENERGY, any> {
  return (structure as any).store;
}

function findStorableStructByRange(pos: RoomPosition, structTypes: string[]): Structure<any> | null {
  return pos.findClosestByRange(FIND_STRUCTURES, {
    filter: struct => {
      const includes = structTypes.includes(struct.structureType);
      if (!includes) return false;
      if (!("store" in struct)) return false;

      const store = (struct as any).store as Store<RESOURCE_ENERGY, any>;
      return store.getFreeCapacity(RESOURCE_ENERGY) > 0;
    }
  });
}

export {
  moveToIfNotInRange, forceGetEnergyStore, findStorableStructByRange
};
