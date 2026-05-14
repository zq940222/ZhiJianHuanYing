const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const ui = {
  waveLabel: document.getElementById("waveLabel"),
  hpLabel: document.getElementById("hpLabel"),
  xpLabel: document.getElementById("xpLabel"),
  scrapLabel: document.getElementById("scrapLabel"),
  alloyLabel: document.getElementById("alloyLabel"),
  synergyLabel: document.getElementById("synergyLabel"),
  timerLabel: document.getElementById("timerLabel"),
  killLabel: document.getElementById("killLabel"),
  bestWaveLabel: document.getElementById("bestWaveLabel"),
  inventoryGrid: document.getElementById("inventoryGrid"),
  loadoutGrid: document.getElementById("loadoutGrid"),
  weaponBook: document.getElementById("weaponBook"),
  researchGrid: document.getElementById("researchGrid"),
  selectionHint: document.getElementById("selectionHint"),
  supplyButton: document.getElementById("supplyButton"),
  supplyHint: document.getElementById("supplyHint"),
  pauseButton: document.getElementById("pauseButton"),
  joystickBase: document.getElementById("joystickBase"),
  joystickThumb: document.getElementById("joystickThumb"),
  upgradeOverlay: document.getElementById("upgradeOverlay"),
  upgradeOptions: document.getElementById("upgradeOptions"),
  gameOverOverlay: document.getElementById("gameOverOverlay"),
  gameOverTitle: document.getElementById("gameOverTitle"),
  gameOverSummary: document.getElementById("gameOverSummary"),
  startOverlay: document.getElementById("startOverlay"),
  startButton: document.getElementById("startButton"),
  startPracticeButton: document.getElementById("startPracticeButton"),
  pauseOverlay: document.getElementById("pauseOverlay"),
  resumeButton: document.getElementById("resumeButton"),
  pauseRestartButton: document.getElementById("pauseRestartButton"),
  toggleGuidesButton: document.getElementById("toggleGuidesButton"),
  toggleEffectsButton: document.getElementById("toggleEffectsButton"),
  guidesStatus: document.getElementById("guidesStatus"),
  effectsStatus: document.getElementById("effectsStatus"),
  restartButton: document.getElementById("restartButton"),
  overlayRestartButton: document.getElementById("overlayRestartButton"),
  sortButton: document.getElementById("sortButton"),
};

const STORAGE_BEST_WAVE = "phantom-survival-best-wave";
const STORAGE_PROFILE = "phantom-survival-profile-v2";
const INVENTORY_SIZE = 12;
const LOADOUT_SIZE = 4;
const WAVE_DURATION = 25;
const SUPPLY_COST = 30;

const weaponDefs = {
  rifle: {
    id: "rifle",
    name: "冲锋枪",
    family: "物理",
    rarity: "common",
    description: "高频点射，优先清理近身杂兵。",
    color: "#8af7d7",
    baseDamage: 10,
    fireRate: 0.34,
    projectileSpeed: 540,
    range: 420,
    projectileSize: 4,
    pierce: 0,
    behavior: "bullet",
  },
  frostBlade: {
    id: "frostBlade",
    name: "寒霜剑",
    family: "冰霜",
    rarity: "rare",
    description: "短距离扇形剑气，附带减速。",
    color: "#9ad5ff",
    baseDamage: 22,
    fireRate: 0.72,
    projectileSpeed: 400,
    range: 180,
    projectileSize: 18,
    pierce: 2,
    slow: 0.42,
    behavior: "arc",
  },
  tesla: {
    id: "tesla",
    name: "线圈塔",
    family: "雷电",
    rarity: "rare",
    description: "电弧自动链接多个目标，偏向控场。",
    color: "#c8b1ff",
    baseDamage: 15,
    fireRate: 0.58,
    projectileSpeed: 0,
    range: 240,
    projectileSize: 0,
    pierce: 2,
    behavior: "chain",
  },
  rocket: {
    id: "rocket",
    name: "火箭筒",
    family: "爆裂",
    rarity: "epic",
    description: "低频高伤，爆炸范围清场。",
    color: "#ff9a7b",
    baseDamage: 34,
    fireRate: 0.95,
    projectileSpeed: 300,
    range: 460,
    projectileSize: 7,
    splash: 72,
    pierce: 0,
    behavior: "rocket",
  },
};

const weaponPool = Object.keys(weaponDefs);

const enemyDefs = {
  walker: {
    id: "walker",
    name: "感染体",
    color: "#ff6c7d",
    radius: 14,
    hp: 34,
    speed: 52,
    touchDamage: 9,
    rewardXp: 1,
  },
  runner: {
    id: "runner",
    name: "猎犬体",
    color: "#ffa96c",
    radius: 11,
    hp: 24,
    speed: 94,
    touchDamage: 7,
    rewardXp: 1,
  },
  brute: {
    id: "brute",
    name: "重装体",
    color: "#d067ff",
    radius: 18,
    hp: 92,
    speed: 36,
    touchDamage: 14,
    rewardXp: 2,
  },
  boss: {
    id: "boss",
    name: "畸变领主",
    color: "#ffe26a",
    radius: 28,
    hp: 420,
    speed: 42,
    touchDamage: 18,
    rewardXp: 8,
    alloyReward: 25,
    scrapReward: 30,
  },
};

const researchDefs = [
  {
    id: "damage",
    title: "武器校准",
    desc: "开局全武器伤害 +8%",
    cost(level) {
      return 20 + level * 18;
    },
  },
  {
    id: "vitality",
    title: "生命装甲",
    desc: "开局最大生命 +10",
    cost(level) {
      return 16 + level * 16;
    },
  },
  {
    id: "speed",
    title: "机动强化",
    desc: "开局移动速度 +6%",
    cost(level) {
      return 14 + level * 14;
    },
  },
  {
    id: "scavenge",
    title: "回收协议",
    desc: "开局吸附范围 +10，局内废铁收益提升",
    cost(level) {
      return 12 + level * 12;
    },
  },
];

