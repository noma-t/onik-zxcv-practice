// onik-zxcv 練習アプリ本体
//
// 通常モード: ひらがなのフレーズをローマ字で入力する(変換なし)。
// フローモード: 流れてくるキーを、順番を気にせず入力する。

const DEFAULT_LENGTH = 8;

const state = {
  mode: "sentence", // "sentence" | "flow"
  length: DEFAULT_LENGTH,
  options: { alpha: true, num: false, sym: false },
  text: "",
  units: [],
  unitIndex: 0,
  buffer: "",
  hintsHidden: false,
  lockMode: false,
  keyHighlight: false,
};

const CHAR_TO_KEY = buildCharToKeyMap();

function buildCharToKeyMap() {
  const map = {};
  for (const code in KEY_BY_CODE) {
    const key = KEY_BY_CODE[code];
    if (key.special !== undefined) continue;
    if (key.base !== undefined && !(key.base in map)) {
      map[key.base] = { code, shift: false };
    }
    if (key.shift !== undefined && !(key.shift in map)) {
      map[key.shift] = { code, shift: true };
    }
  }
  return map;
}

const LETTERS_LOWER = [..."abcdefghijklmnopqrstuvwxyz"];
const DIGITS = [..."0123456789"];
const SYMBOLS = Object.keys(CHAR_TO_KEY).filter((ch) => !/[0-9A-Za-z ]/.test(ch));

function randomPick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

// ---------- キーボード描画 ----------

const keyboardEl = document.getElementById("keyboard");
const keyElByCode = {};

// 押しても入力に意味のないキー(枠は残し、ラベル文字だけ非表示にする)
const HIDDEN_CODES = new Set([
  "Backspace", "Tab", "CapsLock", "Enter",
  "ControlLeft", "ControlRight",
  "MetaLeft", "MetaRight",
  "AltLeft", "AltRight",
]);

function buildKeyboard() {
  keyboardEl.innerHTML = "";
  for (const row of KEYBOARD_ROWS) {
    const rowEl = document.createElement("div");
    rowEl.className = "kb-row";
    for (const key of row) {
      const keyEl = document.createElement("div");
      keyEl.className = "key";
      keyEl.style.flexGrow = key.w;
      keyEl.dataset.code = key.code;

      if (HIDDEN_CODES.has(key.code)) {
        keyEl.classList.add("key-hidden");
      }

      if (key.special !== undefined) {
        keyEl.classList.add("key-special");
        const label = document.createElement("span");
        label.className = "key-special-label";
        if (key.special === "Shift") label.classList.add("key-shift-label");
        label.textContent = key.special;
        keyEl.appendChild(label);
      } else {
        if (key.shift && key.shift !== key.base.toUpperCase()) {
          const shiftEl = document.createElement("span");
          shiftEl.className = "key-shift";
          shiftEl.textContent = key.shift;
          keyEl.appendChild(shiftEl);
        }
        const baseEl = document.createElement("span");
        baseEl.className = "key-base";
        baseEl.textContent = key.base === " " ? "" : key.base.toUpperCase();
        keyEl.appendChild(baseEl);

        if (key.homing) {
          const dot = document.createElement("span");
          dot.className = "key-homing-dot";
          keyEl.appendChild(dot);
        }
      }

      keyElByCode[key.code] = keyEl;
      rowEl.appendChild(keyEl);
    }
    keyboardEl.appendChild(rowEl);
  }
}

// ---------- 指ガイド描画 ----------

const FINGER_ORDER = [
  "l-pinky", "l-ring", "l-middle", "l-index", "l-thumb",
  "r-thumb", "r-index", "r-middle", "r-ring", "r-pinky",
];

const fingersEl = document.getElementById("fingers");
const fingerElByName = {};

function buildFingers() {
  fingersEl.innerHTML = "";
  for (const name of FINGER_ORDER) {
    const el = document.createElement("div");
    el.className = `finger finger-${name}`;
    fingerElByName[name] = el;
    fingersEl.appendChild(el);
  }
}

// ---------- 練習テキスト生成 ----------

