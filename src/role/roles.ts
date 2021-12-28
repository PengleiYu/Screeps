import { moveToIfNotInRange } from "../utils/util";

abstract class TwoStateWorker {
  protected readonly creep: Creep;

  protected constructor(creep: Creep) {
    this.creep = creep;
  }

  public run() {
    this.switchWorkState();

    if (this.isInWorking()) {
      this.work();
    } else {
      this.prepare();
    }
  }

  protected switchWorkState(): void {
    if (this.isInWorking() && this.isWorkResourceEmpty()) {
      this.changeWorkState(false);
      this.creep.say("停止工作去搜集资源");
    } else if (!this.isInWorking() && this.isWorkResourceFull()) {
      this.changeWorkState(true);
      this.creep.say(`资源已满去工作:${this.getWorkType()}`);
    }
  }

  protected abstract work(): void;

  protected abstract prepare(): void;

  protected abstract isWorkResourceFull(): boolean;

  protected abstract isWorkResourceEmpty(): boolean;

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


  protected getWorkType(): string {
    return this.creep.memory.role;
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

  protected prepare(): void {
    this.harvest();
  }

  protected isWorkResourceFull(): boolean {
    return this.creep.store.getFreeCapacity(RESOURCE_ENERGY) === 0;
  }

  protected isWorkResourceEmpty(): boolean {
    return this.creep.store.energy === 0;
  }
}

export {
  Upgrader
};