const upgradePool = [
  {
    id: "damage",
    title: "火力过载",
    desc: "全武器伤害 +18%",
    apply(run) {
      run.meta.baseDamageMul *= 1.18;
    },
  },
  {
    id: "attackSpeed",
    title: "热切供弹",
    desc: "全武器攻速 +15%",
    apply(run) {
      run.meta.baseAttackSpeedMul *= 1.15;
    },
  },
  {
    id: "recovery",
    title: "战地急救",
    desc: "立即回复 35 点生命",
    apply(run) {
      run.player.hp = Math.min(run.player.maxHp, run.player.hp + 35);
    },
  },
  {
    id: "vitality",
    title: "韧性骨架",
    desc: "最大生命 +20，并回满当前生命",
    apply(run) {
      run.player.maxHp += 20;
      run.player.hp = run.player.maxHp;
    },
  },
  {
    id: "magnet",
    title: "磁吸核心",
    desc: "经验吸附范围显著提升",
    apply(run) {
      run.meta.basePickupRadius += 40;
    },
  },
  {
    id: "speed",
    title: "短距冲刺",
    desc: "移动速度 +14%",
    apply(run) {
      run.player.baseSpeed *= 1.14;
    },
  },
];

const defaultProfile = {
  alloy: 60,
  research: {
    damage: 0,
    vitality: 0,
    speed: 0,
    scavenge: 0,
  },
  armory: {
    rifle: 1,
    frostBlade: 1,
    tesla: 1,
    rocket: 0,
  },
};

function loadProfile() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_PROFILE) || "null");
    if (!raw) {
      return structuredClone(defaultProfile);
    }
    return {
      alloy: Number(raw.alloy || 0),
      research: {
        damage: Number(raw.research?.damage || 0),
        vitality: Number(raw.research?.vitality || 0),
        speed: Number(raw.research?.speed || 0),
        scavenge: Number(raw.research?.scavenge || 0),
      },
      armory: Object.fromEntries(
        weaponPool.map((weaponId) => [weaponId, Number(raw.armory?.[weaponId] || 0)])
      ),
    };
  } catch {
    return structuredClone(defaultProfile);
  }
}

function saveProfile() {
  localStorage.setItem(STORAGE_PROFILE, JSON.stringify(state.profile));
}

const state = {
  keys: {},
  sessionStarted: false,
  paused: false,
  pendingUpgrade: false,
  selectedSlot: null,
  pointerMove: null,
  joystick: {
    active: false,
    pointerId: null,
    x: 0,
    y: 0,
  },
  settings: {
    showGuides: true,
    showEffects: true,
  },
  lastTime: 0,
  bestWave: Number(localStorage.getItem(STORAGE_BEST_WAVE) || 1),
  profile: loadProfile(),
  run: null,
};

function createCard(weaponId, level = 1) {
  return { weaponId, level };
}

function cloneCard(card) {
  return card ? { weaponId: card.weaponId, level: card.level } : null;
}

function buildStarterCards() {
  const cards = [];
  weaponPool.forEach((weaponId) => {
    const level = state.profile.armory[weaponId] || 0;
    if (level > 0) {
      cards.push(createCard(weaponId, level));
    }
  });

  if (state.profile.armory.rifle > 0) {
    cards.unshift(createCard("rifle", Math.max(1, state.profile.armory.rifle - 1)));
  }

  while (cards.length < INVENTORY_SIZE) {
    cards.push(null);
  }

  return cards.slice(0, INVENTORY_SIZE);
}

function createInitialRun() {
  const starterCards = buildStarterCards();
  const vitalityBonus = state.profile.research.vitality * 10;
  const speedBonus = 1 + state.profile.research.speed * 0.06;
  const damageBonus = 1 + state.profile.research.damage * 0.08;
  const pickupBonus = state.profile.research.scavenge * 10;

  const loadout = starterCards.filter(Boolean).slice(0, LOADOUT_SIZE).map(cloneCard);
  while (loadout.length < LOADOUT_SIZE) {
    loadout.push(null);
  }

  const run = {
    meta: {
      baseDamageMul: damageBonus,
      baseAttackSpeedMul: 1,
      basePickupRadius: 48 + pickupBonus,
      synergyDamageMul: 1,
      synergyAttackSpeedMul: 1,
      synergyPickupRadius: 0,
      extraSlow: 0,
      scrapGainMul: 1 + state.profile.research.scavenge * 0.08,
      kills: 0,
      scrap: 20 + state.profile.research.scavenge * 4,
      alloyEarned: 0,
      bossKills: 0,
      synergyName: "无",
    },
    player: {
      x: canvas.width / 2,
      y: canvas.height / 2,
      radius: 16,
      hp: 100 + vitalityBonus,
      maxHp: 100 + vitalityBonus,
      baseSpeed: 250 * speedBonus,
      invuln: 0,
    },
    progression: {
      wave: 1,
      waveTimer: WAVE_DURATION,
      xp: 0,
      xpToNext: 6,
      bossSpawned: false,
    },
    inventory: starterCards.map(cloneCard),
    loadout,
    enemies: [],
    projectiles: [],
    xpDrops: [],
    bursts: [],
    weaponTimers: [0, 0, 0, 0],
    enemySpawnTimer: 0,
    active: true,
  };

  applyLoadoutSynergy(run);
  return run;
}

function getDamageMultiplier(run) {
  return run.meta.baseDamageMul * run.meta.synergyDamageMul;
}

function getAttackSpeedMultiplier(run) {
  return run.meta.baseAttackSpeedMul * run.meta.synergyAttackSpeedMul;
}

function getPickupRadius(run) {
  return run.meta.basePickupRadius + run.meta.synergyPickupRadius;
}

function getPlayerSpeed(run) {
  return run.player.baseSpeed;
}

