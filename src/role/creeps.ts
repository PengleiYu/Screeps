import { findStorableStructByRange, forceGetEnergyStore, moveToIfNotInRange } from "../utils/util";
import { flatten } from "lodash";

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

  protected withdrawEnergy(storageFist: boolean = true): boolean {
    let types = [STRUCTURE_STORAGE, STRUCTURE_CONTAINER];
    if (!storageFist) types = types.reverse();
    const pos = this.creep.pos;

    function getTarget(storeTypes: string[]) {
      return pos.findClosestByRange(FIND_STRUCTURES, {
        filter: structure => {
          const includes = storeTypes.includes(structure.structureType);
          if (!includes) return;
          const store = forceGetEnergyStore(structure);
          return store.energy > 0;
        }
      });
    }

    let target;
    if (!target) {
      target = getTarget(types.slice(0, 1));
    }
    if (!target) {
      target = getTarget(types.slice(1, 2));
    }
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
      case "transferer":
        return "运输";
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
    const target = this.getClosetEnergyStore([STRUCTURE_CONTAINER]);
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

// tslint:disable-next-line:max-classes-per-file
class Transferor extends TwoStateWorker {
  constructor(creep: Creep) {
    super(creep);
  }

  protected collectEnergy() {
    super.withdrawEnergy(false);
  }

  protected work(): void {
    const target = this.getTransferTarget();
    if (!target) return;

    const result = this.creep.transfer(target, RESOURCE_ENERGY);
    moveToIfNotInRange(this.creep, target, result);
  }

  private getTransferTarget(): Structure<any> | null {
    const position = this.creep.pos;

    const spawnTypes = [STRUCTURE_SPAWN, STRUCTURE_EXTENSION];
    let target = findStorableStructByRange(position, spawnTypes);
    if (target) return target;

    const customerTypes = [STRUCTURE_TOWER].map(it => it.toString());
    target = position.findClosestByRange(FIND_STRUCTURES, {
      filter: struct => {
        const includes = customerTypes.includes(struct.structureType);
        if (!includes) return false;

        const store = forceGetEnergyStore(struct);
        const threshold = (store.getCapacity(RESOURCE_ENERGY) ?? 0) / 2;
        const freeCapacity = store.getFreeCapacity(RESOURCE_ENERGY);
        // console.log(`free=${freeCapacity}, threshold=${threshold}`);
        return freeCapacity > threshold * 0.5;
      }
    });
    if (target) return target;

    const storageTypes = [STRUCTURE_STORAGE];
    target = findStorableStructByRange(position, storageTypes);
    if (target) return target;

    return null;
  }
}

function workerFactory(creep: Creep): TwoStateWorker | null {
  switch (creep.memory.role) {
    case "transferer":
      return new Transferor(creep);
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
