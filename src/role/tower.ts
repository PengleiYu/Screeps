class TowerDecorator {
  private readonly tower: StructureTower;

  constructor(tower: StructureTower) {
    this.tower = tower;
  }

  run() {
    if (this.attack()) return;
    if (this.heal()) return;
  }

  private heal(): boolean {
    const closestStructure = this.tower.pos.findClosestByRange(FIND_STRUCTURES, {
      filter: (structure) => structure.hits < structure.hitsMax
    });
    if (closestStructure) {
      this.tower.repair(closestStructure);
      return true;
    }
    return false;
  }

  private attack(): boolean {
    const closestHostile = this.tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    if (closestHostile) {
      this.tower.attack(closestHostile);
      return true;
    }
    return false;
  }
}

export {
  TowerDecorator
};