function applyLoadoutSynergy(run) {
  const counts = {};
  run.loadout.filter(Boolean).forEach((card) => {
    const family = weaponDefs[card.weaponId].family;
    counts[family] = (counts[family] || 0) + 1;
  });

  run.meta.synergyDamageMul = 1;
  run.meta.synergyAttackSpeedMul = 1;
  run.meta.synergyPickupRadius = 0;
  run.meta.extraSlow = 0;
  run.meta.synergyName = "无";

  const match = Object.entries(counts).find(([, count]) => count >= 2);
  if (match) {
    const [family] = match;
    if (family === "物理") {
      run.meta.synergyDamageMul = 1.12;
      run.meta.synergyAttackSpeedMul = 1.08;
      run.meta.synergyName = "物理压制";
    } else if (family === "冰霜") {
      run.meta.synergyDamageMul = 1.1;
      run.meta.synergyPickupRadius = 26;
      run.meta.extraSlow = 0.12;
      run.meta.synergyName = "霜冻渗透";
    } else if (family === "雷电") {
      run.meta.synergyAttackSpeedMul = 1.14;
      run.meta.synergyName = "电弧串流";
    } else if (family === "爆裂") {
      run.meta.synergyDamageMul = 1.15;
      run.meta.synergyName = "爆裂增压";
    }
  } else if (Object.keys(counts).length >= 4) {
    run.meta.synergyDamageMul = 1.08;
    run.meta.synergyAttackSpeedMul = 1.08;
    run.meta.synergyName = "全域编成";
  }

  ui.synergyLabel.textContent = run.meta.synergyName;
}

function resetRun() {
  state.run = createInitialRun();
  state.pendingUpgrade = false;
  state.paused = false;
  state.selectedSlot = null;
  state.pointerMove = null;
  resetJoystick();
  state.lastTime = 0;
  ui.upgradeOverlay.classList.add("hidden");
  ui.gameOverOverlay.classList.add("hidden");
  ui.pauseOverlay.classList.add("hidden");
  ui.selectionHint.textContent = "点击卡牌，再点击目标格进行移动 / 合成";
  renderInventory();
  renderWeaponBook();
  renderResearch();
  refreshSettingsUI();
  updateHud();
}

function startSession(reset = false) {
  if (reset || !state.run) {
    resetRun();
  }
  state.sessionStarted = true;
  state.paused = false;
  ui.startOverlay.classList.add("hidden");
  ui.pauseOverlay.classList.add("hidden");
}

function setPaused(nextPaused) {
  if (!state.sessionStarted || !state.run.active || state.pendingUpgrade) {
    return;
  }
  state.paused = nextPaused;
  ui.pauseOverlay.classList.toggle("hidden", !nextPaused);
}

function togglePause() {
  setPaused(!state.paused);
}

function refreshSettingsUI() {
  ui.guidesStatus.textContent = state.settings.showGuides ? "开启" : "关闭";
  ui.effectsStatus.textContent = state.settings.showEffects ? "完整" : "简化";
}

function resetJoystick() {
  state.joystick.active = false;
  state.joystick.pointerId = null;
  state.joystick.x = 0;
  state.joystick.y = 0;
  if (ui.joystickThumb) {
    ui.joystickThumb.style.transform = "translate(0px, 0px)";
  }
}

function updateJoystickFromEvent(event) {
  const rect = ui.joystickBase.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const dx = event.clientX - centerX;
  const dy = event.clientY - centerY;
  const maxRadius = rect.width * 0.28;
  const length = Math.hypot(dx, dy) || 1;
  const clamped = Math.min(length, maxRadius);
  const normX = (dx / length) * clamped;
  const normY = (dy / length) * clamped;

  state.joystick.active = true;
  state.joystick.pointerId = event.pointerId;
  state.joystick.x = normX / maxRadius;
  state.joystick.y = normY / maxRadius;
  ui.joystickThumb.style.transform = `translate(${normX}px, ${normY}px)`;
}

function rarityClass(card) {
  if (!card) {
    return "empty";
  }
  return `rarity-${weaponDefs[card.weaponId].rarity}`;
}

function getSlotReference(slotKey, index) {
  return slotKey === "inventory" ? state.run.inventory[index] : state.run.loadout[index];
}

function setSlotReference(slotKey, index, value) {
  if (slotKey === "inventory") {
    state.run.inventory[index] = value;
  } else {
    state.run.loadout[index] = value;
  }
}

function isSameCard(a, b) {
  return Boolean(a && b && a.weaponId === b.weaponId && a.level === b.level);
}

function renderSlot(slotKey, index, card) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `slot ${card ? rarityClass(card) : "empty"}`;

  const selected = state.selectedSlot && state.selectedSlot.slotKey === slotKey && state.selectedSlot.index === index;
  if (selected) {
    button.classList.add("selected");
  }

  if (state.selectedSlot) {
    const picked = getSlotReference(state.selectedSlot.slotKey, state.selectedSlot.index);
    if (!selected && isSameCard(picked, card)) {
      button.classList.add("can-merge");
    }
  }

  button.addEventListener("click", () => onSlotClick(slotKey, index));

  const label = document.createElement("span");
  label.className = "slot-label";
  label.textContent = slotKey === "inventory" ? `背包 ${index + 1}` : `上阵 ${index + 1}`;
  button.appendChild(label);

  if (card) {
    const def = weaponDefs[card.weaponId];
    const name = document.createElement("div");
    name.className = "slot-name";
    name.textContent = def.name;
    button.appendChild(name);

    const tags = document.createElement("div");
    tags.className = "slot-tags";
    tags.innerHTML = `<span>Lv.${card.level}</span><span>${def.family}</span>`;
    button.appendChild(tags);
  } else {
    const hint = document.createElement("div");
    hint.className = "slot-name";
    hint.textContent = "空位";
    hint.style.color = "var(--muted)";
    button.appendChild(hint);
  }

  return button;
}

