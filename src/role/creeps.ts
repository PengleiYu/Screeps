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
      this.harvest();
    }
  }

  protected switchWorkState(): void {
    if (this.isInWorking() && this.isWorkResourceEmpty()) {
      this.changeWorkState(false);
      this.say(`停止${this.getWorkType()}去收获`);
    } else if (!this.isInWorking() && this.isWorkResourceFull()) {
      this.changeWorkState(true);
      this.say(`收获完成去${this.getWorkType()}`);
    }
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

  protected harvest(): void {
    const sourceList = this.creep.room.find(FIND_SOURCES);
    const sourceTarget = sourceList[0];
    const result = this.creep.harvest(sourceTarget);
    moveToIfNotInRange(this.creep, sourceTarget, result);
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
      const deposits = creep.room.find(FIND_CONSTRUCTION_SITES, {
        filter: site => !(lowPriorityTypes.includes(site.structureType))
      });
      return deposits[0];
    }

    function findLowPriorityDeposits(creep: Creep) {
      const deposits = creep.room.find(FIND_CONSTRUCTION_SITES, {
        filter: site => lowPriorityTypes.includes(site.structureType)
      });
      return deposits[0];
    }

    const target = findHighPriorityDeposits(this.creep) || findLowPriorityDeposits(this.creep);

    if (!target) {
      console.log("room没有deposit");

    }
    const result = this.creep.build(target);
    moveToIfNotInRange(this.creep, target, result);
  }
}

// tslint:disable-next-line:max-classes-per-file
class Harvester extends TwoStateWorker {
  constructor(creep: Creep) {
    super(creep);
  }

  protected work(): void {
    const target = this.getEnergyStore(this.creep);
    if (!target) {
      // console.log("没有可转移的目标");
      return;
    }

    const result = this.creep.transfer(target, RESOURCE_ENERGY);
    moveToIfNotInRange(this.creep, target, result);
  }

  private getEnergyStore(creep: Creep): Structure<any> {
    const types = [
      STRUCTURE_EXTENSION,
      STRUCTURE_SPAWN,
      STRUCTURE_CONTAINER,
      STRUCTURE_TOWER
    ].map(it => it.toString());

    const targetList = creep.room.find(FIND_STRUCTURES, {
      filter(structure) {
        const isEnergyStruct = types.includes(structure.structureType);
        if (!isEnergyStruct) return false;

        const store = forceGetEnergyStore(structure);
        return store.getFreeCapacity(RESOURCE_ENERGY) > 0;
      }
    });

    return targetList[0];
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

  private findTarget(): Structure<any> {
    const list = this.creep.room.find(FIND_STRUCTURES, {
      filter: structure => structure.hits < structure.hitsMax
    });
    return list[0];
  }
}

function workerFactory(creep: Creep): TwoStateWorker {
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
