// onik-zxcv 練習アプリ本体

const state = {
  lessonIndex: 0,
  sentenceIndex: 0,
  typedIndex: 0,
  mistakes: 0,
  startTime: null,
  cleared: LESSONS.map(() => false),
  unlocked: LESSONS.map((_, i) => i === 0),
  repeatMode: false,
  repeatTimer: null,
};

const REPEAT_MODE_DELAY_MS = 800;

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

// ---------- キーボード描画 ----------

const keyboardEl = document.getElementById("keyboard");
const keyElByCode = {};

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

      if (key.special !== undefined) {
        keyEl.classList.add("key-special");
        const label = document.createElement("span");
        label.className = "key-special-label";
        label.textContent = key.special;
        keyEl.appendChild(label);
      } else {
        if (key.qwerty) {
          const qwertyEl = document.createElement("span");
          qwertyEl.className = "key-qwerty";
          qwertyEl.textContent = key.qwerty;
          keyEl.appendChild(qwertyEl);
        }
        if (key.shift && key.shift !== key.base.toUpperCase()) {
          const shiftEl = document.createElement("span");
          shiftEl.className = "key-shift";
          shiftEl.textContent = key.shift;
          keyEl.appendChild(shiftEl);
        }
        const baseEl = document.createElement("span");
        baseEl.className = "key-base";
        baseEl.textContent = key.base === " " ? "" : key.base;
        keyEl.appendChild(baseEl);
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

// ---------- レッスンナビ描画 ----------

const lessonNavEl = document.getElementById("lesson-nav");

function buildLessonNav() {
  lessonNavEl.innerHTML = "";
  LESSONS.forEach((lesson, i) => {
    const item = document.createElement("button");
    item.className = "lesson-nav-item";
    item.textContent = `${i + 1}. ${lesson.title}`;
    item.disabled = !state.unlocked[i];
    if (i === state.lessonIndex) item.classList.add("active");
    if (state.cleared[i]) item.classList.add("cleared");
    item.addEventListener("click", () => {
      if (!state.unlocked[i]) return;
      selectLesson(i);
    });
    lessonNavEl.appendChild(item);
  });
}

function selectLesson(index) {
  state.lessonIndex = index;
  state.sentenceIndex = 0;
  buildLessonNav();
  startSentence();
}

// ---------- 練習エリア描画 ----------

const lessonTitleEl = document.getElementById("lesson-title");
const lessonDescEl = document.getElementById("lesson-desc");
const sentenceEl = document.getElementById("sentence");
const statsEl = document.getElementById("stats");
const unlockHintEl = document.getElementById("unlock-hint");
const btnPrevLesson = document.getElementById("btn-prev-lesson");
const btnRetry = document.getElementById("btn-retry");
const btnNext = document.getElementById("btn-next");
const btnRepeatMode = document.getElementById("btn-repeat-mode");

function clearRepeatTimer() {
  if (state.repeatTimer !== null) {
    clearTimeout(state.repeatTimer);
    state.repeatTimer = null;
  }
}

function goToNextSentence() {
  const lesson = currentLesson();
  state.sentenceIndex = (state.sentenceIndex + 1) % lesson.sentences.length;
  startSentence();
}

function currentLesson() {
  return LESSONS[state.lessonIndex];
}

function currentSentence() {
  return currentLesson().sentences[state.sentenceIndex];
}

function startSentence() {
  clearRepeatTimer();
  state.typedIndex = 0;
  state.mistakes = 0;
  state.startTime = null;

  const lesson = currentLesson();
  lessonTitleEl.textContent = `レッスン${state.lessonIndex + 1}: ${lesson.title}`;
  lessonDescEl.textContent = lesson.description;

  updateHighlightedKeys();
  renderSentence();
  updateStats();
  btnPrevLesson.disabled = state.lessonIndex === 0;
  btnNext.textContent = "次へ";
  btnNext.disabled = true;
}

function updateHighlightedKeys() {
  const lesson = currentLesson();
  const cumulative = new Set();
  for (let i = 0; i <= state.lessonIndex; i++) {
    for (const code of LESSONS[i].newKeys) cumulative.add(code);
  }
  const isReview = lesson.newKeys.length === 0;
  for (const code in keyElByCode) {
    const el = keyElByCode[code];
    el.classList.remove("key-dim", "key-focus");
    if (!isReview && cumulative.size > 0) {
      if (cumulative.has(code)) {
        if (lesson.newKeys.includes(code)) el.classList.add("key-focus");
      } else if (!KEY_BY_CODE[code].special && code !== "Space") {
        el.classList.add("key-dim");
      }
    }
  }
}

function renderSentence() {
  const text = currentSentence();
  sentenceEl.innerHTML = "";
  clearNextKeyHighlight();
  [...text].forEach((ch, i) => {
    const span = document.createElement("span");
    span.textContent = ch === " " ? " " : ch;
    if (i < state.typedIndex) span.className = "char-done";
    else if (i === state.typedIndex) span.className = "char-current";
    else span.className = "char-pending";
    sentenceEl.appendChild(span);
  });
  highlightNextKey();
}

function clearNextKeyHighlight() {
  document.querySelectorAll(".key-next").forEach((el) => el.classList.remove("key-next"));
  document.querySelectorAll(".finger-active").forEach((el) => el.classList.remove("finger-active"));
}

function highlightNextKey() {
  clearNextKeyHighlight();
  const text = currentSentence();
  if (state.typedIndex >= text.length) return;
  const ch = text[state.typedIndex];
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

function updateStats() {
  let speedText = "?";
  if (state.startTime && state.typedIndex > 0) {
    const elapsed = (Date.now() - state.startTime) / 1000;
    if (elapsed > 0.3) speedText = (state.typedIndex / elapsed).toFixed(1);
  }
  statsEl.textContent = `ミス${state.mistakes}回、秒${speedText}打`;
}

function flashKey(code, className) {
  const el = keyElByCode[code];
  if (!el) return;
  el.classList.add(className);
  setTimeout(() => el.classList.remove(className), 150);
}

function processTypedChar(ch) {
  const text = currentSentence();
  if (state.typedIndex >= text.length) return;

  const expected = text[state.typedIndex];
  if (ch === expected) {
    if (state.startTime === null) state.startTime = Date.now();
    state.typedIndex++;
    renderSentence();
    updateStats();
    if (state.typedIndex >= text.length) {
      onSentenceComplete();
    }
  } else {
    state.mistakes++;
    const target = CHAR_TO_KEY[expected];
    if (target) flashKey(target.code, "key-mistake");
    updateStats();
  }
}

function onSentenceComplete() {
  btnNext.disabled = false;
  const passed = state.mistakes <= 5 && (() => {
    const elapsed = (Date.now() - state.startTime) / 1000;
    return elapsed > 0 && currentSentence().length / elapsed >= 2;
  })();

  if (passed && !state.cleared[state.lessonIndex]) {
    state.cleared[state.lessonIndex] = true;
    if (state.lessonIndex + 1 < state.unlocked.length) {
      state.unlocked[state.lessonIndex + 1] = true;
    }
    buildLessonNav();
    unlockHintEl.textContent = "次のレッスンが解禁されました!";
  } else {
    unlockHintEl.textContent = "";
  }

  if (state.repeatMode) {
    clearRepeatTimer();
    state.repeatTimer = setTimeout(goToNextSentence, REPEAT_MODE_DELAY_MS);
  }
}

// ---------- キー入力ハンドリング ----------
//
// 正誤判定には KeyboardEvent.key(ブラウザ/OSが変換した文字)を使わず、
// KeyboardEvent.code(物理キー位置。レイアウトの影響を受けない)と Shift の押下状態から
// layout-data.js の対応表を使って自前で入力文字を算出する。
// OSレベルのキーリマップが有効かどうかに関わらず、物理キーの位置だけで正誤判定できるようにするため。

document.addEventListener("keydown", (e) => {
  const keyDef = KEY_BY_CODE[e.code];

  if (!e.repeat && keyDef && (!keyDef.special || keyDef.special === "Shift")) {
    const el = keyElByCode[e.code];
    if (el) el.classList.add("key-pressed");
  }

  if (e.ctrlKey || e.metaKey || e.altKey) return;

  if (e.code === "Enter") {
    e.preventDefault();
    if (!e.repeat) processTypedChar("\n");
    return;
  }

  if (keyDef && keyDef.special === undefined) {
    e.preventDefault();
    if (e.repeat) return;
    const ch = e.shiftKey ? keyDef.shift : keyDef.base;
    if (ch !== undefined) processTypedChar(ch);
  }
});

document.addEventListener("keyup", (e) => {
  const el = keyElByCode[e.code];
  if (el) el.classList.remove("key-pressed");
});

// ---------- ボタン操作 ----------

btnPrevLesson.addEventListener("click", () => {
  if (state.lessonIndex > 0) selectLesson(state.lessonIndex - 1);
});

btnRetry.addEventListener("click", () => {
  startSentence();
});

btnNext.addEventListener("click", () => {
  if (btnNext.disabled) return;
  goToNextSentence();
});

btnRepeatMode.addEventListener("click", () => {
  state.repeatMode = !state.repeatMode;
  btnRepeatMode.setAttribute("aria-pressed", String(state.repeatMode));
  if (!state.repeatMode) clearRepeatTimer();
});

// ---------- 初期化 ----------

buildKeyboard();
buildFingers();
buildLessonNav();
startSentence();