function renderInventory() {
  ui.inventoryGrid.innerHTML = "";
  ui.loadoutGrid.innerHTML = "";

  state.run.inventory.forEach((card, index) => {
    ui.inventoryGrid.appendChild(renderSlot("inventory", index, card));
  });

  state.run.loadout.forEach((card, index) => {
    ui.loadoutGrid.appendChild(renderSlot("loadout", index, card));
  });
}

function renderWeaponBook() {
  ui.weaponBook.innerHTML = "";
  Object.values(weaponDefs).forEach((def) => {
    const level = state.profile.armory[def.id] || 0;
    const item = document.createElement("article");
    item.className = "weapon-entry";
    item.innerHTML = `
      <span class="weapon-meta">${def.family} / ${def.rarity.toUpperCase()}</span>
      <h3>${def.name} ${level > 0 ? `· 常驻 Lv.${level}` : "· 未解锁"}</h3>
      <p class="weapon-desc">${def.description}</p>
    `;
    ui.weaponBook.appendChild(item);
  });
}

function renderResearch() {
  ui.researchGrid.innerHTML = "";
  researchDefs.forEach((research) => {
    const level = state.profile.research[research.id];
    const cost = research.cost(level);
    const item = document.createElement("article");
    item.className = "research-entry";
    item.innerHTML = `
      <h3>${research.title} Lv.${level}</h3>
      <p class="weapon-desc">${research.desc}</p>
      <div class="research-row">
        <span>升级消耗 ${cost} 晶核</span>
      </div>
    `;
    const button = document.createElement("button");
    button.className = "small-button";
    button.type = "button";
    button.textContent = "研究";
    button.disabled = state.profile.alloy < cost;
    button.addEventListener("click", () => buyResearch(research.id));
    item.querySelector(".research-row").appendChild(button);
    ui.researchGrid.appendChild(item);
  });
}

function buyResearch(researchId) {
  const research = researchDefs.find((item) => item.id === researchId);
  const level = state.profile.research[researchId];
  const cost = research.cost(level);
  if (state.profile.alloy < cost) {
    return;
  }
  state.profile.alloy -= cost;
  state.profile.research[researchId] += 1;
  saveProfile();
  renderResearch();
  updateHud();
  ui.supplyHint.textContent = `研究完成：${research.title} 升至 Lv.${state.profile.research[researchId]}。`;
}

function onSlotClick(slotKey, index) {
  const clicked = getSlotReference(slotKey, index);

  if (!state.selectedSlot) {
    if (!clicked) {
      return;
    }
    state.selectedSlot = { slotKey, index };
    ui.selectionHint.textContent = "已选中一张武器卡，点击另一个格子进行交换或合成。";
    renderInventory();
    return;
  }

  const source = state.selectedSlot;
  const sourceCard = getSlotReference(source.slotKey, source.index);
  if (!sourceCard) {
    state.selectedSlot = null;
    renderInventory();
    return;
  }

  if (source.slotKey === slotKey && source.index === index) {
    state.selectedSlot = null;
    ui.selectionHint.textContent = "点击卡牌，再点击目标格进行移动 / 合成";
    renderInventory();
    return;
  }

  const targetCard = getSlotReference(slotKey, index);
  if (isSameCard(sourceCard, targetCard) && sourceCard.level < 5) {
    setSlotReference(slotKey, index, createCard(sourceCard.weaponId, sourceCard.level + 1));
    setSlotReference(source.slotKey, source.index, null);
    ui.selectionHint.textContent = "合成成功，武器卡已提升 1 级。";
  } else {
    setSlotReference(source.slotKey, source.index, cloneCard(targetCard));
    setSlotReference(slotKey, index, cloneCard(sourceCard));
    ui.selectionHint.textContent = targetCard ? "已交换武器位置。" : "已移动武器卡。";
  }

  state.selectedSlot = null;
  applyLoadoutSynergy(state.run);
  renderInventory();
  updateHud();
}

function sortInventory() {
  const cards = state.run.inventory.filter(Boolean);
  cards.sort((a, b) => {
    if (a.weaponId === b.weaponId) {
      return b.level - a.level;
    }
    return a.weaponId.localeCompare(b.weaponId);
  });
  while (cards.length < INVENTORY_SIZE) {
    cards.push(null);
  }
  state.run.inventory = cards;
  state.selectedSlot = null;
  renderInventory();
}

function addCardToInventory(card) {
  const index = state.run.inventory.findIndex((item) => item === null);
  if (index === -1) {
    state.run.meta.scrap += Math.ceil((10 + card.level * 5) * state.run.meta.scrapGainMul);
    return false;
  }
  state.run.inventory[index] = card;
  renderInventory();
  return true;
}

function grantWaveReward() {
  const pick = weaponPool[Math.floor(Math.random() * weaponPool.length)];
  const unlockedLevel = state.profile.armory[pick] || 0;
  const level = Math.max(1, Math.min(5, unlockedLevel || 1, Math.random() < 0.16 ? 2 : 1));
  addCardToInventory(createCard(pick, level));
  state.run.meta.scrap += Math.ceil((8 + state.run.progression.wave * 2) * state.run.meta.scrapGainMul);
}

function chooseUpgrades() {
  state.pendingUpgrade = true;
  state.run.enemies = [];
  state.run.projectiles = [];
  state.run.xpDrops = [];
  ui.upgradeOptions.innerHTML = "";

  const options = [...upgradePool].sort(() => Math.random() - 0.5).slice(0, 3);
  options.forEach((upgrade) => {
    const button = document.createElement("button");
    button.className = "upgrade-button";
    button.type = "button";
    button.innerHTML = `<strong>${upgrade.title}</strong><span>${upgrade.desc}</span>`;
    button.addEventListener("click", () => {
      upgrade.apply(state.run);
      grantWaveReward();
      state.pendingUpgrade = false;
      state.run.progression.wave += 1;
      state.run.progression.waveTimer = WAVE_DURATION;
      state.run.progression.bossSpawned = false;
      state.run.enemySpawnTimer = 0;
      ui.upgradeOverlay.classList.add("hidden");
      updateHud();
      renderInventory();
    });
    ui.upgradeOptions.appendChild(button);
  });

  ui.upgradeOverlay.classList.remove("hidden");
}