const MIN_PHRASE_LENGTH = Math.min(...PHRASES.map((p) => [...p].length));

function randomString(chars, length) {
  let out = "";
  for (let i = 0; i < length; i++) out += randomPick(chars);
  return out;
}

// 指定の文字数になるまで、有効なカテゴリのかたまりをランダムに並べる。
// アルファベット = ひらがなフレーズ(ローマ字入力)。ひらがなは短い残りには収まらないことがある。
function generateText() {
  const { alpha, num, sym } = state.options;
  const makers = [];
  if (alpha) {
    makers.push({
      min: MIN_PHRASE_LENGTH,
      make: (rest) => randomPick(PHRASES.filter((p) => [...p].length <= rest)),
    });
  }
  if (num) makers.push({ min: 1, make: (rest) => randomString(DIGITS, Math.min(rest, 4)) });
  if (sym) makers.push({ min: 1, make: (rest) => randomString(SYMBOLS, Math.min(rest, 3)) });

  let text = "";
  let rest = state.length;
  while (rest > 0) {
    const fit = makers.filter((m) => m.min <= rest);
    if (!fit.length) break;
    const chunk = randomPick(fit).make(rest);
    text += chunk;
    rest -= [...chunk].length;
  }
  return text;
}

// ---------- かな -> 入力単位(ユニット) ----------
//
// 1ユニット = 1回の「かな入力」(例: し = si/shi、きゃ = kya)。
// cands にはそのユニットを入力できるローマ字の候補をすべて持たせ、どれで打っても進める。

function buildUnits(text) {
  const chars = [...text];
  const units = [];
  let pendingSokuon = false;

  const flushSokuon = () => {
    units.push({ display: "っ", cands: ["xtu", "ltu"] });
    pendingSokuon = false;
  };

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    if (ch === "っ") {
      if (pendingSokuon) flushSokuon();
      pendingSokuon = true;
      continue;
    }

    let unit;
    const pair = ch + (chars[i + 1] ?? "");
    if (ROMAJI_DIGRAPHS[pair]) {
      unit = { display: pair, cands: ROMAJI_DIGRAPHS[pair] };
      i++;
    } else if (ch === "ん") {
      unit = { display: ch, cands: null }; // 次のユニット次第なので後で決める
    } else if (ROMAJI[ch]) {
      unit = { display: ch, cands: ROMAJI[ch] };
    } else {
      unit = { display: ch, cands: [ch], literal: true };
    }

    if (pendingSokuon) {
      if (unit.literal || unit.cands === null) {
        flushSokuon();
      } else {
        // 子音を重ねる(tta)か、xtu/ltu を別打ちする
        unit.cands = unit.cands.flatMap((c) => [c[0] + c, "xtu" + c, "ltu" + c]);
        unit.display = "っ" + unit.display;
        pendingSokuon = false;
      }
    }
    units.push(unit);
  }
  if (pendingSokuon) flushSokuon();

  // 「ん」: 次が子音のときだけ n 1回でもよい。それ以外は nn
  units.forEach((unit, i) => {
    if (unit.cands !== null) return;
    const next = units[i + 1];
    const nextIsConsonant = next && !next.literal && next.cands.every((c) => !"aiueony".includes(c[0]));
    unit.cands = nextIsConsonant ? ["nn", "n"] : ["nn"];
  });

  return units;
}

// ---------- 練習エリア描画 ----------

const modeDescEl = document.getElementById("mode-desc");
const sentenceWrapEl = document.getElementById("sentence-wrap");
const sentenceEl = document.getElementById("sentence");
const lockIndicatorEl = document.getElementById("lock-indicator");
const flowWrapEl = document.getElementById("flow-wrap");
const flowLaneEl = document.getElementById("flow-lane");
const flowStatsEl = document.getElementById("flow-stats");
const optionInputs = {
  alpha: document.getElementById("opt-alpha"),
  num: document.getElementById("opt-num"),
  sym: document.getElementById("opt-sym"),
};
const OPTION_NAMES = ["alpha", "num", "sym"];
const lengthLabelEl = document.getElementById("opt-length-label");
const lengthSelectEl = document.getElementById("opt-length");
const modeButtons = document.querySelectorAll(".mode-btn");

