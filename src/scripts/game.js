import { loadJSON } from "./heroes.js";
import { BattleSystem } from "./battle.js";
import { OfflineProgress } from "./offline.js";
import { UI } from "./ui.js";

export class Game {
  constructor() {
    this.config = null;
    this.heroesData = [];
    this.abilitiesData = [];
    this.enemiesData = [];
    this.stagesData = [];

    this.player = {
      gold: 0,
      gems: 0,
      ownedHeroes: [],
      heroLevels: {},
      currentStageIndex: 0,
    };

    this.battle = null;
    this.ui = null;
    this.offline = null;
    this.tickTimer = null;
  }

  async init() {
    await this.loadData();
    this.ui = new UI(this);
    this.battle = new BattleSystem(this);
    this.offline = new OfflineProgress(this);

    this.giveStarterHeroes();
    this.ui.renderAll();
    this.startGameLoop();
  }

  async loadData() {
    const [config, heroes, abilities, enemies, stages] = await Promise.all([
      loadJSON("src/data/config.json"),
      loadJSON("src/data/heroes.json"),
      loadJSON("src/data/abilities.json"),
      loadJSON("src/data/enemies.json"),
      loadJSON("src/data/stages.json"),
    ]);
    this.config = config;
    this.heroesData = heroes;
    this.abilitiesData = abilities;
    this.enemiesData = enemies;
    this.stagesData = stages;
  }

  giveStarterHeroes() {
    const starterIds = ["knight", "mage", "cleric"];
    for (const id of starterIds) {
      if (!this.player.ownedHeroes.includes(id)) {
        this.player.ownedHeroes.push(id);
        this.player.heroLevels[id] = 1;
      }
    }
  }

  startGameLoop() {
    this.tickTimer = setInterval(() => this.tick(), this.config.tickMs);
  }

  tick() {
    if (this.battle.active) {
      this.battle.tick();
    } else {
      this.tryStartBattle();
    }
    this.ui.updateResources();
  }

  tryStartBattle() {
    const stage = this.stagesData[this.player.currentStageIndex];
    if (!stage) return;
    this.battle.start(stage);
  }

  gainRewards(kills) {
    const goldGain = kills * this.config.goldPerStage;
    this.player.gold += goldGain;

    if (Math.random() < this.config.gemDropChance) {
      this.player.gems += 1;
    }

    this.save();
  }

  nextStage() {
    if (this.player.currentStageIndex < this.stagesData.length - 1) {
      this.player.currentStageIndex++;
      this.save();
      this.ui.renderStage();
    }
  }

  upgradeHero(heroId) {
    const level = this.player.heroLevels[heroId] || 1;
    const cost = level * 10;
    if (this.player.gold >= cost) {
      this.player.gold -= cost;
      this.player.heroLevels[heroId] = level + 1;
      this.save();
      this.ui.renderHeroes();
      this.ui.updateResources();
    }
  }

  save() {
    const data = {
      player: this.player,
      lastSave: Date.now(),
    };
    localStorage.setItem("afkLpcHeroSave", JSON.stringify(data));
  }

  load() {
    const raw = localStorage.getItem("afkLpcHeroSave");
    if (!raw) return null;
    return JSON.parse(raw);
  }
}
