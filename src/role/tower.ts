class TowerDecorator {
  private readonly tower: StructureTower;

  constructor(tower: StructureTower) {
    this.tower = tower;
  }

  run() {
    if (this.attack()) return;
    if (this.heal()) return;
    if (this.repair()) return;
  }

  private heal(): boolean {
    const closestCreep = this.tower.pos.findClosestByRange(FIND_MY_CREEPS, {
      filter: creep => creep.hits < creep.hitsMax
    });
    if (!closestCreep) return false;

    this.tower.heal(closestCreep);
    return true;
  }

  private repair(): boolean {
    const closestStructure = this.tower.pos.findClosestByRange(FIND_STRUCTURES, {
      filter: (structure) => structure.hits < structure.hitsMax
    });
    if (!closestStructure) return false;

    this.tower.repair(closestStructure);
    return true;
  }

  private attack(): boolean {
    const closestHostile = this.tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    if (!closestHostile) return false;

    this.tower.attack(closestHostile);
    return true;
  }
}

export {
  TowerDecorator
};
