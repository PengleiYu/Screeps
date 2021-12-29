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

export {
  moveToIfNotInRange, forceGetEnergyStore
};
