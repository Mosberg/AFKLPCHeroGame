export async function loadJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url}`);
  return res.json();
}

export function getHeroStats(heroData, level) {
  const scale = 1 + (level - 1) * 0.15;
  return {
    hp: Math.floor(heroData.baseHp * scale),
    atk: Math.floor(heroData.baseAtk * scale),
    def: Math.floor(heroData.baseDef * scale),
    speed: heroData.speed,
  };
}
