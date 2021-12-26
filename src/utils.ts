function isCreepExist(creepName: string) {
  return creepName in Game.creeps;
}

function createCreep(creepName: string) {
  if (isCreepExist(creepName)) return;

  console.log(`${creepName} 不存在，需要创建`);
  const result = getDefaultSpawn().spawnCreep([WORK, CARRY, MOVE], creepName);
  console.log(`result=${result}`);
}

function getDefaultSpawn() {
  const nameDefaultSpawn = "Spawn1";
  return Game.spawns[nameDefaultSpawn];
}

export {
  isCreepExist,
  createCreep,
  getDefaultSpawn
};
