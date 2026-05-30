// ============================================================================
//  にゃんこ大決戦 — アセット自動生成スクリプト (無料・キー不要)
//
//  画像生成: Pollinations.ai (Flux モデル)  ※APIキー・課金不要
//  背景除去: jimp で四隅からフラッドフィル → 透過PNG化
//
//  使い方:  npm run gen
//  既に存在するファイルはスキップ。失敗分は再実行で再試行されます。
// ============================================================================

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Jimp } from "jimp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.join(__dirname, "docs", "assets");

// ---- 共通スタイル ----------------------------------------------------------
const STYLE =
  "adorable pop cartoon mobile game asset, bold thick black outlines, vivid saturated candy colors, " +
  "soft cel shading, glossy highlights, chibi cute proportions, clean vector style, no text, no watermark";
// スプライトは白背景で生成 → コードで透過化
const SPR_R = "single character, side view facing right, full body, standing, centered, generous empty margin, flat pure white background, no shadow";
const SPR_L = "single character, side view facing left, full body, standing, centered, generous empty margin, flat pure white background, no shadow";
const ITEM = "single object, centered, generous empty margin, flat pure white background, no shadow";

// transparent:true のものは白背景除去を行う
const ASSETS = [
  // ===== 自軍ユニット (右向き) =====
  { file:"cat_basic.png",  transparent:true, w:1024, h:1024, seed:11,
    prompt:`a cute round chubby white cat warrior with big sparkly eyes and tiny paws, cheerful happy face, ${SPR_R}, ${STYLE}` },
  { file:"cat_tank.png",   transparent:true, w:1024, h:1024, seed:12,
    prompt:`a huge chubby grey tank cat holding a big round shield, tough determined face, very wide wall-like body, ${SPR_R}, ${STYLE}` },
  { file:"cat_battle.png", transparent:true, w:1024, h:1024, seed:13,
    prompt:`a brave orange tabby battle cat wearing a red headband, raising boxing fists, energetic fighting pose, ${SPR_R}, ${STYLE}` },
  { file:"cat_archer.png", transparent:true, w:1024, h:1024, seed:14,
    prompt:`a sleek green ninja cat archer holding a wooden bow with arrow drawn, cool focused expression, ${SPR_R}, ${STYLE}` },
  { file:"cat_titan.png",  transparent:true, w:1024, h:1024, seed:15,
    prompt:`a gigantic muscular golden titan cat, heroic powerful, glowing golden aura, mighty pose, ${SPR_R}, ${STYLE}` },

  // ===== ガチャ追加キャラ (右向き) =====
  { file:"cat_kitten.png", transparent:true, w:1024, h:1024, seed:16,
    prompt:`a tiny adorable baby kitten with huge sparkly eyes, super cute and small, wobbly cute pose, ${SPR_R}, ${STYLE}` },
  { file:"cat_ninja.png",  transparent:true, w:1024, h:1024, seed:17,
    prompt:`a sneaky black ninja cat wearing a dark mask and scarf, holding a shuriken, agile crouching pose, ${SPR_R}, ${STYLE}` },
  { file:"cat_mage.png",   transparent:true, w:1024, h:1024, seed:18,
    prompt:`a purple wizard cat wearing a tall pointed star hat, holding a glowing magic staff, casting sparkles, ${SPR_R}, ${STYLE}` },
  { file:"cat_samurai.png",transparent:true, w:1024, h:1024, seed:19,
    prompt:`a noble samurai cat in red lacquered armor wielding a katana, fierce honorable warrior stance, ${SPR_R}, ${STYLE}` },
  { file:"cat_dragon.png", transparent:true, w:1024, h:1024, seed:20,
    prompt:`a majestic legendary dragon-cat hybrid with feathered wings and shiny scales, breathing a small flame, epic powerful, ${SPR_R}, ${STYLE}` },

  // ===== 追加キャラ (回復・報酬・ガチャ) =====
  { file:"cat_healer.png", transparent:true, w:1024, h:1024, seed:60,
    prompt:`a gentle white and mint-green nurse priest cat with a glowing green healing halo, holding a small staff topped with a leaf cross, kind warm healing aura, ${SPR_R}, ${STYLE}` },
  { file:"cat_knight.png", transparent:true, w:1024, h:1024, seed:61,
    prompt:`a brave silver-armored knight cat holding a sword and a shield, noble heroic stance, shiny plate armor, ${SPR_R}, ${STYLE}` },
  { file:"cat_valkyrie.png", transparent:true, w:1024, h:1024, seed:62,
    prompt:`a fierce valkyrie warrior cat with small white angelic wings and golden helmet, wielding a golden spear, ${SPR_R}, ${STYLE}` },
  { file:"cat_god.png", transparent:true, w:1024, h:1024, seed:63,
    prompt:`a divine god deity cat with a radiant golden halo, ornate flowing celestial white and gold robes, holy glowing light rays, majestic supreme god-like presence, ${SPR_R}, ${STYLE}` },
  { file:"cat_phoenix.png", transparent:true, w:1024, h:1024, seed:64,
    prompt:`a blazing legendary phoenix cat with large fiery orange wings and flame aura, glowing embers, mythical reborn fire bird cat, ${SPR_R}, ${STYLE}` },

  // ===== 敵ユニット (左向き) =====
  { file:"enemy_dog.png",   transparent:true, w:1024, h:1024, seed:21,
    prompt:`a silly brown cartoon dog enemy with goofy grin and floppy ears, comedic villain look, ${SPR_L}, ${STYLE}` },
  { file:"enemy_snake.png", transparent:true, w:1024, h:1024, seed:22,
    prompt:`a wiggly pink cartoon snake enemy with cheeky tongue out, springy coiled body, mischievous eyes, ${SPR_L}, ${STYLE}` },
  { file:"enemy_pig.png",   transparent:true, w:1024, h:1024, seed:23,
    prompt:`a fat tough armored battle pig enemy with iron helmet, snorting angrily, heavy tanky body, ${SPR_L}, ${STYLE}` },
  { file:"enemy_bird.png",  transparent:true, w:1024, h:1024, seed:24,
    prompt:`a fast little blue cartoon bird enemy with sharp beak, agile speedy look, ${SPR_L}, ${STYLE}` },
  { file:"enemy_boss.png",  transparent:true, w:1024, h:1024, seed:25,
    prompt:`a gigantic terrifying boss dog with glowing red eyes, golden crown, dark menacing aura, evil overlord, ${SPR_L}, ${STYLE}` },

  // ===== 拠点 =====
  { file:"base_player.png", transparent:true, w:1024, h:1024, seed:31,
    prompt:`a cute cozy fortress castle shaped like a smiling cat face, pastel colors, paw flags, friendly base, ${ITEM}, ${STYLE}` },
  { file:"base_enemy.png",  transparent:true, w:1024, h:1024, seed:32,
    prompt:`a spooky dark skull fortress with red banners and jagged towers, evil stronghold, ${ITEM}, ${STYLE}` },

  // ===== 背景 (不透明・横長) =====
  { file:"background_field.png",  transparent:false, w:1280, h:720, seed:41,
    prompt:`bright sunny grassy battlefield plain stretching wide, fluffy clouds blue sky, distant green hills, cheerful cartoon game background, horizontal, no characters, no text, ${STYLE}` },
  { file:"background_field2.png", transparent:false, w:1280, h:720, seed:42,
    prompt:`dramatic sunset desert canyon battlefield, orange purple sky, rocky mesas, cheerful cartoon game background, horizontal, no characters, no text, ${STYLE}` },
  { file:"background_field3.png", transparent:false, w:1280, h:720, seed:43,
    prompt:`snowy icy battlefield at night with green aurora lights, sparkling snow, pine tree silhouettes, cheerful cartoon game background, horizontal, no characters, no text, ${STYLE}` },

  // ===== UI / アイテム =====
  { file:"icon_coin.png",    transparent:true, w:768, h:768, seed:51,
    prompt:`a shiny golden coin with a cute fish engraved on it, glossy currency icon, ${ITEM}, ${STYLE}` },
  { file:"item_catfood.png", transparent:true, w:768, h:768, seed:52,
    prompt:`a colorful cat food can power-up item with a paw logo and sparkles, glossy game item, ${ITEM}, ${STYLE}` },
  { file:"icon_upgrade.png", transparent:true, w:768, h:768, seed:53,
    prompt:`a glowing upward green arrow upgrade icon with sparkles, level up symbol, ${ITEM}, ${STYLE}` },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---- Pollinations から画像取得 --------------------------------------------
async function fetchImage(asset) {
  const enc = encodeURIComponent(asset.prompt);
  const url = `https://image.pollinations.ai/prompt/${enc}` +
    `?width=${asset.w}&height=${asset.h}&seed=${asset.seed}&model=flux&nologo=true&enhance=true`;
  const res = await fetch(url, { headers: { "User-Agent": "nyanko-wars/1.0" } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const ct = res.headers.get("content-type") || "";
  if (!ct.startsWith("image/")) throw new Error(`予期しない content-type: ${ct}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 2000) throw new Error(`画像が小さすぎます (${buf.length}B)`);
  return buf;
}

// ---- 白背景の除去 (四隅からフラッドフィル) ---------------------------------
async function removeWhiteBackground(buf) {
  const img = await Jimp.read(buf);
  const { data, width, height } = img.bitmap;
  const idx = (x, y) => (y * width + x) * 4;
  const TOL = 38;          // 白からの許容距離 (低いほど厳しく削る)
  const visited = new Uint8Array(width * height);

  const isBG = (x, y) => {
    const i = idx(x, y);
    const r = data[i], g = data[i + 1], b = data[i + 2];
    // 白に近い (=明るくて彩度が低い) かを判定
    const mn = Math.min(r, g, b), mx = Math.max(r, g, b);
    return mn > 255 - TOL && (mx - mn) < 28;
  };

  const stack = [];
  const push = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const p = y * width + x;
    if (visited[p]) return;
    visited[p] = 1;
    stack.push(x, y);
  };
  // 四辺すべてを起点に
  for (let x = 0; x < width; x++) { push(x, 0); push(x, height - 1); }
  for (let y = 0; y < height; y++) { push(0, y); push(width - 1, y); }

  while (stack.length) {
    const y = stack.pop(), x = stack.pop();
    if (!isBG(x, y)) continue;
    data[idx(x, y) + 3] = 0;              // 透明化
    push(x + 1, y); push(x - 1, y); push(x, y + 1); push(x, y - 1);
  }

  // 縁のフェザリング: 透明ピクセルに隣接する明るい縁を半透明に
  const out = Buffer.from(data);
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = idx(x, y);
      if (data[i + 3] === 0) continue;
      const neighborTransparent =
        data[idx(x + 1, y) + 3] === 0 || data[idx(x - 1, y) + 3] === 0 ||
        data[idx(x, y + 1) + 3] === 0 || data[idx(x, y - 1) + 3] === 0;
      if (neighborTransparent) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        const mn = Math.min(r, g, b);
        if (mn > 215) out[i + 3] = 90;     // 白っぽい縁は薄く
      }
    }
  }
  img.bitmap.data = out;
  return await img.getBuffer("image/png");
}

// ---- 1枚処理 ---------------------------------------------------------------
async function processOne(asset, idx) {
  const outPath = path.join(OUT_DIR, asset.file);
  if (fs.existsSync(outPath) && fs.statSync(outPath).size > 3000) {
    console.log(`⏭️  [${idx + 1}/${ASSETS.length}] ${asset.file} 既存 — スキップ`);
    return "skip";
  }
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      console.log(`🎨 [${idx + 1}/${ASSETS.length}] ${asset.file} 生成中... (試行 ${attempt})`);
      const raw = await fetchImage(asset);
      let finalBuf;
      if (asset.transparent) {
        finalBuf = await removeWhiteBackground(raw);
      } else {
        finalBuf = await (await Jimp.read(raw)).getBuffer("image/png");
      }
      fs.writeFileSync(outPath, finalBuf);
      console.log(`✅ [${idx + 1}/${ASSETS.length}] ${asset.file} 完了 (${Math.round(finalBuf.length/1024)}KB)`);
      return "ok";
    } catch (err) {
      console.warn(`⚠️  ${asset.file} 失敗 (試行 ${attempt}): ${err.message}`);
      if (attempt < 3) await sleep(4000 * attempt);
      else return "fail";
    }
  }
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  console.log(`\n🐱 にゃんこ大決戦 — アセット生成開始 (${ASSETS.length} 枚 / Pollinations.ai Flux)\n`);
  const r = { ok: 0, skip: 0, fail: 0 };
  const failed = [];
  for (let i = 0; i < ASSETS.length; i++) {
    const res = await processOne(ASSETS[i], i);
    r[res]++;
    if (res === "fail") failed.push(ASSETS[i].file);
    await sleep(1500);   // レート制限対策
  }
  console.log(`\n=== 完了: 生成 ${r.ok} / スキップ ${r.skip} / 失敗 ${r.fail} ===`);
  if (failed.length) {
    console.log("失敗 (再実行で再試行):");
    failed.forEach((f) => console.log("  - " + f));
    process.exit(1);
  }
  console.log("🎉 すべてのアセットが揃いました！\n");
}

main().catch((e) => { console.error("致命的エラー:", e); process.exit(1); });
