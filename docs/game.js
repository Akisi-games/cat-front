/* ============================================================================
   にゃんこ大決戦 — NYANKO WARS
   横スクロール・レーンバトル (にゃんこ大戦争ライク)
   Vanilla JS + Canvas。アセット画像が無い場合は自動でプレースホルダ描画。
   ============================================================================ */
(() => {
  "use strict";

  // ---------------------------------------------------------------- 定数
  const CW = 1280, CH = 600;          // キャンバス内部解像度
  const GROUND_Y = 508;               // 地面ライン
  const ALLY_FRONT = 168;             // 自陣の最前線 x
  const ENEMY_FRONT = 1112;           // 敵陣の最前線 x

  // ---------------------------------------------------------------- アセット
  const ASSET_FILES = {
    cat_basic: "assets/cat_basic.png",
    cat_tank: "assets/cat_tank.png",
    cat_battle: "assets/cat_battle.png",
    cat_archer: "assets/cat_archer.png",
    cat_titan: "assets/cat_titan.png",
    cat_kitten: "assets/cat_kitten.png",
    cat_ninja: "assets/cat_ninja.png",
    cat_mage: "assets/cat_mage.png",
    cat_samurai: "assets/cat_samurai.png",
    cat_dragon: "assets/cat_dragon.png",
    cat_healer: "assets/cat_healer.png",
    cat_knight: "assets/cat_knight.png",
    cat_valkyrie: "assets/cat_valkyrie.png",
    cat_god: "assets/cat_god.png",
    cat_phoenix: "assets/cat_phoenix.png",
    enemy_dog: "assets/enemy_dog.png",
    enemy_snake: "assets/enemy_snake.png",
    enemy_pig: "assets/enemy_pig.png",
    enemy_bird: "assets/enemy_bird.png",
    enemy_boss: "assets/enemy_boss.png",
    base_player: "assets/base_player.png",
    base_enemy: "assets/base_enemy.png",
    bg1: "assets/background_field.png",
    bg2: "assets/background_field2.png",
    bg3: "assets/background_field3.png",
    coin: "assets/icon_coin.png",
    catfood: "assets/item_catfood.png",
    upgrade: "assets/icon_upgrade.png",
  };
  const IMG = {};
  function loadAssets() {
    for (const [k, src] of Object.entries(ASSET_FILES)) {
      const im = new Image();
      im.src = src;
      im.onload = () => { im._ok = true; };
      im.onerror = () => { im._ok = false; };
      IMG[k] = im;
    }
  }

  // フォールバック用の絵文字＆色
  const FALLBACK = {
    cat_basic: ["🐱", "#fff"], cat_tank: ["🛡️", "#9aa7b5"], cat_battle: ["😼", "#ff8a3d"],
    cat_archer: ["🏹", "#4fae6b"], cat_titan: ["🦁", "#ffd34d"],
    cat_kitten: ["🐈", "#ffe0e6"], cat_ninja: ["🥷", "#444a66"], cat_mage: ["🪄", "#a06bff"],
    cat_samurai: ["⚔️", "#d64545"], cat_dragon: ["🐲", "#3fc98a"],
    cat_healer: ["💚", "#8ff0c0"], cat_knight: ["🛡️", "#cfd6e6"], cat_valkyrie: ["🪽", "#ffe08a"],
    cat_god: ["✨", "#fff0b0"], cat_phoenix: ["🔥", "#ff8a3d"],
    enemy_dog: ["🐶", "#b07a4a"], enemy_snake: ["🐍", "#ff7ab0"], enemy_pig: ["🐷", "#e88"],
    enemy_bird: ["🐦", "#5aa9ff"], enemy_boss: ["👹", "#c0392b"],
    base_player: ["🏰", "#7fd0e8"], base_enemy: ["💀", "#c0392b"],
  };

  // ---------------------------------------------------------------- レア度
  const RARITY = {
    N:  { label:"★",    name:"ノーマル", color:"#9fd0ff", glow:"#4cc9f0" },
    R:  { label:"★★",   name:"レア",     color:"#caa6ff", glow:"#9b6bff" },
    SR: { label:"★★★",  name:"超レア",   color:"#ffd86b", glow:"#ffb02e" },
    UR: { label:"★★★★", name:"伝説",     color:"#ff7ad9", glow:"#ff3fb0" },
  };

  // ---------------------------------------------------------------- ユニット定義
  // hp,atk,range,interval(秒),speed,kb,scale,ranged,area,rarity / heal系: heal=回復量,healRange,healInterval
  const UNITS = {
    cat_basic:  { key:"cat_basic", name:"ノラキャット", rarity:"N",  cost:75,   recharge:2.3,  hp:120,  atk:22,  range:95,  interval:1.0, speed:74, kb:2, scale:0.95, ranged:false, area:false },
    cat_tank:   { key:"cat_tank",  name:"たてキャット", rarity:"N",  cost:110,  recharge:6.0,  hp:900,  atk:6,   range:80,  interval:1.6, speed:58, kb:3, scale:1.15, ranged:false, area:false },
    cat_battle: { key:"cat_battle",name:"バトル",       rarity:"R",  cost:220,  recharge:5.5,  hp:280,  atk:65,  range:105, interval:1.2, speed:78, kb:3, scale:1.05, ranged:false, area:false },
    cat_archer: { key:"cat_archer",name:"アーチャー",   rarity:"R",  cost:330,  recharge:8.5,  hp:130,  atk:55,  range:360, interval:1.9, speed:66, kb:2, scale:1.0,  ranged:true,  area:false },
    cat_titan:  { key:"cat_titan", name:"ギガキャット", rarity:"SR", cost:1250, recharge:42,   hp:3200, atk:420, range:125, interval:2.2, speed:36, kb:1, scale:1.6,  ranged:false, area:true  },
    // ===== ガチャ限定キャラ =====
    cat_kitten: { key:"cat_kitten",name:"ベビーキャット",rarity:"N", cost:55,   recharge:1.8,  hp:80,   atk:16,  range:80,  interval:0.8, speed:90, kb:1, scale:0.78, ranged:false, area:false },
    cat_ninja:  { key:"cat_ninja", name:"にんじゃキャット",rarity:"R",cost:240, recharge:5.0,  hp:230,  atk:80,  range:95,  interval:0.9, speed:102,kb:3, scale:0.95, ranged:false, area:false },
    cat_mage:   { key:"cat_mage",  name:"まほうキャット",rarity:"R", cost:390,  recharge:9.0,  hp:160,  atk:70,  range:330, interval:2.0, speed:60, kb:2, scale:1.0,  ranged:true,  area:true  },
    cat_samurai:{ key:"cat_samurai",name:"サムライキャット",rarity:"SR",cost:600,recharge:14,  hp:760,  atk:230, range:115, interval:1.4, speed:72, kb:2, scale:1.2,  ranged:false, area:false },
    cat_dragon: { key:"cat_dragon",name:"ドラゴンキャット",rarity:"SR",cost:950, recharge:30,  hp:2000, atk:330, range:155, interval:2.0, speed:50, kb:1, scale:1.5,  ranged:false, area:true  },
    // ===== ステージ報酬キャラ (ほどほどの強さ) =====
    cat_healer: { key:"cat_healer",name:"ヒーラーキャット",rarity:"R",cost:260, recharge:7.0,  hp:240,  atk:20,  range:100, interval:1.5, speed:66, kb:2, scale:1.0,  ranged:false, area:false, heal:45,  healRange:185, healInterval:1.8 },
    cat_knight: { key:"cat_knight",name:"ナイトキャット",rarity:"R", cost:300,  recharge:6.5,  hp:620,  atk:90,  range:100, interval:1.3, speed:64, kb:3, scale:1.1,  ranged:false, area:false },
    cat_valkyrie:{key:"cat_valkyrie",name:"ヴァルキャット",rarity:"R",cost:420, recharge:9.5,  hp:340,  atk:120, range:170, interval:1.5, speed:74, kb:2, scale:1.05, ranged:false, area:true  },
    // ===== 追加ガチャキャラ =====
    cat_phoenix:{ key:"cat_phoenix",name:"フェニックスキャット",rarity:"SR",cost:880,recharge:26, hp:1500, atk:300, range:170, interval:1.7, speed:58, kb:2, scale:1.4, ranged:false, area:true },
    cat_god:    { key:"cat_god",   name:"ゴッドキャット",rarity:"UR",cost:1100, recharge:35,  hp:2600, atk:380, range:150, interval:1.8, speed:52, kb:2, scale:1.55, ranged:false, area:true, heal:160, healRange:240, healInterval:2.0 },
  };
  // 最初から所持している5体
  const STARTER_UNITS = ["cat_basic", "cat_tank", "cat_battle", "cat_archer", "cat_titan"];
  // ステージクリア報酬キャラ (ステージID → キャラ)
  const STAGE_REWARDS = { 3: "cat_healer", 8: "cat_knight", 15: "cat_valkyrie" };
  // ガチャ排出プール (weight = 排出率%。強キャラほど低確率。神様=0.5%)
  const GACHA_POOL = [
    { key:"cat_kitten",  weight:40 },
    { key:"cat_ninja",   weight:22 },
    { key:"cat_mage",    weight:17 },
    { key:"cat_samurai", weight:10 },
    { key:"cat_dragon",  weight:6  },
    { key:"cat_phoenix", weight:4.5 },
    { key:"cat_god",     weight:0.5 },
  ];
  const GACHA_COST = 100;        // 1回のポイント
  const GACHA_DUP_REFUND = 40;   // かぶり時の返却ポイント
  const TEAM_MAX = 5;            // 編成スロット数
  const ALL_UNITS = ["cat_basic","cat_tank","cat_battle","cat_archer","cat_titan","cat_healer","cat_knight","cat_valkyrie","cat_kitten","cat_ninja","cat_mage","cat_samurai","cat_dragon","cat_phoenix","cat_god"];

  const ENEMIES = {
    dog:   { key:"enemy_dog",  name:"イヌー",   hp:110,  atk:16,  range:90,  interval:1.0, speed:54, kb:2, scale:0.95, reward:45,  ranged:false, area:false },
    snake: { key:"enemy_snake",name:"へび",     hp:230,  atk:28,  range:110, interval:1.3, speed:48, kb:2, scale:1.0,  reward:80,  ranged:false, area:false },
    pig:   { key:"enemy_pig",  name:"ブタ将軍", hp:1100, atk:34,  range:80,  interval:1.6, speed:34, kb:3, scale:1.2,  reward:170, ranged:false, area:false },
    bird:  { key:"enemy_bird", name:"とり",     hp:85,   atk:22,  range:75,  interval:0.7, speed:98, kb:1, scale:0.85, reward:65,  ranged:false, area:false },
    boss:  { key:"enemy_boss", name:"魔王ドグ", hp:7000, atk:340, range:130, interval:2.0, speed:28, kb:1, scale:1.9,  reward:1200,ranged:false, area:true  },
  };

  // ---------------------------------------------------------------- ステージ定義
  // spawns: {t:秒, e:'dog'} の配列。基地は自動で雑魚をわかせる(baseSpawn)。
  function rep(t0, gap, n, e) { const a=[]; for(let i=0;i<n;i++) a.push({t:+(t0+i*gap).toFixed(2), e}); return a; }
  const STAGES = [
    {
      id: 1, name: "はじまりの草原", bg: "bg1",
      desc: "イヌーの大群がおしよせる！まずはここで キャット兵の戦い方を覚えよう。",
      playerBaseHp: 5000, enemyBaseHp: 5500,
      baseSpawn: { e:"dog", interval: 11 },
      spawns: [
        ...rep(2, 3.5, 3, "dog"),
        {t:13, e:"snake"},
        ...rep(17, 2.2, 3, "dog"),
        {t:26, e:"snake"}, {t:30, e:"bird"},
        {t:36, e:"snake"}, {t:38, e:"bird"},
        {t:46, e:"pig"},
        ...rep(52, 2.0, 4, "dog"),
        {t:62, e:"snake"}, {t:64, e:"snake"},
      ],
    },
    {
      id: 2, name: "灼熱キャニオン", bg: "bg2",
      desc: "とりの猛攻と ブタ将軍の重装甲。前線を支える壁が必須だ。",
      playerBaseHp: 6000, enemyBaseHp: 9000,
      baseSpawn: { e:"dog", interval: 8 },
      spawns: [
        ...rep(2, 2.0, 3, "bird"),
        {t:10, e:"snake"}, {t:13, e:"snake"},
        {t:18, e:"pig"},
        ...rep(24, 1.6, 4, "bird"),
        {t:34, e:"pig"}, {t:40, e:"snake"}, {t:42, e:"snake"},
        ...rep(48, 1.8, 4, "bird"),
        {t:58, e:"pig"}, {t:60, e:"pig"},
        ...rep(68, 2.2, 5, "snake"),
      ],
    },
    {
      id: 3, name: "極夜の氷原", bg: "bg3",
      desc: "魔王ドグ 降臨。全戦力を結集し、ラスボスを討て！",
      playerBaseHp: 8000, enemyBaseHp: 14000,
      baseSpawn: { e:"snake", interval: 9 },
      spawns: [
        ...rep(2, 2.2, 4, "dog"),
        {t:12, e:"pig"}, ...rep(14, 1.4, 4, "bird"),
        {t:24, e:"snake"}, {t:26, e:"snake"}, {t:28, e:"pig"},
        ...rep(34, 1.6, 5, "bird"),
        {t:46, e:"pig"}, {t:48, e:"pig"},
        {t:58, e:"boss"},
        ...rep(62, 2.0, 6, "snake"),
        ...rep(70, 1.6, 6, "bird"),
      ],
    },
    {
      id: 4, name: "みなとの突撃", bg: "bg2",
      desc: "ブタ将軍の重装部隊と とりの波状攻撃。壁と火力の両立がカギ。",
      playerBaseHp: 8000, enemyBaseHp: 16000,
      baseSpawn: { e: "bird", interval: 6 },
      spawns: [
        ...rep(2, 1.6, 5, "bird"),
        { t: 10, e: "pig" }, { t: 14, e: "pig" },
        ...rep(20, 1.4, 6, "bird"),
        { t: 30, e: "pig" }, { t: 33, e: "snake" }, { t: 36, e: "snake" },
        { t: 44, e: "pig" }, { t: 46, e: "pig" },
        ...rep(54, 1.8, 6, "snake"),
        { t: 66, e: "pig" }, { t: 68, e: "pig" }, { t: 70, e: "pig" },
      ],
    },
    {
      id: 5, name: "真夜中の襲来", bg: "bg3",
      desc: "夜陰に乗じて魔王ドグが再び。物量で押し切られる前に決めろ。",
      playerBaseHp: 9000, enemyBaseHp: 18000,
      baseSpawn: { e: "snake", interval: 7 },
      spawns: [
        ...rep(2, 2.0, 4, "dog"),
        ...rep(8, 1.4, 5, "bird"),
        { t: 18, e: "pig" }, { t: 20, e: "pig" },
        { t: 30, e: "boss" },
        ...rep(34, 1.6, 6, "snake"),
        { t: 48, e: "pig" }, ...rep(50, 1.3, 6, "bird"),
        { t: 64, e: "boss" },
      ],
    },
    {
      id: 6, name: "鋼鉄の要塞", bg: "bg1",
      desc: "ブタ将軍だらけの鉄壁布陣。範囲攻撃で一気に押し込め！",
      playerBaseHp: 10000, enemyBaseHp: 22000,
      baseSpawn: { e: "pig", interval: 9 },
      spawns: [
        { t: 2, e: "pig" }, { t: 5, e: "pig" }, { t: 8, e: "pig" },
        ...rep(14, 1.4, 6, "bird"),
        { t: 24, e: "pig" }, { t: 26, e: "pig" }, { t: 28, e: "pig" },
        ...rep(36, 1.8, 6, "snake"),
        { t: 48, e: "pig" }, { t: 50, e: "pig" }, { t: 52, e: "pig" }, { t: 54, e: "pig" },
        { t: 64, e: "boss" },
      ],
    },
    {
      id: 7, name: "双魔王降臨", bg: "bg3",
      desc: "2体の魔王ドグが同時に襲い来る。全戦力を注ぎ込め。",
      playerBaseHp: 11000, enemyBaseHp: 26000,
      baseSpawn: { e: "bird", interval: 6 },
      spawns: [
        ...rep(2, 1.6, 6, "bird"),
        { t: 12, e: "pig" }, { t: 15, e: "pig" },
        { t: 24, e: "boss" },
        ...rep(28, 1.5, 6, "snake"),
        { t: 40, e: "pig" }, { t: 42, e: "pig" }, { t: 44, e: "pig" },
        { t: 54, e: "boss" },
        ...rep(58, 1.3, 8, "bird"),
      ],
    },
    {
      id: 8, name: "最終決戦 キャットの戦線", bg: "bg2",
      desc: "全ての敵が結集する最終ステージ。ここを制すれば真の英雄だ！",
      playerBaseHp: 13000, enemyBaseHp: 32000,
      baseSpawn: { e: "pig", interval: 6 },
      spawns: [
        ...rep(2, 1.4, 6, "bird"),
        { t: 10, e: "pig" }, { t: 12, e: "pig" },
        { t: 18, e: "boss" },
        ...rep(22, 1.4, 8, "snake"),
        { t: 36, e: "pig" }, { t: 38, e: "pig" }, { t: 40, e: "pig" },
        { t: 46, e: "boss" },
        ...rep(50, 1.2, 10, "bird"),
        { t: 66, e: "boss" },
        { t: 70, e: "pig" }, { t: 72, e: "pig" },
      ],
    },
    {
      id: 9, name: "砂塵の進軍", bg: "bg2",
      desc: "果てなき軍勢の進軍。回復役で前線を維持しよう。",
      playerBaseHp: 14000, enemyBaseHp: 36000,
      baseSpawn: { e: "bird", interval: 5 },
      spawns: [
        ...rep(2, 1.3, 7, "bird"),
        { t: 12, e: "pig" }, { t: 14, e: "pig" }, { t: 16, e: "pig" },
        { t: 24, e: "boss" },
        ...rep(28, 1.3, 8, "snake"),
        { t: 42, e: "pig" }, { t: 44, e: "pig" }, { t: 46, e: "pig" },
        { t: 56, e: "boss" },
        ...rep(60, 1.2, 10, "bird"),
      ],
    },
    {
      id: 10, name: "業火の渓谷", bg: "bg2",
      desc: "灼熱の谷で巨獣たちが咆哮する。火力勝負だ。",
      playerBaseHp: 15000, enemyBaseHp: 40000,
      baseSpawn: { e: "pig", interval: 7 },
      spawns: [
        { t: 2, e: "pig" }, { t: 4, e: "pig" }, { t: 6, e: "pig" },
        ...rep(12, 1.3, 8, "bird"),
        { t: 24, e: "boss" }, { t: 28, e: "pig" }, { t: 30, e: "pig" },
        ...rep(38, 1.3, 8, "snake"),
        { t: 52, e: "boss" },
        ...rep(56, 1.1, 10, "bird"),
      ],
    },
    {
      id: 11, name: "氷結回廊", bg: "bg3",
      desc: "凍てつく回廊を埋め尽くす大群。回復と壁で耐え抜け。",
      playerBaseHp: 16000, enemyBaseHp: 46000,
      baseSpawn: { e: "snake", interval: 6 },
      spawns: [
        ...rep(2, 1.2, 9, "bird"),
        { t: 14, e: "pig" }, { t: 16, e: "pig" }, { t: 18, e: "pig" },
        { t: 26, e: "boss" },
        ...rep(30, 1.2, 9, "snake"),
        { t: 44, e: "pig" }, { t: 46, e: "pig" },
        { t: 54, e: "boss" }, { t: 58, e: "boss" },
      ],
    },
    {
      id: 12, name: "雷鳴の平原", bg: "bg1",
      desc: "雷轟く平原での総力戦。2体の魔王が同時に出現。",
      playerBaseHp: 18000, enemyBaseHp: 52000,
      baseSpawn: { e: "bird", interval: 5 },
      spawns: [
        ...rep(2, 1.2, 8, "bird"),
        { t: 12, e: "pig" }, { t: 14, e: "pig" }, { t: 16, e: "pig" }, { t: 18, e: "pig" },
        { t: 26, e: "boss" }, { t: 30, e: "boss" },
        ...rep(34, 1.2, 10, "snake"),
        { t: 50, e: "pig" }, { t: 52, e: "pig" }, { t: 54, e: "pig" },
        { t: 62, e: "boss" },
      ],
    },
    {
      id: 13, name: "深淵の門", bg: "bg3",
      desc: "深淵から無限に湧く魔の軍勢。回復役なしでは厳しい。",
      playerBaseHp: 20000, enemyBaseHp: 60000,
      baseSpawn: { e: "pig", interval: 6 },
      spawns: [
        { t: 2, e: "pig" }, { t: 4, e: "pig" }, { t: 6, e: "pig" },
        ...rep(12, 1.1, 10, "bird"),
        { t: 24, e: "boss" }, { t: 28, e: "boss" },
        ...rep(32, 1.1, 10, "snake"),
        { t: 46, e: "pig" }, { t: 48, e: "pig" }, { t: 50, e: "pig" }, { t: 52, e: "pig" },
        { t: 60, e: "boss" }, { t: 64, e: "boss" },
      ],
    },
    {
      id: 14, name: "終焉の序曲", bg: "bg2",
      desc: "終わりの始まり。3体の魔王が君臨する。",
      playerBaseHp: 22000, enemyBaseHp: 70000,
      baseSpawn: { e: "bird", interval: 4.5 },
      spawns: [
        ...rep(2, 1.1, 10, "bird"),
        { t: 14, e: "boss" },
        { t: 18, e: "pig" }, { t: 20, e: "pig" }, { t: 22, e: "pig" },
        { t: 30, e: "boss" },
        ...rep(34, 1.0, 12, "snake"),
        { t: 50, e: "pig" }, { t: 52, e: "pig" }, { t: 54, e: "pig" },
        { t: 62, e: "boss" },
        ...rep(66, 1.0, 10, "bird"),
      ],
    },
    {
      id: 15, name: "神々の戦場", bg: "bg3",
      desc: "全てを懸けた最終決戦。神の力をその手に掴め！",
      playerBaseHp: 26000, enemyBaseHp: 85000,
      baseSpawn: { e: "pig", interval: 4.5 },
      spawns: [
        ...rep(2, 1.0, 10, "bird"),
        { t: 12, e: "boss" }, { t: 14, e: "pig" }, { t: 16, e: "pig" },
        { t: 24, e: "boss" }, { t: 28, e: "boss" },
        ...rep(32, 0.9, 14, "snake"),
        { t: 48, e: "pig" }, { t: 50, e: "pig" }, { t: 52, e: "pig" }, { t: 54, e: "pig" },
        { t: 60, e: "boss" }, { t: 64, e: "boss" },
        ...rep(68, 0.9, 12, "bird"),
        { t: 82, e: "boss" },
      ],
    },
  ];

  // 財布レベル: cap=最大所持金, rate=毎秒回復, cost=次の強化費用
  function walletCap(lv) { return 1000 + (lv - 1) * 900; }
  function walletRate(lv) { return 55 + (lv - 1) * 40; }   // 円/秒
  function walletUpCost(lv) { return 320 * lv; }
  const WALLET_MAX_LV = 9;

  // ---------------------------------------------------------------- サウンド
  let actx = null;
  function sfx(type) {
    try {
      if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
      const t = actx.currentTime;
      const o = actx.createOscillator(), g = actx.createGain();
      o.connect(g); g.connect(actx.destination);
      const cfg = {
        deploy: [620, 0.08, "triangle"], hit: [180, 0.05, "square"],
        shoot: [880, 0.06, "sawtooth"], bomb: [90, 0.4, "sawtooth"],
        coin: [1200, 0.05, "sine"], win: [880, 0.5, "triangle"], lose: [120, 0.6, "sawtooth"],
        kb: [300, 0.07, "square"],
      }[type] || [440, 0.08, "sine"];
      o.type = cfg[2]; o.frequency.setValueAtTime(cfg[0], t);
      if (type === "win") o.frequency.exponentialRampToValueAtTime(1760, t + 0.4);
      if (type === "lose") o.frequency.exponentialRampToValueAtTime(60, t + 0.5);
      if (type === "bomb") o.frequency.exponentialRampToValueAtTime(40, t + 0.35);
      g.gain.setValueAtTime(0.16, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + cfg[1]);
      o.start(t); o.stop(t + cfg[1] + 0.02);
    } catch (e) { /* 無音で続行 */ }
  }

  // ---------------------------------------------------------------- 状態
  const canvas = document.getElementById("game-canvas");
  const ctx = canvas.getContext("2d");

  const Game = {
    stage: null, running: false, paused: false, time: 0,
    money: 0, walletLv: 1,
    playerHp: 0, playerHpMax: 0, enemyHp: 0, enemyHpMax: 0,
    allies: [], enemies: [], projectiles: [], effects: [], texts: [],
    spawnQueue: [], baseSpawnTimer: 0,
    cooldowns: {},           // unitKey -> 残りクールダウン秒
    foodCount: 3, foodCooldown: 0,
    result: null, lastTs: 0, shake: 0,
  };

  // ---------------------------------------------------------------- セーブデータ
  // owned: 所持キャラ, points: ガチャ用ポイント, team: 編成(最大5), progress: クリア済み
  const SAVE_KEY = "catfront_save_v1";
  const Save = { owned: [...STARTER_UNITS], points: 0, team: [...STARTER_UNITS], progress: {}, codes: [] };

  function loadSave() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        Save.owned = Array.isArray(s.owned) && s.owned.length ? s.owned.filter(k => UNITS[k]) : [...STARTER_UNITS];
        Save.points = typeof s.points === "number" ? s.points : 0;
        Save.team = Array.isArray(s.team) && s.team.length ? s.team.filter(k => UNITS[k] && Save.owned.includes(k)) : [];
        Save.progress = s.progress && typeof s.progress === "object" ? s.progress : {};
        Save.codes = Array.isArray(s.codes) ? s.codes : [];
      } else {
        // 旧セーブからの移行
        try { const old = JSON.parse(localStorage.getItem("nyanko_progress") || "{}"); Save.progress = old; } catch {}
      }
    } catch {}
    // 所持しているのにチームが空なら先頭5体を自動編成
    if (!Save.team.length) Save.team = Save.owned.slice(0, TEAM_MAX);
    saveSave();
  }
  function saveSave() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(Save)); } catch {} }

  // ---------------------------------------------------------------- ユーティリティ
  function makeFighter(def, side, x) {
    const kbStep = def.hp / def.kb;
    return {
      def, side, x,
      y: GROUND_Y,
      hp: def.hp, maxHp: def.hp,
      atkTimer: def.interval * 0.4,
      state: "move",          // move | attack | kb
      kbTimer: 0, kbVx: 0,
      nextKbAt: def.hp - kbStep, kbStep,
      lane: Math.random() * 26 - 13,   // 見た目の上下ずらし
      bob: Math.random() * Math.PI * 2,
      flash: 0,
      healTimer: def.heal ? def.healInterval * 0.5 : 0,
    };
  }

  function imgFor(key) { const im = IMG[key]; return (im && im._ok) ? im : null; }

  // ---------------------------------------------------------------- ステージ開始
  function startStage(stage) {
    Game.stage = stage;
    Game.running = true; Game.paused = false; Game.time = 0;
    Game.money = 350; Game.walletLv = 1;
    Game.playerHp = Game.playerHpMax = stage.playerBaseHp;
    Game.enemyHp = Game.enemyHpMax = stage.enemyBaseHp;
    Game.allies = []; Game.enemies = []; Game.projectiles = [];
    Game.effects = []; Game.texts = [];
    Game.spawnQueue = stage.spawns.map(s => ({ ...s, done: false }));
    Game.baseSpawnTimer = stage.baseSpawn ? stage.baseSpawn.interval : 0;
    Game.cooldowns = {}; Save.team.forEach(k => Game.cooldowns[k] = 0);
    Game.foodCount = 3; Game.foodCooldown = 0;
    Game.result = null; Game.shake = 0;

    document.getElementById("stage-name-tag").textContent = `STAGE ${stage.id}: ${stage.name}`;
    buildUnitBar();
    updateHUD();
    showScreen("battle-screen");
    showBanner("START!");
    Game.lastTs = performance.now();
    requestAnimationFrame(loop);
  }

  // ---------------------------------------------------------------- メインループ
  function loop(ts) {
    if (!Game.running) return;
    let dt = (ts - Game.lastTs) / 1000;
    Game.lastTs = ts;
    if (dt > 0.05) dt = 0.05;          // タブ切替などの巨大dt対策
    if (!Game.paused) { update(dt); }
    render();
    if (Game.running) requestAnimationFrame(loop);
  }

  function update(dt) {
    Game.time += dt;

    // --- お金 ---
    const cap = walletCap(Game.walletLv);
    Game.money = Math.min(cap, Game.money + walletRate(Game.walletLv) * dt);

    // --- クールダウン ---
    for (const k of Save.team) if (Game.cooldowns[k] > 0) Game.cooldowns[k] = Math.max(0, Game.cooldowns[k] - dt);
    if (Game.foodCooldown > 0) Game.foodCooldown = Math.max(0, Game.foodCooldown - dt);

    // --- 敵スポーン (スケジュール) ---
    for (const s of Game.spawnQueue) {
      if (!s.done && Game.time >= s.t) {
        s.done = true;
        spawnEnemy(s.e);
      }
    }
    // --- 敵基地からの定期スポーン ---
    if (Game.stage.baseSpawn) {
      Game.baseSpawnTimer -= dt;
      if (Game.baseSpawnTimer <= 0) {
        Game.baseSpawnTimer = Game.stage.baseSpawn.interval;
        spawnEnemy(Game.stage.baseSpawn.e);
      }
    }

    stepFighters(Game.allies, Game.enemies, +1, dt);
    stepFighters(Game.enemies, Game.allies, -1, dt);
    stepProjectiles(dt);
    stepEffects(dt);
    stepTexts(dt);

    // --- 死亡処理 ---
    Game.allies = Game.allies.filter(f => f.hp > 0);
    Game.enemies = Game.enemies.filter(f => {
      if (f.hp <= 0) { addCoins(f.x, f.def.reward); return false; }
      return true;
    });

    if (Game.shake > 0) Game.shake = Math.max(0, Game.shake - dt * 60);

    updateHUD();

    // --- 勝敗判定 ---
    if (Game.enemyHp <= 0 && !Game.result) endStage(true);
    else if (Game.playerHp <= 0 && !Game.result) endStage(false);
  }

  function spawnEnemy(type) {
    const def = ENEMIES[type];
    if (!def) return;
    Game.enemies.push(makeFighter(def, "enemy", ENEMY_FRONT - 10));
  }

  function addCoins(x, amount) {
    Game.money = Math.min(walletCap(Game.walletLv), Game.money + amount);
    Game.texts.push({ x, y: GROUND_Y - 120, vy: -32, life: 1.0, text: "+" + amount, color: "#ffd34d" });
  }

  // ---------------------------------------------------------------- 戦闘ステップ
  // selfs が攻撃側、foes が相手。dir=+1 なら右へ進む(自軍)、-1 なら左へ(敵)。
  function stepFighters(selfs, foes, dir, dt) {
    const enemyBaseX = dir > 0 ? ENEMY_FRONT : null;   // 自軍が攻める敵基地
    const playerBaseX = dir < 0 ? ALLY_FRONT : null;   // 敵が攻める自基地
    const targetBaseX = dir > 0 ? ENEMY_FRONT : ALLY_FRONT;

    for (const f of selfs) {
      f.bob += dt * 9;
      if (f.flash > 0) f.flash -= dt;

      // 回復アビリティ (常時)
      if (f.def.heal) {
        f.healTimer -= dt;
        if (f.healTimer <= 0) { f.healTimer = f.def.healInterval; doHeal(f); }
      }

      // ノックバック中
      if (f.state === "kb") {
        f.kbTimer -= dt;
        f.x += f.kbVx * dt;
        f.kbVx *= 0.9;
        // 場外制限
        f.x = Math.max(ALLY_FRONT - 30, Math.min(ENEMY_FRONT + 30, f.x));
        if (f.kbTimer <= 0) f.state = "move";
        continue;
      }

      // 射程内の最も近い敵を探す
      const reach = f.def.range;
      let target = null, tdist = Infinity;
      for (const g of foes) {
        const d = Math.abs(g.x - f.x);
        if (d <= reach && d < tdist) { tdist = d; target = g; }
      }
      // 基地が射程内か
      const baseDist = Math.abs(targetBaseX - f.x);
      const baseInRange = baseDist <= reach;

      if (target || baseInRange) {
        // 攻撃モード
        f.state = "attack";
        f.atkTimer -= dt;
        if (f.atkTimer <= 0) {
          f.atkTimer = f.def.interval;
          doAttack(f, dir, target, baseInRange);
        }
      } else {
        // 前進
        f.state = "move";
        f.x += dir * f.def.speed * dt;
        if (dir > 0) f.x = Math.min(f.x, ENEMY_FRONT);
        else f.x = Math.max(f.x, ALLY_FRONT);
      }
    }
  }

  function doAttack(f, dir, target, baseInRange) {
    const def = f.def;
    if (def.ranged) {
      // 遠距離: プロジェクタイル発射
      sfx("shoot");
      const tx = target ? target.x : (dir > 0 ? ENEMY_FRONT : ALLY_FRONT);
      Game.projectiles.push({
        x: f.x, y: GROUND_Y - 70 + f.lane, tx,
        vx: dir * 620, dmg: def.atk, dir,
        ally: f.side === "ally", color: f.side === "ally" ? "#7CFC9B" : "#ff7a7a",
        area: def.area, range: def.range,
      });
      return;
    }
    // 近接
    sfx("hit");
    if (def.area) {
      // 範囲攻撃: 射程内の全員
      spawnHitFx(f.x + dir * 70, GROUND_Y - 50, "#ffdf6b", 38);
      const foes = f.side === "ally" ? Game.enemies : Game.allies;
      for (const g of foes) if (Math.abs(g.x - f.x) <= def.range) dealDamage(g, def.atk);
      if (baseInRange) damageBase(f.side === "ally", def.atk);
    } else {
      if (target) { dealDamage(target, def.atk); spawnHitFx(target.x, GROUND_Y - 50, "#fff", 18); }
      else if (baseInRange) { damageBase(f.side === "ally", def.atk); spawnHitFx(dir>0?ENEMY_FRONT:ALLY_FRONT, GROUND_Y-70, "#fff", 22); }
    }
  }

  function doHeal(healer) {
    const friends = healer.side === "ally" ? Game.allies : Game.enemies;
    let healed = false;
    for (const a of friends) {
      if (a === healer || a.hp <= 0 || a.hp >= a.maxHp) continue;
      if (Math.abs(a.x - healer.x) <= healer.def.healRange) {
        a.hp = Math.min(a.maxHp, a.hp + healer.def.heal);
        a.flash = 0.1;
        spawnHitFx(a.x, GROUND_Y - 70 + a.lane, "#7CFC9B", 16);
        healed = true;
      }
    }
    if (healed) Game.texts.push({ x: healer.x, y: GROUND_Y - 130, vy: -28, life: 0.9, text: "♥ HEAL", color: "#7CFC9B" });
  }

  function dealDamage(f, dmg) {
    f.hp -= dmg;
    f.flash = 0.12;
    // ノックバック判定
    if (f.hp > 0 && f.hp <= f.nextKbAt) {
      f.nextKbAt -= f.kbStep;
      f.state = "kb";
      f.kbTimer = 0.45;
      f.kbVx = (f.side === "ally" ? -1 : 1) * 240;
      sfx("kb");
      spawnHitFx(f.x, GROUND_Y - 60, "#ffea7a", 22);
    }
  }

  function damageBase(allyAttacking, dmg) {
    if (allyAttacking) {
      Game.enemyHp = Math.max(0, Game.enemyHp - dmg);
    } else {
      Game.playerHp = Math.max(0, Game.playerHp - dmg);
      Game.shake = Math.min(14, Game.shake + dmg / 60);
    }
  }

  function stepProjectiles(dt) {
    for (const p of Game.projectiles) {
      p.x += p.vx * dt;
      p.reached = (p.dir > 0 && p.x >= p.tx) || (p.dir < 0 && p.x <= p.tx);
      if (p.reached) {
        const foes = p.ally ? Game.enemies : Game.allies;
        let best = null, bd = Infinity;
        for (const g of foes) { const d = Math.abs(g.x - p.x); if (d < bd) { bd = d; best = g; } }
        if (p.area) {
          for (const g of foes) if (Math.abs(g.x - p.x) <= 90) dealDamage(g, p.dmg);
          spawnHitFx(p.x, p.y, p.color, 34);
        } else if (best && bd <= 60) {
          dealDamage(best, p.dmg); spawnHitFx(best.x, p.y, p.color, 18);
        } else {
          // 基地ヒット
          const baseX = p.dir > 0 ? ENEMY_FRONT : ALLY_FRONT;
          if (Math.abs(p.x - baseX) <= 70) damageBase(p.ally, p.dmg);
          spawnHitFx(p.x, p.y, p.color, 14);
        }
      }
    }
    Game.projectiles = Game.projectiles.filter(p => !p.reached && p.x > -40 && p.x < CW + 40);
  }

  function spawnHitFx(x, y, color, r) { Game.effects.push({ x, y, r: 4, maxR: r, color, life: 0.3, max: 0.3 }); }
  function stepEffects(dt) {
    for (const e of Game.effects) { e.life -= dt; e.r = e.maxR * (1 - e.life / e.max); }
    Game.effects = Game.effects.filter(e => e.life > 0);
  }
  function stepTexts(dt) {
    for (const t of Game.texts) { t.life -= dt; t.y += t.vy * dt; }
    Game.texts = Game.texts.filter(t => t.life > 0);
  }

  // ---------------------------------------------------------------- アクション
  function deployUnit(key) {
    const def = UNITS[key];
    if (!def || Game.paused || !Game.running) return;
    if (Game.cooldowns[key] > 0) return;
    if (Game.money < def.cost) { flashCantAfford(); return; }
    Game.money -= def.cost;
    Game.cooldowns[key] = def.recharge;
    Game.allies.push(makeFighter(def, "ally", ALLY_FRONT + 6));
    sfx("deploy");
    updateHUD();
  }

  function useFood() {
    if (Game.foodCount <= 0 || Game.foodCooldown > 0 || Game.paused || !Game.running) return;
    Game.foodCount--; Game.foodCooldown = 4;
    sfx("bomb");
    Game.shake = 14;
    // 画面全体の敵に大ダメージ
    for (const g of Game.enemies) { dealDamage(g, 800); }
    // 派手なエフェクト
    for (let i = 0; i < 14; i++) {
      spawnHitFx(300 + Math.random() * 700, GROUND_Y - 40 - Math.random() * 120,
        ["#ffd34d", "#ff7a7a", "#7CFC9B", "#fff"][i % 4], 30 + Math.random() * 40);
    }
    showBanner("CAT FOOD BOMB!");
    document.getElementById("food-count").textContent = "x" + Game.foodCount;
    updateHUD();
  }

  function upgradeWallet() {
    if (Game.walletLv >= WALLET_MAX_LV) return;
    const cost = walletUpCost(Game.walletLv);
    if (Game.money < cost) { flashCantAfford(); return; }
    Game.money -= cost;
    Game.walletLv++;
    sfx("coin");
    updateHUD();
  }

  function flashCantAfford() {
    const m = document.getElementById("money-display");
    m.style.transition = "none"; m.style.color = "#ff5a76";
    setTimeout(() => { m.style.transition = "color .4s"; m.style.color = ""; }, 30);
  }

  // ---------------------------------------------------------------- 描画
  function render() {
    ctx.save();
    let ox = 0, oy = 0;
    if (Game.shake > 0) { ox = (Math.random()-0.5)*Game.shake; oy = (Math.random()-0.5)*Game.shake; }
    ctx.clearRect(0, 0, CW, CH);
    ctx.translate(ox, oy);

    drawBackground();
    drawBases();

    // 奥行きのため y(lane) でソート
    const all = [...Game.allies, ...Game.enemies].sort((a, b) => (a.lane) - (b.lane));
    for (const f of all) drawFighter(f);

    drawProjectiles();
    drawEffects();
    drawTexts();
    ctx.restore();
  }

  function drawBackground() {
    const bg = imgFor(Game.stage.bg);
    if (bg) {
      // cover
      const s = Math.max(CW / bg.width, CH / bg.height);
      const w = bg.width * s, h = bg.height * s;
      ctx.drawImage(bg, (CW - w) / 2, (CH - h) / 2, w, h);
    } else {
      const grd = ctx.createLinearGradient(0, 0, 0, CH);
      grd.addColorStop(0, "#8fd0ff"); grd.addColorStop(0.7, "#bdeaa0"); grd.addColorStop(1, "#7cb35a");
      ctx.fillStyle = grd; ctx.fillRect(0, 0, CW, CH);
    }
    // 地面の帯
    ctx.fillStyle = "rgba(40,28,20,0.18)";
    ctx.fillRect(0, GROUND_Y + 18, CW, CH - GROUND_Y);
  }

  function drawBases() {
    drawBaseSprite("base_player", 16, true);
    drawBaseSprite("base_enemy", CW - 16 - 200, false);
  }
  function drawBaseSprite(key, x, isPlayer) {
    const im = imgFor(key);
    const w = 200, h = 230, y = GROUND_Y - h + 70;
    if (im) {
      ctx.save();
      if (!isPlayer) { ctx.translate(x + w, y); ctx.scale(-1, 1); ctx.drawImage(im, 0, 0, w, h); ctx.restore(); }
      else { ctx.drawImage(im, x, y, w, h); }
    } else {
      const fb = FALLBACK[key];
      ctx.fillStyle = isPlayer ? "#3a6ea5" : "#7a2b2b";
      roundRect(x + 30, y + 60, w - 60, h - 70, 16); ctx.fill();
      ctx.font = "90px serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(fb[0], x + w / 2, y + h / 2 + 10);
    }
  }

  function drawFighter(f) {
    const im = imgFor(f.def.key);
    const baseH = 150 * f.def.scale;
    const bobY = Math.sin(f.bob) * 3;
    const cx = f.x, cy = GROUND_Y + f.lane * 0.5;
    const w = baseH, h = baseH;
    const drawX = cx - w / 2, drawY = cy - h + 18 + bobY;
    const facingRight = f.side === "ally";   // 画像は自軍=右向き / 敵=左向きで生成

    ctx.save();
    // 影
    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.beginPath(); ctx.ellipse(cx, cy + 12, w * 0.32, 10, 0, 0, Math.PI * 2); ctx.fill();

    if (f.flash > 0) ctx.filter = "brightness(2.2)";

    if (im) {
      ctx.drawImage(im, drawX, drawY, w, h);
    } else {
      const fb = FALLBACK[f.def.key] || ["❓", "#ccc"];
      ctx.fillStyle = fb[1];
      roundRect(drawX + w*0.2, drawY + h*0.25, w*0.6, h*0.6, 14); ctx.fill();
      ctx.filter = "none";
      ctx.font = `${Math.floor(baseH*0.5)}px serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(fb[0], cx, cy - baseH*0.4);
    }
    ctx.filter = "none";

    // HPバー
    const bw = Math.max(40, w * 0.5), bh = 6;
    const hpRatio = Math.max(0, f.hp / f.maxHp);
    const bx = cx - bw / 2, by = drawY - 4;
    ctx.fillStyle = "rgba(0,0,0,0.55)"; roundRect(bx - 1, by - 1, bw + 2, bh + 2, 3); ctx.fill();
    ctx.fillStyle = f.side === "ally" ? "#4cc9f0" : "#ff5a76";
    roundRect(bx, by, bw * hpRatio, bh, 3); ctx.fill();
    ctx.restore();
  }

  function drawProjectiles() {
    for (const p of Game.projectiles) {
      ctx.save();
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color; ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.area ? 11 : 7, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
  }
  function drawEffects() {
    for (const e of Game.effects) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, e.life / e.max);
      ctx.strokeStyle = e.color; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }
  }
  function drawTexts() {
    ctx.save();
    ctx.font = "bold 26px 'Hiragino Maru Gothic ProN', sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    for (const t of Game.texts) {
      ctx.globalAlpha = Math.max(0, Math.min(1, t.life));
      ctx.lineWidth = 4; ctx.strokeStyle = "rgba(0,0,0,.6)";
      ctx.strokeText(t.text, t.x, t.y); ctx.fillStyle = t.color; ctx.fillText(t.text, t.x, t.y);
    }
    ctx.restore();
  }

  function roundRect(x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // ---------------------------------------------------------------- HUD
  function buildUnitBar() {
    const bar = document.getElementById("unit-bar");
    bar.innerHTML = "";
    for (const key of Save.team) {
      const def = UNITS[key];
      if (!def) continue;
      const r = RARITY[def.rarity];
      const btn = document.createElement("button");
      btn.className = "unit-btn"; btn.dataset.key = key;
      btn.style.setProperty("--rar", r.glow);
      const im = imgFor(def.key);
      const imgHtml = im ? `<img class="u-img" src="${ASSET_FILES[def.key]}" alt="">`
                        : `<div class="u-img" style="font-size:38px">${(FALLBACK[def.key]||["🐱"])[0]}</div>`;
      btn.innerHTML = `<span class="u-rar" style="color:${r.color}">${r.label}</span>${imgHtml}
        <div class="u-name">${def.name}</div>
        <div class="u-cost">¥${def.cost}</div>
        <div class="cooldown hidden">0</div>`;
      btn.addEventListener("click", () => deployUnit(key));
      bar.appendChild(btn);
    }
  }

  function updateHUD() {
    const money = Math.floor(Game.money);
    document.getElementById("money-text").textContent = money;
    const cap = walletCap(Game.walletLv);
    document.getElementById("wallet-fill").style.width = Math.min(100, (Game.money / cap) * 100) + "%";
    document.getElementById("wallet-lv").textContent = Game.walletLv;
    const upBtn = document.getElementById("btn-upgrade-wallet");
    if (Game.walletLv >= WALLET_MAX_LV) {
      document.getElementById("wallet-cost").textContent = "MAX";
      upBtn.disabled = true;
    } else {
      const c = walletUpCost(Game.walletLv);
      document.getElementById("wallet-cost").textContent = "¥" + c;
      upBtn.disabled = money < c;
    }

    document.getElementById("player-hp-fill").style.width = (Game.playerHp / Game.playerHpMax * 100) + "%";
    document.getElementById("enemy-hp-fill").style.width = (Game.enemyHp / Game.enemyHpMax * 100) + "%";

    // ユニットボタン状態
    document.querySelectorAll(".unit-btn").forEach(btn => {
      const key = btn.dataset.key, def = UNITS[key];
      const cd = Game.cooldowns[key];
      const cdEl = btn.querySelector(".cooldown");
      if (cd > 0) {
        cdEl.classList.remove("hidden");
        cdEl.textContent = cd.toFixed(1);
        cdEl.style.height = (cd / def.recharge * 100) + "%";
      } else {
        cdEl.classList.add("hidden");
      }
      const afford = money >= def.cost && cd <= 0;
      btn.classList.toggle("affordable", afford);
      btn.classList.toggle("cant", money < def.cost);
    });

    const foodBtn = document.getElementById("btn-catfood");
    foodBtn.disabled = Game.foodCount <= 0 || Game.foodCooldown > 0;
    document.getElementById("food-count").textContent = "x" + Game.foodCount;
  }

  function showBanner(text) {
    const b = document.getElementById("battle-banner");
    b.textContent = text; b.classList.remove("show");
    void b.offsetWidth; b.classList.add("show");
  }

  // ---------------------------------------------------------------- 終了
  function endStage(win) {
    Game.result = win ? "win" : "lose";
    Game.running = false;
    sfx(win ? "win" : "lose");
    let earned = 0, firstClear = false, rewardKey = null;
    if (win) {
      const id = Game.stage.id;
      firstClear = !Save.progress["s" + id];
      earned = firstClear ? (120 + 80 * id) : (40 + 20 * id);
      Save.progress["s" + id] = true;
      Save.points += earned;
      // ステージ報酬キャラ (初クリアかつ未所持のみ)
      const rk = STAGE_REWARDS[id];
      if (firstClear && rk && !Save.owned.includes(rk)) { Save.owned.push(rk); rewardKey = rk; }
      saveSave();
    }
    setTimeout(() => {
      const title = document.getElementById("result-title");
      title.textContent = win ? "勝利！" : "敗北…";
      title.className = win ? "win" : "lose";
      let rewardHtml = "";
      if (rewardKey) {
        const rd = UNITS[rewardKey];
        rewardHtml = `<br><span class="reward-char">🎉 新キャラ「${rd.name}」を入手！編成に加えよう</span>`;
      }
      document.getElementById("result-text").innerHTML = win
        ? `STAGE ${Game.stage.id}「${Game.stage.name}」を制圧した！<br>` +
          `<span class="reward-pt">🎁 ${earned} ポイント獲得${firstClear ? "（初クリアボーナス！）" : ""}</span>` +
          rewardHtml + `<br><small>所持ポイント: ${Save.points}</small>`
        : `自陣が崩壊した…編成やガチャ、回復役を見直してもう一度挑戦しよう。`;
      showScreen("result-screen");
    }, 900);
  }

  // ---------------------------------------------------------------- 画面遷移
  function showScreen(id) {
    document.querySelectorAll(".screen").forEach(s => s.classList.toggle("active", s.id === id));
  }

  function buildStageList() {
    const list = document.getElementById("stage-list");
    const prog = Save.progress;
    const ptEl = document.getElementById("stage-points");
    if (ptEl) ptEl.textContent = Save.points;
    list.innerHTML = "";
    STAGES.forEach((st, i) => {
      const unlocked = i === 0 || prog["s" + STAGES[i - 1].id];
      const cleared = prog["s" + st.id];
      const card = document.createElement("div");
      card.className = "stage-card" + (unlocked ? "" : " locked");
      card.innerHTML = `
        <h3>STAGE ${st.id}${cleared ? ' <span class="clear-badge">★クリア</span>' : ''}</h3>
        <div style="font-weight:800;margin-bottom:6px">${st.name}</div>
        <div class="desc">${st.desc}</div>
        <div class="meta">${unlocked ? "▶ いざ出陣" : "🔒 前ステージをクリアで解放"}</div>`;
      if (unlocked) card.addEventListener("click", () => { if (actx) actx.resume(); startStage(st); });
      list.appendChild(card);
    });
  }

  // ---------------------------------------------------------------- ガチャ
  function rollGacha() {
    const total = GACHA_POOL.reduce((s, p) => s + p.weight, 0);
    let r = Math.random() * total;
    for (const p of GACHA_POOL) { if ((r -= p.weight) < 0) return p.key; }
    return GACHA_POOL[GACHA_POOL.length - 1].key;
  }

  function doGacha(count) {
    const cost = GACHA_COST * count;
    if (Save.points < cost) { pulse(document.getElementById("gacha-points-box")); return; }
    Save.points -= cost;
    const results = [];
    for (let i = 0; i < count; i++) {
      const key = rollGacha();
      const isNew = !Save.owned.includes(key);
      if (isNew) Save.owned.push(key);
      else Save.points += GACHA_DUP_REFUND;
      results.push({ key, isNew });
    }
    saveSave();
    sfx(results.some(r => UNITS[r.key].rarity === "SR") ? "win" : "coin");
    showGachaResults(results);
    updateGachaHeader();
  }

  function showGachaResults(results) {
    const box = document.getElementById("gacha-result");
    box.innerHTML = "";
    results.forEach((res, idx) => {
      const def = UNITS[res.key];
      const r = RARITY[def.rarity];
      const im = imgFor(def.key);
      const imgHtml = im ? `<img src="${ASSET_FILES[def.key]}" alt="">`
                         : `<div class="ph">${(FALLBACK[def.key] || ["🐱"])[0]}</div>`;
      const card = document.createElement("div");
      card.className = `gacha-card rar-${def.rarity}`;
      card.style.setProperty("--rar", r.glow);
      card.style.animationDelay = (idx * 0.08) + "s";
      card.innerHTML = `<div class="gc-rar" style="color:${r.color}">${r.label}</div>
        ${imgHtml}
        <div class="gc-name">${def.name}</div>
        <div class="gc-tag ${res.isNew ? "new" : "dup"}">${res.isNew ? "NEW!" : "かぶり +" + GACHA_DUP_REFUND + "pt"}</div>`;
      box.appendChild(card);
    });
  }

  function buildGachaScreen() {
    updateGachaHeader();
    const box = document.getElementById("gacha-result");
    if (box && !box.dataset.kept) box.innerHTML = `<p class="gacha-hint">★★★ほど出にくい超レア！ポイントを貯めて引こう。</p>`;
  }

  function updateGachaHeader() {
    document.getElementById("gacha-points").textContent = Save.points;
    document.getElementById("btn-pull1").disabled = Save.points < GACHA_COST;
    document.getElementById("btn-pull10").disabled = Save.points < GACHA_COST * 10;
  }

  // ---------------------------------------------------------------- 編成
  const UNIT_STAT_LABEL = (def) =>
    `体力 ${def.hp} / 攻撃 ${def.atk}${def.ranged ? " / 遠" : ""}${def.area ? " / 範囲" : ""}`;

  function buildTeamScreen() {
    updateTeamHeader();
    const grid = document.getElementById("roster-grid");
    grid.innerHTML = "";
    for (const key of ALL_UNITS) {
      const def = UNITS[key];
      const owned = Save.owned.includes(key);
      const inTeam = Save.team.includes(key);
      const teamIdx = Save.team.indexOf(key);
      const r = RARITY[def.rarity];
      const im = imgFor(def.key);
      const imgHtml = im ? `<img src="${ASSET_FILES[def.key]}" alt="">`
                         : `<div class="ph">${(FALLBACK[def.key] || ["🐱"])[0]}</div>`;
      const card = document.createElement("div");
      card.className = "roster-card" + (owned ? "" : " locked") + (inTeam ? " in-team" : "");
      card.style.setProperty("--rar", r.glow);
      card.innerHTML = `
        <div class="rc-rar" style="color:${r.color}">${r.label}</div>
        ${inTeam ? `<div class="rc-slot">${teamIdx + 1}</div>` : ""}
        <div class="rc-img">${owned ? imgHtml : `<div class="ph lock">🔒</div>`}</div>
        <div class="rc-name">${owned ? def.name : "？？？"}</div>
        <div class="rc-stat">${owned ? UNIT_STAT_LABEL(def) : "ガチャで入手"}</div>`;
      if (owned) card.addEventListener("click", () => toggleTeam(key));
      grid.appendChild(card);
    }
  }

  function toggleTeam(key) {
    const i = Save.team.indexOf(key);
    if (i >= 0) {
      if (Save.team.length <= 1) { pulse(document.getElementById("team-count-box")); return; }
      Save.team.splice(i, 1);
    } else {
      if (Save.team.length >= TEAM_MAX) { pulse(document.getElementById("team-count-box")); return; }
      Save.team.push(key);
    }
    sfx("deploy");
    saveSave();
    buildTeamScreen();
  }

  function updateTeamHeader() {
    document.getElementById("team-count").textContent = Save.team.length;
    document.getElementById("team-max").textContent = TEAM_MAX;
  }

  function pulse(el) {
    if (!el) return;
    el.classList.remove("pulse"); void el.offsetWidth; el.classList.add("pulse");
  }

  // ---------------------------------------------------------------- コード入力
  function openCodeModal() {
    const inp = document.getElementById("code-input");
    const msg = document.getElementById("code-msg");
    inp.value = ""; msg.textContent = ""; msg.className = "code-msg";
    document.getElementById("code-overlay").classList.remove("hidden");
    setTimeout(() => inp.focus(), 50);
  }
  function closeCodeModal() {
    document.getElementById("code-overlay").classList.add("hidden");
  }
  function redeemCode() {
    const inp = document.getElementById("code-input");
    const msg = document.getElementById("code-msg");
    const code = (inp.value || "").trim();
    if (!code) { msg.className = "code-msg ng"; msg.textContent = "コードを入力してください"; return; }
    if ((code === "アキシ" || code === "裏技") && Save.codes.includes(code)) {
      msg.className = "code-msg ng"; msg.textContent = "このコードは使用済みです"; inp.value = ""; return;
    }
    if (code === "アキシ") {
      Save.points += 1000; Save.codes.push(code); saveSave(); sfx("coin");
      msg.className = "code-msg ok"; msg.textContent = "🎉 1000ポイント獲得！";
    } else if (code === "裏技") {
      Save.points += 10000; Save.owned = [...ALL_UNITS]; Save.codes.push(code); saveSave(); sfx("win");
      msg.className = "code-msg ok"; msg.textContent = "🎉 10000pt ＆ 全キャラ解放！";
    } else {
      msg.className = "code-msg ng"; msg.textContent = "無効なコードです";
    }
    inp.value = "";
    const sp = document.getElementById("stage-points"); if (sp) sp.textContent = Save.points;
    const gp = document.getElementById("gacha-points"); if (gp) gp.textContent = Save.points;
  }

  // ---------------------------------------------------------------- イベント
  function bindUI() {
    document.getElementById("btn-start").addEventListener("click", () => {
      try { actx = actx || new (window.AudioContext||window.webkitAudioContext)(); actx.resume(); } catch {}
      buildStageList(); showScreen("stage-screen");
    });
    document.querySelectorAll("[data-goto]").forEach(b =>
      b.addEventListener("click", () => showScreen(b.dataset.goto)));

    document.getElementById("btn-catfood").addEventListener("click", useFood);
    document.getElementById("btn-upgrade-wallet").addEventListener("click", upgradeWallet);
    document.getElementById("btn-pause").addEventListener("click", () => {
      Game.paused = true; document.getElementById("pause-overlay").classList.remove("hidden");
    });
    document.getElementById("btn-resume").addEventListener("click", () => {
      Game.paused = false; document.getElementById("pause-overlay").classList.add("hidden");
      Game.lastTs = performance.now();
    });
    document.getElementById("btn-give-up").addEventListener("click", () => {
      Game.running = false; Game.paused = false;
      document.getElementById("pause-overlay").classList.add("hidden");
      buildStageList(); showScreen("stage-screen");
    });
    document.getElementById("btn-retry").addEventListener("click", () => startStage(Game.stage));
    document.getElementById("btn-to-stages").addEventListener("click", () => { buildStageList(); showScreen("stage-screen"); });

    // 編成・ガチャ
    document.getElementById("btn-team").addEventListener("click", () => { buildTeamScreen(); showScreen("team-screen"); });
    document.getElementById("btn-gacha").addEventListener("click", () => { buildGachaScreen(); showScreen("gacha-screen"); });
    document.getElementById("btn-team-back").addEventListener("click", () => { buildStageList(); showScreen("stage-screen"); });
    document.getElementById("btn-gacha-back").addEventListener("click", () => { buildStageList(); showScreen("stage-screen"); });
    document.getElementById("btn-pull1").addEventListener("click", () => doGacha(1));
    document.getElementById("btn-pull10").addEventListener("click", () => doGacha(10));
    document.getElementById("btn-result-gacha").addEventListener("click", () => { buildGachaScreen(); showScreen("gacha-screen"); });

    // コード入力
    document.getElementById("btn-code").addEventListener("click", openCodeModal);
    document.getElementById("btn-code-redeem").addEventListener("click", redeemCode);
    document.getElementById("btn-code-close").addEventListener("click", closeCodeModal);
    document.getElementById("code-input").addEventListener("keydown", (e) => { if (e.key === "Enter") redeemCode(); });

    // タイトルの飾りネコ
    document.getElementById("title-cats").textContent = "🐱  😼  🦁  🏹  🛡️";

    // キーボードショートカット (1-5 で出撃, F フード)
    window.addEventListener("keydown", (e) => {
      if (!Game.running || Game.paused) return;
      const n = parseInt(e.key, 10);
      if (n >= 1 && n <= Save.team.length) deployUnit(Save.team[n - 1]);
      if (e.key.toLowerCase() === "f") useFood();
    });
  }

  // ---------------------------------------------------------------- アクセスカウンター
  // 登録不要の無料ヒットカウンター(Abacus)。1セッション1回だけ加算し、総数を表示。
  function setupVisitCounter() {
    const el = document.getElementById("visit-count");
    if (!el) return;
    const BASE = "https://abacus.jasoncameron.dev";
    const NS = "catfront-akisi-games", KEY = "visits";
    const counted = sessionStorage.getItem("cf_counted");
    const url = counted ? `${BASE}/get/${NS}/${KEY}` : `${BASE}/hit/${NS}/${KEY}`;
    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        if (!counted) { try { sessionStorage.setItem("cf_counted", "1"); } catch {} }
        if (typeof d.value === "number") el.textContent = d.value.toLocaleString();
        else el.textContent = "—";
      })
      .catch(() => { el.textContent = "—"; });
  }

  // ---------------------------------------------------------------- 起動
  loadAssets();
  loadSave();
  bindUI();
  setupVisitCounter();
})();