function getEquippedCards() {
  return state.run.loadout.filter(Boolean);
}

function getLevelMultiplier(level) {
  return 1 + (level - 1) * 0.65;
}

function getClosestEnemy(maxRange = Infinity) {
  let closest = null;
  let bestDist = maxRange;
  for (const enemy of state.run.enemies) {
    const dx = enemy.x - state.run.player.x;
    const dy = enemy.y - state.run.player.y;
    const dist = Math.hypot(dx, dy);
    if (dist < bestDist) {
      bestDist = dist;
      closest = enemy;
    }
  }
  return closest;
}

function chooseEnemyType(wave) {
  const roll = Math.random();
  if (wave >= 7 && roll > 0.78) {
    return "brute";
  }
  if (wave >= 3 && roll > 0.52) {
    return "runner";
  }
  return "walker";
}

function spawnEnemy(typeId) {
  const def = enemyDefs[typeId];
  const side = Math.floor(Math.random() * 4);
  const margin = 50;
  let x = 0;
  let y = 0;

  if (side === 0) {
    x = -margin;
    y = Math.random() * canvas.height;
  } else if (side === 1) {
    x = canvas.width + margin;
    y = Math.random() * canvas.height;
  } else if (side === 2) {
    x = Math.random() * canvas.width;
    y = -margin;
  } else {
    x = Math.random() * canvas.width;
    y = canvas.height + margin;
  }

  const waveScale = 1 + (state.run.progression.wave - 1) * 0.15;
  const hpScale = typeId === "boss" ? 1 + (state.run.progression.wave - 5) * 0.18 : waveScale;
  state.run.enemies.push({
    typeId,
    x,
    y,
    radius: def.radius + (typeId === "boss" ? 0 : Math.random() * 3),
    speed: def.speed * (typeId === "boss" ? 1 : 0.92 + Math.random() * 0.2),
    hp: def.hp * hpScale,
    maxHp: def.hp * hpScale,
    touchDamage: def.touchDamage,
    rewardXp: def.rewardXp,
    alloyReward: def.alloyReward || 0,
    scrapReward: def.scrapReward || 0,
    color: def.color,
    slowTimer: 0,
    slowFactor: 1,
    damageCooldown: 0,
  });
}

function spawnProjectile(angle, weapon, card) {
  const levelMul = getLevelMultiplier(card.level);
  const baseDamage = weapon.baseDamage * levelMul * getDamageMultiplier(state.run);

  if (weapon.behavior === "chain") {
    const inRange = state.run.enemies
      .map((enemy) => ({
        enemy,
        dist: Math.hypot(enemy.x - state.run.player.x, enemy.y - state.run.player.y),
      }))
      .filter(({ dist }) => dist <= weapon.range + card.level * 20)
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 1 + weapon.pierce);

    inRange.forEach(({ enemy }, index) => {
      applyDamage(enemy, baseDamage * (index === 0 ? 1 : 0.65), weapon, card);
      state.run.bursts.push({
        type: "beam",
        fromX: index === 0 ? state.run.player.x : inRange[index - 1].enemy.x,
        fromY: index === 0 ? state.run.player.y : inRange[index - 1].enemy.y,
        toX: enemy.x,
        toY: enemy.y,
        ttl: 0.08,
        color: weapon.color,
      });
    });
    return;
  }

  if (weapon.behavior === "arc") {
    const slashRange = weapon.range + card.level * 12;
    state.run.bursts.push({
      type: "arc",
      x: state.run.player.x,
      y: state.run.player.y,
      angle,
      radius: slashRange,
      ttl: 0.16,
      color: weapon.color,
    });

    state.run.enemies.forEach((enemy) => {
      const dx = enemy.x - state.run.player.x;
      const dy = enemy.y - state.run.player.y;
      const dist = Math.hypot(dx, dy);
      if (dist > slashRange) {
        return;
      }
      const enemyAngle = Math.atan2(dy, dx);
      const diff = normalizeAngle(enemyAngle - angle);
      if (Math.abs(diff) <= 0.75) {
        applyDamage(enemy, baseDamage, weapon, card);
      }
    });
    return;
  }

  state.run.projectiles.push({
    x: state.run.player.x,
    y: state.run.player.y,
    vx: Math.cos(angle) * weapon.projectileSpeed,
    vy: Math.sin(angle) * weapon.projectileSpeed,
    radius: weapon.projectileSize,
    damage: baseDamage,
    ttl: weapon.range / Math.max(weapon.projectileSpeed || 1, 1),
    color: weapon.color,
    behavior: weapon.behavior,
    splash: weapon.splash || 0,
    pierce: weapon.pierce || 0,
    slow: weapon.slow || 0,
    card,
    weapon,
  });
}

function normalizeAngle(angle) {
  let result = angle;
  while (result > Math.PI) {
    result -= Math.PI * 2;
  }
  while (result < -Math.PI) {
    result += Math.PI * 2;
  }
  return result;
}

function applyDamage(enemy, amount, weapon, card) {
  enemy.hp -= amount;
  if (weapon.slow || state.run.meta.extraSlow) {
    enemy.slowFactor = 1 - Math.min((weapon.slow || 0) + state.run.meta.extraSlow + card.level * 0.03, 0.75);
    enemy.slowTimer = 1;
  }
}

function killEnemy(enemy) {
  state.run.meta.kills += 1;
  state.run.meta.scrap += Math.ceil((4 + enemy.rewardXp + enemy.scrapReward) * state.run.meta.scrapGainMul);
  state.run.meta.alloyEarned += enemy.alloyReward;
  if (enemy.typeId === "boss") {
    state.run.meta.bossKills += 1;
  }
  const dropCount = Math.max(1, enemy.rewardXp);
  for (let i = 0; i < dropCount; i += 1) {
    state.run.xpDrops.push({
      x: enemy.x + (Math.random() - 0.5) * 18,
      y: enemy.y + (Math.random() - 0.5) * 18,
      value: 1,
      radius: 6,
    });
  }
}

