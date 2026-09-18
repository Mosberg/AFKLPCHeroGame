export class UI {
  constructor(game) {
    this.game = game;
    this.el = {
      gold: document.getElementById("gold"),
      gems: document.getElementById("gems"),
      partyView: document.getElementById("partyView"),
      enemiesView: document.getElementById("enemiesView"),
      heroesList: document.getElementById("heroesList"),
      battleLog: document.getElementById("battleLog"),
      btnNextStage: document.getElementById("btnNextStage"),
      btnAutoBattle: document.getElementById("btnAutoBattle"),
    };

    this.el.btnNextStage.addEventListener("click", () => this.game.nextStage());
    this.el.btnAutoBattle.addEventListener("click", () => {
      this.addLog("Auto-battle is always on in this version.", "");
    });
  }

  renderAll() {
    this.updateResources();
    this.renderStage();
    this.renderHeroes();
  }

  updateResources() {
    this.el.gold.textContent = this.game.player.gold;
    this.el.gems.textContent = this.game.player.gems;
  }

  renderStage() {
    const stage = this.game.stagesData[this.game.player.currentStageIndex];
    this.addLog(`Current stage: ${stage.name}`, "");
  }

  renderBattle(party, enemies) {
    this.el.partyView.innerHTML = "";
    this.el.enemiesView.innerHTML = "";

    for (const h of party) {
      const div = document.createElement("div");
      div.className = "hero-sprite";
      div.textContent = `${h.name}\n${h.hp}/${h.maxHp}`;
      if (h.hp <= 0) div.style.opacity = 0.4;
      this.el.partyView.appendChild(div);
    }

    for (const e of enemies) {
      const div = document.createElement("div");
      div.className = "enemy-sprite";
      div.textContent = `${e.name}\n${e.hp}/${e.maxHp}`;
      if (e.hp <= 0) div.style.opacity = 0.3;
      this.el.enemiesView.appendChild(div);
    }
  }

  renderHeroes() {
    const list = this.el.heroesList;
    list.innerHTML = "";

    for (const id of this.game.player.ownedHeroes) {
      const data = this.game.heroesData.find((h) => h.id === id);
      const level = this.game.player.heroLevels[id] || 1;
      const cost = level * 10;

      const card = document.createElement("div");
      card.className = "hero-card";

      card.innerHTML = `
        <div class="hero-card__name">${data.name} (Lv ${level})</div>
        <div class="hero-card__stats">ATK ${data.baseAtk} • HP ${data.baseHp}</div>
        <div class="hero-card__actions">
          <button class="btn btn-upgrade" data-id="${id}" data-cost="${cost}">Upgrade (${cost}g)</button>
        </div>
      `;

      list.appendChild(card);
    }

    list.querySelectorAll(".btn-upgrade").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.game.upgradeHero(btn.dataset.id);
      });
    });
  }

  addLog(msg, type = "") {
    const div = document.createElement("div");
    div.className = `log-entry log-entry--${type}`;
    div.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
    this.el.battleLog.appendChild(div);
    this.el.battleLog.scrollTop = this.el.battleLog.scrollHeight;
  }
}
