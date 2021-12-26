const roleTower = {
  run(tower: StructureTower) {
    this.heal(tower);
    this.attack(tower);
  },
  heal(tower: StructureTower) {
    const closestStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
      filter: (structure) => structure.hits < structure.hitsMax
    });
    if (closestStructure) {
      tower.repair(closestStructure);
    }
  },
  attack(tower: StructureTower) {
    const closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    if (closestHostile) {
      tower.attack(closestHostile);
    }
  }
};

export {
  roleTower
};
