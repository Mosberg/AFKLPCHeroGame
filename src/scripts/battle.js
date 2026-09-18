import { getHeroStats } from "./heroes.js";

export class BattleSystem {
  constructor(game) {
    this.game = game;
    this.active = false;
    this.party = [];
    this.enemies = [];
    this.turnTimer = 0;
    this.cooldowns = {};
  }

  start(stage) {
    this.active = true;
    this.party = this.buildParty();
    this.enemies = this.buildEnemies(stage);
    this.turnTimer = 0;
    this.cooldowns = {};
    this.game.ui.renderBattle(this.party, this.enemies);
    this.log(`Battle started: ${stage.name}`);
  }

  buildParty() {
    const party = [];
    for (const id of this.game.player.ownedHeroes.slice(0, 3)) {
      const data = this.game.heroesData.find((h) => h.id === id);
      const level = this.game.player.heroLevels[id] || 1;
      const stats = getHeroStats(data, level);
      party.push({
        id: data.id,
        name: data.name,
        sprite: data.sprite,
        hp: stats.hp,
        maxHp: stats.hp,
        atk: stats.atk,
        def: stats.def,
        speed: stats.speed,
        abilities: data.abilities,
      });
    }
    return party;
  }

  buildEnemies(stage) {
    const enemies = [];
    const pool = stage.enemyPool;
    for (let i = 0; i < stage.enemyCount; i++) {
      const eid = pool[Math.floor(Math.random() * pool.length)];
      const data = this.game.enemiesData.find((e) => e.id === eid);
      enemies.push({
        id: data.id,
        name: data.name,
        sprite: data.sprite,
        hp: data.hp,
        maxHp: data.hp,
        atk: data.atk,
        def: data.def,
        speed: data.speed,
      });
    }
    return enemies;
  }

  tick() {
    this.turnTimer++;
    if (this.turnTimer % 1 !== 0) return; // reserve for future speed tuning

    const allUnits = [...this.party, ...this.enemies].sort(
      (a, b) => b.speed - a.speed,
    );
    for (const unit of allUnits) {
      if (unit.hp <= 0) continue;
      if (this.party.includes(unit)) {
        this.heroAction(unit);
      } else {
        this.enemyAction(unit);
      }
      if (this.checkEnd()) return;
    }
  }

  heroAction(hero) {
    const targets = this.enemies.filter((e) => e.hp > 0);
    if (targets.length === 0) return;
    const target = targets[0];

    const dmg = Math.max(1, hero.atk - target.def);
    target.hp -= dmg;
    this.log(`${hero.name} hits ${target.name} for ${dmg}.`);

    if (target.hp <= 0) {
      this.log(`${target.name} was defeated!`, "kill");
      this.game.gainRewards(1);
    }

    this.game.ui.renderBattle(this.party, this.enemies);
  }

  enemyAction(enemy) {
    const targets = this.party.filter((h) => h.hp > 0);
    if (targets.length === 0) return;
    const target = targets[0];

    const dmg = Math.max(0, enemy.atk - target.def);
    target.hp -= dmg;
    if (dmg > 0) {
      this.log(`${enemy.name} hits ${target.name} for ${dmg}.`, "damage");
    }

    if (target.hp <= 0) {
      this.log(`${target.name} fell in battle.`, "damage");
    }

    this.game.ui.renderBattle(this.party, this.enemies);
  }

  checkEnd() {
    const partyAlive = this.party.some((h) => h.hp > 0);
    const enemiesAlive = this.enemies.some((e) => e.hp > 0);

    if (!enemiesAlive) {
      this.active = false;
      this.log("Victory! Stage cleared.", "kill");
      return true;
    }
    if (!partyAlive) {
      this.active = false;
      this.log("Defeat... Try upgrading heroes.", "damage");
      return true;
    }
    return false;
  }

  log(msg, type = "") {
    this.game.ui.addLog(msg, type);
  }
}