function fireWeapons(dt) {
  const equipped = getEquippedCards();
  equipped.forEach((card, index) => {
    const weapon = weaponDefs[card.weaponId];
    state.run.weaponTimers[index] -= dt;
    const cadence = weapon.fireRate / getAttackSpeedMultiplier(state.run) / (1 + (card.level - 1) * 0.08);
    if (state.run.weaponTimers[index] > 0) {
      return;
    }

    const target = getClosestEnemy(weapon.range + card.level * 18);
    if (!target) {
      return;
    }

    const angle = Math.atan2(target.y - state.run.player.y, target.x - state.run.player.x);
    spawnProjectile(angle, weapon, card);
    state.run.weaponTimers[index] = cadence;
  });
}

function updatePlayer(dt) {
  const player = state.run.player;
  let dx = 0;
  let dy = 0;

  if (state.joystick.active) {
    dx += state.joystick.x;
    dy += state.joystick.y;
  }

  if (state.pointerMove) {
    dx = state.pointerMove.x - player.x;
    dy = state.pointerMove.y - player.y;
  }
  if (state.keys.w || state.keys.ArrowUp) {
    dy -= 1;
  }
  if (state.keys.s || state.keys.ArrowDown) {
    dy += 1;
  }
  if (state.keys.a || state.keys.ArrowLeft) {
    dx -= 1;
  }
  if (state.keys.d || state.keys.ArrowRight) {
    dx += 1;
  }

  const length = Math.hypot(dx, dy);
  if (length > 4) {
    player.x += (dx / length) * getPlayerSpeed(state.run) * dt;
    player.y += (dy / length) * getPlayerSpeed(state.run) * dt;
  }

  player.x = Math.max(player.radius, Math.min(canvas.width - player.radius, player.x));
  player.y = Math.max(player.radius, Math.min(canvas.height - player.radius, player.y));
  player.invuln = Math.max(0, player.invuln - dt);
}

function updateEnemies(dt) {
  const player = state.run.player;
  for (let i = state.run.enemies.length - 1; i >= 0; i -= 1) {
    const enemy = state.run.enemies[i];
    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const dist = Math.hypot(dx, dy) || 1;

    enemy.slowTimer = Math.max(0, enemy.slowTimer - dt);
    if (enemy.slowTimer <= 0) {
      enemy.slowFactor = 1;
    }
    enemy.damageCooldown = Math.max(0, enemy.damageCooldown - dt);

    enemy.x += (dx / dist) * enemy.speed * enemy.slowFactor * dt;
    enemy.y += (dy / dist) * enemy.speed * enemy.slowFactor * dt;

    if (dist <= enemy.radius + player.radius + 4 && enemy.damageCooldown <= 0 && player.invuln <= 0) {
      player.hp -= enemy.touchDamage;
      player.invuln = 0.45;
      enemy.damageCooldown = 0.6;
      if (player.hp <= 0) {
        endRun(false);
        return;
      }
    }

    if (enemy.hp <= 0) {
      killEnemy(enemy);
      state.run.enemies.splice(i, 1);
    }
  }
}

function explodeProjectile(projectile) {
  if (!projectile.splash) {
    return;
  }
  state.run.bursts.push({
    type: "blast",
    x: projectile.x,
    y: projectile.y,
    radius: projectile.splash,
    ttl: 0.18,
    color: projectile.color,
  });

  state.run.enemies.forEach((enemy) => {
    const dist = Math.hypot(enemy.x - projectile.x, enemy.y - projectile.y);
    if (dist <= projectile.splash) {
      applyDamage(enemy, projectile.damage * (1 - (dist / projectile.splash) * 0.4), projectile.weapon, projectile.card);
    }
  });
}

function updateProjectiles(dt) {
  for (let i = state.run.projectiles.length - 1; i >= 0; i -= 1) {
    const projectile = state.run.projectiles[i];
    projectile.x += projectile.vx * dt;
    projectile.y += projectile.vy * dt;
    projectile.ttl -= dt;

    let remove = projectile.ttl <= 0;
    for (let j = state.run.enemies.length - 1; j >= 0; j -= 1) {
      const enemy = state.run.enemies[j];
      const dist = Math.hypot(enemy.x - projectile.x, enemy.y - projectile.y);
      if (dist <= enemy.radius + projectile.radius) {
        applyDamage(enemy, projectile.damage, projectile.weapon, projectile.card);
        if (projectile.behavior === "rocket") {
          explodeProjectile(projectile);
          remove = true;
          break;
        }
        if (projectile.pierce > 0) {
          projectile.pierce -= 1;
        } else {
          remove = true;
          break;
        }
      }
    }

    if (
      projectile.x < -40 ||
      projectile.x > canvas.width + 40 ||
      projectile.y < -40 ||
      projectile.y > canvas.height + 40
    ) {
      remove = true;
    }

    if (remove) {
      state.run.projectiles.splice(i, 1);
    }
  }
}

function updateDrops(dt) {
  const player = state.run.player;
  for (let i = state.run.xpDrops.length - 1; i >= 0; i -= 1) {
    const drop = state.run.xpDrops[i];
    const dx = player.x - drop.x;
    const dy = player.y - drop.y;
    const dist = Math.hypot(dx, dy) || 1;
    if (dist <= getPickupRadius(state.run)) {
      drop.x += (dx / dist) * 360 * dt;
      drop.y += (dy / dist) * 360 * dt;
    }
    if (dist <= player.radius + drop.radius + 2) {
      state.run.progression.xp += drop.value;
      state.run.xpDrops.splice(i, 1);
      while (state.run.progression.xp >= state.run.progression.xpToNext) {
        state.run.progression.xp -= state.run.progression.xpToNext;
        state.run.progression.xpToNext += 3;
        state.run.meta.scrap += Math.ceil(6 * state.run.meta.scrapGainMul);
      }
    }
  }
}

