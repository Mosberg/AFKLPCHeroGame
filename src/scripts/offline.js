export class OfflineProgress {
  constructor(game) {
    this.game = game;
    this.applyOffline();
  }

  applyOffline() {
    const save = this.game.load();
    if (!save || !save.lastSave) return;

    const now = Date.now();
    const diffHours = (now - save.lastSave) / (1000 * 60 * 60);
    const maxHours = this.game.config.offlineMaxHours;
    const hours = Math.min(diffHours, maxHours);

    if (hours <= 0) return;

    const goldPerHour = 60 * this.game.config.goldPerStage;
    const goldGain = Math.floor(hours * goldPerHour);
    this.game.player.gold += goldGain;

    this.game.ui.addLog(
      `You were away for ${hours.toFixed(1)}h. Gained ${goldGain} gold.`,
      "heal",
    );
  }
}