const MODE_DESCRIPTIONS = {
  sentence: "ひらがなをローマ字で入力します(変換は不要)。",
  flow: "ランダムに並んだキーを、左から順に入力します。",
};

function toggleHints() {
  state.hintsHidden = !state.hintsHidden;
  keyboardEl.classList.toggle("hints-hidden", state.hintsHidden);
  fingersEl.classList.toggle("hints-hidden", state.hintsHidden);
  syncModeQueryParams();
}

function toggleLockMode() {
  state.lockMode = !state.lockMode;
  lockIndicatorEl.classList.toggle("is-visible", state.lockMode);
  syncModeQueryParams();
}

function toggleKeyHighlight() {
  state.keyHighlight = !state.keyHighlight;
  highlightNextKey();
  syncModeQueryParams();
}

// ---------- 設定のURLクエリ同期 ----------
//
// モードとオプションをクエリパラメータに反映し、リロードしても状態が保持されるようにする。
//   blur=1 / lock=1 / hl=1 / len=8 / alpha=0 / num=1 / sym=1 / mode=flow

function syncModeQueryParams() {
  const params = new URLSearchParams(location.search);
  const setFlag = (name, on) => (on ? params.set(name, "1") : params.delete(name));
  setFlag("blur", state.hintsHidden);
  setFlag("lock", state.lockMode);
  setFlag("hl", state.keyHighlight);
  if (state.options.alpha) params.delete("alpha");
  else params.set("alpha", "0");
  setFlag("num", state.options.num);
  setFlag("sym", state.options.sym);
  if (state.length !== DEFAULT_LENGTH) params.set("len", state.length);
  else params.delete("len");
  if (state.mode === "flow") params.set("mode", "flow");
  else params.delete("mode");

  const query = params.toString();
  const newUrl = `${location.pathname}${query ? `?${query}` : ""}${location.hash}`;
  history.replaceState(null, "", newUrl);
}

function applyModeQueryParams() {
  const params = new URLSearchParams(location.search);
  if (params.get("blur") === "1") {
    state.hintsHidden = true;
    keyboardEl.classList.add("hints-hidden");
    fingersEl.classList.add("hints-hidden");
  }
  if (params.get("lock") === "1") {
    state.lockMode = true;
    lockIndicatorEl.classList.add("is-visible");
  }
  if (params.get("hl") === "1") state.keyHighlight = true;
  for (const name of OPTION_NAMES) {
    state.options[name] = name === "alpha" ? params.get(name) !== "0" : params.get(name) === "1";
    optionInputs[name].checked = state.options[name];
  }
  if (params.get("mode") === "flow") state.mode = "flow";
  const length = Number(params.get("len"));
  if ([...lengthSelectEl.options].some((o) => Number(o.value) === length)) state.length = length;
  lengthSelectEl.value = String(state.length);
}

// ---------- 通常モード ----------

function currentUnit() {
  return state.units[state.unitIndex];
}

function startNewText() {
  state.text = generateText();
  startText();
}

function startText() {
  state.units = buildUnits(state.text);
  state.unitIndex = 0;
  state.buffer = "";
  renderSentence();
}

function unitHint(unit) {
  if (unit.literal) return unit.display === " " ? "␣" : "";
  return unit.cands[0];
}

function renderSentence() {
  sentenceEl.innerHTML = "";
  state.units.forEach((unit, i) => {
    const el = document.createElement("span");
    el.className = "unit";
    if (unit.display === " ") el.classList.add("unit-space");
    if (i < state.unitIndex) el.classList.add("unit-done");
    else if (i === state.unitIndex) el.classList.add("unit-current");

    const kanaEl = document.createElement("span");
    kanaEl.className = "unit-kana";
    kanaEl.textContent = unit.display === " " ? "" : unit.display;
    el.appendChild(kanaEl);

    const romajiEl = document.createElement("span");
    romajiEl.className = "unit-romaji";
    if (i === state.unitIndex && state.buffer) {
      const cand = unit.cands.find((c) => c.startsWith(state.buffer)) ?? unit.cands[0];
      const typedEl = document.createElement("span");
      typedEl.className = "unit-typed";
      typedEl.textContent = state.buffer;
      romajiEl.appendChild(typedEl);
      romajiEl.append(cand.slice(state.buffer.length));
    } else {
      romajiEl.textContent = unitHint(unit);
    }
    el.appendChild(romajiEl);
    sentenceEl.appendChild(el);
  });
  highlightNextKey();
}