function updateBursts(dt) {
  for (let i = state.run.bursts.length - 1; i >= 0; i -= 1) {
    state.run.bursts[i].ttl -= dt;
    if (state.run.bursts[i].ttl <= 0) {
      state.run.bursts.splice(i, 1);
    }
  }
}

function updateWave(dt) {
  state.run.progression.waveTimer -= dt;
  if (state.run.progression.waveTimer <= 0) {
    chooseUpgrades();
    return;
  }

  if (
    state.run.progression.wave >= 5 &&
    state.run.progression.wave % 5 === 0 &&
    !state.run.progression.bossSpawned &&
    state.run.progression.waveTimer <= 12
  ) {
    spawnEnemy("boss");
    state.run.progression.bossSpawned = true;
  }

  state.run.enemySpawnTimer -= dt;
  if (state.run.enemySpawnTimer <= 0) {
    const baseInterval = Math.max(0.22, 0.9 - state.run.progression.wave * 0.045);
    state.run.enemySpawnTimer = baseInterval;
    const spawnCount = 1 + Math.floor(state.run.progression.wave / 4);
    for (let i = 0; i < spawnCount; i += 1) {
      spawnEnemy(chooseEnemyType(state.run.progression.wave));
    }
  }
}

function awardRunRewards(win) {
  const waveReward = state.run.progression.wave * 10;
  const killReward = Math.floor(state.run.meta.kills * 0.5);
  const bossReward = state.run.meta.bossKills * 25;
  const clearBonus = win ? 20 : 0;
  const total = waveReward + killReward + bossReward + clearBonus + state.run.meta.alloyEarned;
  state.profile.alloy += total;
  saveProfile();
  return total;
}

function updateHud() {
  ui.waveLabel.textContent = state.run.progression.wave;
  ui.hpLabel.textContent = `${Math.max(0, Math.ceil(state.run.player.hp))} / ${state.run.player.maxHp}`;
  ui.xpLabel.textContent = `${state.run.progression.xp} / ${state.run.progression.xpToNext}`;
  ui.scrapLabel.textContent = state.run.meta.scrap;
  ui.alloyLabel.textContent = state.profile.alloy;
  ui.synergyLabel.textContent = state.run.meta.synergyName;
  ui.timerLabel.textContent = `${Math.max(0, state.run.progression.waveTimer).toFixed(1)}s`;
  ui.killLabel.textContent = state.run.meta.kills;
  ui.bestWaveLabel.textContent = state.bestWave;
  ui.supplyButton.disabled = state.profile.alloy < SUPPLY_COST;
  ui.pauseButton.textContent = state.paused ? "继续" : "暂停";
}

function endRun(win) {
  if (!state.run.active) {
    return;
  }
  state.run.active = false;
  state.bestWave = Math.max(state.bestWave, state.run.progression.wave);
  localStorage.setItem(STORAGE_BEST_WAVE, String(state.bestWave));
  const reward = awardRunRewards(win);
  renderResearch();
  renderWeaponBook();
  updateHud();

  ui.gameOverTitle.textContent = win ? "成功撤离" : "荒城失守";
  ui.gameOverSummary.textContent =
    `到达第 ${state.run.progression.wave} 波，累计击杀 ${state.run.meta.kills}，击败 Boss ${state.run.meta.bossKills}，本局获得 ${reward} 晶核。`;
  ui.gameOverOverlay.classList.remove("hidden");
  state.paused = false;
}

function unlockOrUpgradeWeapon() {
  const candidates = weaponPool.filter((weaponId) => (state.profile.armory[weaponId] || 0) < 5);
  if (candidates.length === 0) {
    ui.supplyHint.textContent = "武器库已满级，补给箱自动转化为 20 晶核返还。";
    state.profile.alloy += 20;
    saveProfile();
    renderResearch();
    updateHud();
    return;
  }

  const weaponId = candidates[Math.floor(Math.random() * candidates.length)];
  state.profile.armory[weaponId] = Math.max(1, state.profile.armory[weaponId] + 1);
  saveProfile();
  renderWeaponBook();
  ui.supplyHint.textContent = `补给已送达：${weaponDefs[weaponId].name} 升至常驻 Lv.${state.profile.armory[weaponId]}。下局生效。`;
}

function openSupplyBox() {
  if (state.profile.alloy < SUPPLY_COST) {
    return;
  }
  state.profile.alloy -= SUPPLY_COST;
  unlockOrUpgradeWeapon();
  renderResearch();
  updateHud();
}

