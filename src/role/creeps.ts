import { forceGetEnergyStore, moveToIfNotInRange } from "../utils/util";

abstract class TwoStateWorker {
  protected readonly creep: Creep;

  protected constructor(creep: Creep) {
    this.creep = creep;
  }

  protected abstract work(): void;

  public run() {
    this.switchWorkState();

    if (this.isInWorking()) {
      this.work();
    } else {
      this.collectEnergy();
    }
  }

  protected switchWorkState(): void {
    if (this.isInWorking() && this.isWorkResourceEmpty()) {
      this.changeWorkState(false);
      this.say(`停止${this.getWorkType()}去搜集`);
    } else if (!this.isInWorking() && this.isWorkResourceFull()) {
      this.changeWorkState(true);
      this.say(`搜集完成去${this.getWorkType()}`);
    }
  }

  protected collectEnergy() {
    if (this.withdrawEnergy()) return;
    if (this.harvest()) return;
  }

  protected isWorkResourceFull(): boolean {
    return this.creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0;
  }

  protected isWorkResourceEmpty(): boolean {
    return this.creep.store.energy === 0;
  }

  protected isInWorking(): boolean {
    return this.creep.memory.working ?? false;
  }

  protected changeWorkState(working: boolean) {
    this.creep.memory.working = working;
  }

  protected harvest(): boolean {
    const target = this.creep.pos.findClosestByRange(FIND_SOURCES);
    if (!target) {
      return false;
    }
    const result = this.creep.harvest(target);
    moveToIfNotInRange(this.creep, target, result);
    return true;
  }

  protected withdrawEnergy(): boolean {
    const types = [
      STRUCTURE_CONTAINER,
      STRUCTURE_STORAGE
    ].map(it => it.toString());
    const target = this.creep.pos.findClosestByRange(FIND_STRUCTURES, {
      filter: structure => {
        const includes = types.includes(structure.structureType);
        if (!includes) return;
        const store = forceGetEnergyStore(structure);
        return store.energy > 0;
      }
    });
    if (!target) {
      return false;
    }
    const result = this.creep.withdraw(target, RESOURCE_ENERGY);
    moveToIfNotInRange(this.creep, target, result);
    return true;
  }

  protected say(msg: string) {
    this.creep.say(msg);
    console.log(`${this.creep.name}: ${msg}`);
  }

  protected getWorkType(): string {
    switch (this.creep.memory.role) {
      case "repairer":
        return "修理";
      case "harvester":
        return "存储";
      case "upgrader":
        return "升级";
      case "builder":
        return "建造";
    }
  }
}

// tslint:disable-next-line:max-classes-per-file
class Upgrader extends TwoStateWorker {
  constructor(creep: Creep) {
    super(creep);
  }

  protected work(): void {
    const controller = this.creep.room.controller;
    if (!controller) {
      console.log("room没有controller");
      return;
    }

    const result = this.creep.upgradeController(controller);
    moveToIfNotInRange(this.creep, controller, result);
  }

}

// tslint:disable-next-line:max-classes-per-file
class Builder extends TwoStateWorker {
  constructor(creep: Creep) {
    super(creep);
  }

  protected work(): void {
    const lowPriorityTypes = [STRUCTURE_ROAD].map(it => it.toString());

    function findHighPriorityDeposits(creep: Creep) {
      return creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES, {
        filter: site => !(lowPriorityTypes.includes(site.structureType))
      });
    }

    function findLowPriorityDeposits(creep: Creep) {
      return creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES, {
        filter: site => lowPriorityTypes.includes(site.structureType)
      });
    }

    const target = findHighPriorityDeposits(this.creep) || findLowPriorityDeposits(this.creep);

    if (!target) return;

    const result = this.creep.build(target);
    moveToIfNotInRange(this.creep, target, result);
  }
}

// tslint:disable-next-line:max-classes-per-file
class Harvester extends TwoStateWorker {
  constructor(creep: Creep) {
    super(creep);
  }

  protected collectEnergy() {
    this.harvest();
  }

  protected work(): void {
    const typesPriority1 = [
      STRUCTURE_EXTENSION,
      STRUCTURE_SPAWN
    ];
    const typesPriority2 = [
      STRUCTURE_TOWER
    ];
    const typesPriority3 = [
      STRUCTURE_CONTAINER
    ];
    let target = this.getClosetEnergyStore(typesPriority1);
    if (!target) target = this.getClosetEnergyStore(typesPriority2);
    if (!target) target = this.getClosetEnergyStore(typesPriority3);
    if (!target) return;

    const result = this.creep.transfer(target, RESOURCE_ENERGY);
    moveToIfNotInRange(this.creep, target, result);
  }

  private getClosetEnergyStore(structureTypes: string[]): Structure<any> | null {
    const types = structureTypes.map(it => it.toString());
    return this.creep.pos.findClosestByRange(FIND_STRUCTURES, {
      filter: structure => {
        const includes = types.includes(structure.structureType);
        if (!includes) return false;

        const store = forceGetEnergyStore(structure);
        return store.getFreeCapacity(RESOURCE_ENERGY) > 0;
      }
    });
  }
}

// tslint:disable-next-line:max-classes-per-file
class Repairer extends TwoStateWorker {
  constructor(creep: Creep) {
    super(creep);
  }

  protected work(): void {
    const target = this.findTarget();
    if (!target) {
      return;
    }
    const result = this.creep.repair(target);
    moveToIfNotInRange(this.creep, target, result);
  }

  private findTarget(): Structure<any> | null {
    return this.creep.pos.findClosestByRange(FIND_STRUCTURES, {
      filter: structure => structure.hits < structure.hitsMax
    });
  }
}

function workerFactory(creep: Creep): TwoStateWorker | null {
  switch (creep.memory.role) {
    case "repairer":
      return new Repairer(creep);
    case "harvester":
      return new Harvester(creep);
    case "upgrader":
      return new Upgrader(creep);
    case "builder":
      return new Builder(creep);
  }
}

export {
  workerFactory
};