// 次に押すべき文字(現在のユニットの、入力済み部分に続く文字)
function nextExpectedChar() {
  if (state.mode === "flow") return flowKeys[0];
  const unit = currentUnit();
  if (!unit) return undefined;
  const cand = unit.cands.find((c) => c.startsWith(state.buffer) && c.length > state.buffer.length);
  return cand?.[state.buffer.length];
}

function clearNextKeyHighlight() {
  document.querySelectorAll(".key-next").forEach((el) => el.classList.remove("key-next"));
  document.querySelectorAll(".finger-active").forEach((el) => el.classList.remove("finger-active"));
}

function highlightNextKey() {
  clearNextKeyHighlight();
  if (state.keyHighlight) return;

  const ch = nextExpectedChar();
  if (ch === undefined) return;
  const target = CHAR_TO_KEY[ch];
  if (!target) return;
  const el = keyElByCode[target.code];
  if (el) el.classList.add("key-next");
  const finger = KEY_BY_CODE[target.code]?.finger;
  if (finger) fingerElByName[finger]?.classList.add("finger-active");
  if (target.shift) {
    keyElByCode["ShiftLeft"]?.classList.add("key-next");
    fingerElByName["l-pinky"]?.classList.add("finger-active");
  }
}

function flashKey(code, className) {
  const el = keyElByCode[code];
  if (!el) return;
  el.classList.add(className);
  setTimeout(() => el.classList.remove(className), 150);
}

function completeUnit() {
  state.unitIndex++;
  state.buffer = "";
}

// 現在のユニットへ1文字入力する。受理されたら true
function inputToUnit(ch) {
  const unit = currentUnit();
  const next = state.buffer + ch;
  if (unit.cands.some((c) => c.startsWith(next))) {
    state.buffer = next;
    const isExact = unit.cands.includes(next);
    const canExtend = unit.cands.some((c) => c.length > next.length && c.startsWith(next));
    if (isExact && !canExtend) completeUnit();
    return true;
  }
  // 「ん」を n 1回で確定していた場合: 続けて次のユニットの入力が始まった
  if (unit.cands.includes(state.buffer) && state.unitIndex + 1 < state.units.length) {
    completeUnit();
    return inputToUnit(ch);
  }
  return false;
}

function processTypedChar(ch, code) {
  if (state.mode === "flow") {
    processFlowChar(ch);
    return;
  }
  if (state.unitIndex >= state.units.length) return;

  const expected = nextExpectedChar();
  const accepted = inputToUnit(ch);
  renderSentence();
  if (!accepted) {
    const target = CHAR_TO_KEY[expected];
    if (target) flashKey(target.code, "key-mistake");
    return;
  }
  if (state.unitIndex >= state.units.length) onTextComplete();
}

function onTextComplete() {
  if (state.lockMode) startText();
  else startNewText();
}

// ---------- フローモード ----------
//
// 右から左へキーが流れてくる。入力した文字と同じトークンのうち、最も左(先に出たもの)を消す。
// 左端まで届いたら「逃した」。

const FLOW_VISIBLE = 14;

let flowKeys = [];
let flowTyped = 0;
let flowMissed = 0;

function randomFlowChar() {
  const { alpha, num, sym } = state.options;
  const categories = [];
  if (alpha) categories.push(LETTERS_LOWER);
  if (num) categories.push(DIGITS);
  if (sym) categories.push(SYMBOLS);
  return randomPick(randomPick(categories));
}