function drawBackground() {
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#0e1f35");
  gradient.addColorStop(1, "#060d17");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "rgba(138, 247, 215, 0.08)";
  ctx.lineWidth = 1;
  for (let x = 0; x < canvas.width; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += 64) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

function drawPlayer() {
  const player = state.run.player;
  ctx.save();
  ctx.translate(player.x, player.y);
  ctx.fillStyle = player.invuln > 0 ? "#dffdf6" : "#8af7d7";
  ctx.beginPath();
  ctx.arc(0, 0, player.radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.beginPath();
  ctx.arc(-4, -5, 3, 0, Math.PI * 2);
  ctx.arc(5, -3, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawEnemies() {
  state.run.enemies.forEach((enemy) => {
    ctx.fillStyle = enemy.slowTimer > 0 ? "#9ad5ff" : enemy.color;
    ctx.beginPath();
    ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
    ctx.fill();

    const hpWidth = enemy.radius * 2;
    ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
    ctx.fillRect(enemy.x - enemy.radius, enemy.y - enemy.radius - 10, hpWidth, 4);
    ctx.fillStyle = enemy.typeId === "boss" ? "#ffe26a" : "#ffd06b";
    ctx.fillRect(
      enemy.x - enemy.radius,
      enemy.y - enemy.radius - 10,
      hpWidth * Math.max(0, enemy.hp / enemy.maxHp),
      4
    );
  });
}

function drawProjectiles() {
  state.run.projectiles.forEach((projectile) => {
    ctx.fillStyle = projectile.color;
    ctx.beginPath();
    ctx.arc(projectile.x, projectile.y, projectile.radius, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawDrops() {
  state.run.xpDrops.forEach((drop) => {
    ctx.fillStyle = "#ffcb6b";
    ctx.beginPath();
    ctx.arc(drop.x, drop.y, drop.radius, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawBursts() {
  if (!state.settings.showEffects) {
    return;
  }
  state.run.bursts.forEach((burst) => {
    ctx.save();
    ctx.globalAlpha = Math.max(0, burst.ttl / 0.18);
    ctx.strokeStyle = burst.color;
    ctx.lineWidth = burst.type === "beam" ? 4 : 3;

    if (burst.type === "beam") {
      ctx.beginPath();
      ctx.moveTo(burst.fromX, burst.fromY);
      ctx.lineTo(burst.toX, burst.toY);
      ctx.stroke();
    } else if (burst.type === "blast") {
      ctx.beginPath();
      ctx.arc(burst.x, burst.y, burst.radius * (1 - (burst.ttl / 0.18) * 0.35), 0, Math.PI * 2);
      ctx.stroke();
    } else if (burst.type === "arc") {
      ctx.beginPath();
      ctx.arc(burst.x, burst.y, burst.radius, burst.angle - 0.75, burst.angle + 0.75);
      ctx.stroke();
    }
    ctx.restore();
  });
}

function drawGuides() {
  if (!state.settings.showGuides) {
    return;
  }
  const target = getClosestEnemy(240);
  if (!target) {
    return;
  }
  ctx.save();
  ctx.strokeStyle = target.typeId === "boss" ? "rgba(255, 226, 106, 0.3)" : "rgba(138, 247, 215, 0.15)";
  ctx.setLineDash([8, 10]);
  ctx.beginPath();
  ctx.moveTo(state.run.player.x, state.run.player.y);
  ctx.lineTo(target.x, target.y);
  ctx.stroke();
  ctx.restore();
}

function drawWaveBanner() {
  if (state.run.progression.wave % 5 !== 0 || state.run.progression.waveTimer > 13.5) {
    return;
  }
  ctx.save();
  ctx.fillStyle = "rgba(255, 226, 106, 0.16)";
  ctx.fillRect(24, 24, 220, 42);
  ctx.fillStyle = "#ffe26a";
  ctx.font = "bold 18px Trebuchet MS";
  ctx.fillText("Boss 波次已激活", 42, 50);
  ctx.restore();
}

function render() {
  drawBackground();
  drawGuides();
  drawDrops();
  drawBursts();
  drawProjectiles();
  drawEnemies();
  drawPlayer();
  drawWaveBanner();
}

function gameLoop(timestamp) {
  if (!state.lastTime) {
    state.lastTime = timestamp;
  }
  const dt = Math.min((timestamp - state.lastTime) / 1000, 0.033);
  state.lastTime = timestamp;

  if (state.sessionStarted && state.run.active && !state.pendingUpgrade && !state.paused) {
    updatePlayer(dt);
    updateWave(dt);
    fireWeapons(dt);
    updateProjectiles(dt);
    updateEnemies(dt);
    updateDrops(dt);
    updateBursts(dt);
    updateHud();
  }

  render();
  requestAnimationFrame(gameLoop);
}

window.addEventListener("keydown", (event) => {
  state.keys[event.key] = true;
  if (event.key === "Escape") {
    event.preventDefault();
    togglePause();
  }
});

window.addEventListener("keyup", (event) => {
  state.keys[event.key] = false;
});

function updatePointerTarget(event) {
  const rect = canvas.getBoundingClientRect();
  state.pointerMove = {
    x: ((event.clientX - rect.left) / rect.width) * canvas.width,
    y: ((event.clientY - rect.top) / rect.height) * canvas.height,
  };
}

canvas.addEventListener("pointerdown", (event) => {
  updatePointerTarget(event);
});

canvas.addEventListener("pointermove", (event) => {
  if ((event.buttons & 1) === 1 || event.pointerType === "touch") {
    updatePointerTarget(event);
  }
});

canvas.addEventListener("pointerup", () => {
  state.pointerMove = null;
});

canvas.addEventListener("pointerleave", () => {
  state.pointerMove = null;
});

ui.joystickBase.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  updateJoystickFromEvent(event);
});

ui.joystickBase.addEventListener("pointermove", (event) => {
  if (state.joystick.pointerId === event.pointerId) {
    updateJoystickFromEvent(event);
  }
});

ui.joystickBase.addEventListener("pointerup", (event) => {
  if (state.joystick.pointerId === event.pointerId) {
    resetJoystick();
  }
});

ui.joystickBase.addEventListener("pointercancel", () => {
  resetJoystick();
});

ui.restartButton.addEventListener("click", resetRun);
ui.overlayRestartButton.addEventListener("click", resetRun);
ui.sortButton.addEventListener("click", sortInventory);
ui.supplyButton.addEventListener("click", openSupplyBox);
ui.pauseButton.addEventListener("click", () => {
  if (!state.sessionStarted) {
    startSession(false);
    return;
  }
  togglePause();
});
ui.startButton.addEventListener("click", () => startSession(false));
ui.startPracticeButton.addEventListener("click", () => startSession(true));
ui.resumeButton.addEventListener("click", () => setPaused(false));
ui.pauseRestartButton.addEventListener("click", () => {
  resetRun();
  setPaused(false);
});
ui.toggleGuidesButton.addEventListener("click", () => {
  state.settings.showGuides = !state.settings.showGuides;
  refreshSettingsUI();
});
ui.toggleEffectsButton.addEventListener("click", () => {
  state.settings.showEffects = !state.settings.showEffects;
  refreshSettingsUI();
});

resetRun();
requestAnimationFrame(gameLoop);