function renderFlow() {
  while (flowKeys.length < FLOW_VISIBLE) flowKeys.push(randomFlowChar());
  flowLaneEl.innerHTML = "";
  flowKeys.forEach((ch, i) => {
    const el = document.createElement("span");
    el.className = "flow-token";
    if (i === 0) el.classList.add("flow-token-current");
    el.textContent = ch;
    flowLaneEl.appendChild(el);
  });
  flowStatsEl.textContent = `入力: ${flowTyped} ／ ミス: ${flowMissed}`;
  highlightNextKey();
}

function resetFlow() {
  flowKeys = [];
  flowTyped = 0;
  flowMissed = 0;
  renderFlow();
}

function processFlowChar(ch) {
  if (ch === flowKeys[0]) {
    flowKeys.shift();
    flowTyped++;
  } else {
    flowMissed++;
    const target = CHAR_TO_KEY[flowKeys[0]];
    if (target) flashKey(target.code, "key-mistake");
  }
  renderFlow();
}

// ---------- モード・オプション切り替え ----------

function applyMode() {
  const isFlow = state.mode === "flow";
  sentenceWrapEl.hidden = isFlow;
  flowWrapEl.hidden = !isFlow;
  modeDescEl.textContent = MODE_DESCRIPTIONS[state.mode];
  modeButtons.forEach((btn) => btn.classList.toggle("active", btn.dataset.mode === state.mode));

  lengthLabelEl.hidden = isFlow;
  if (isFlow) resetFlow();
  else startNewText();
}

for (const name of OPTION_NAMES) {
  optionInputs[name].addEventListener("change", (e) => {
    // 少なくとも1つは練習対象にしておく
    if (!e.target.checked && !OPTION_NAMES.some((n) => n !== name && state.options[n])) {
      e.target.checked = true;
    }
    state.options[name] = e.target.checked;
    e.target.blur(); // Space で再トグルされないようにする
    syncModeQueryParams();
    applyMode();
  });
}

lengthSelectEl.addEventListener("change", (e) => {
  state.length = Number(e.target.value);
  e.target.blur();
  syncModeQueryParams();
  startNewText();
});

modeButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    btn.blur();
    if (state.mode === btn.dataset.mode) return;
    state.mode = btn.dataset.mode;
    syncModeQueryParams();
    applyMode();
  });
});

// ---------- キー入力ハンドリング ----------
//
// 正誤判定には KeyboardEvent.key(ブラウザ/OSが変換した文字)を使わず、
// KeyboardEvent.code(物理キー位置。レイアウトの影響を受けない)と Shift の押下状態から
// layout-data.js の対応表を使って自前で入力文字を算出する。
// OSレベルのキーリマップが有効かどうかに関わらず、物理キーの位置だけで正誤判定できるようにするため。

document.addEventListener("keydown", (e) => {
  const keyDef = KEY_BY_CODE[e.code];

  if (e.code === "Backspace") {
    e.preventDefault();
    if (!e.repeat) toggleHints();
    return;
  }

  if (e.code === "ControlRight") {
    e.preventDefault();
    if (!e.repeat) toggleLockMode();
    return;
  }

  if (!e.repeat && keyDef && (!keyDef.special || keyDef.special === "Shift")) {
    const el = keyElByCode[e.code];
    if (el) el.classList.add("key-pressed");
  }

  if (e.ctrlKey || e.metaKey || e.altKey) return;

  if (e.code === "Enter") {
    e.preventDefault();
    if (!e.repeat) toggleKeyHighlight();
    return;
  }

  if (keyDef && keyDef.special === undefined) {
    e.preventDefault();
    if (e.repeat) return;
    const ch = e.shiftKey ? keyDef.shift : keyDef.base;
    if (ch !== undefined) processTypedChar(ch, e.code);
  }
});

document.addEventListener("keyup", (e) => {
  const el = keyElByCode[e.code];
  if (el) el.classList.remove("key-pressed");
});

// ---------- 初期化 ----------

buildKeyboard();
buildFingers();
applyModeQueryParams();
applyMode();
