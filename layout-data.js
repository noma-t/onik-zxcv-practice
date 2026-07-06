// onik-zxcv 配列データ
// 配列.webp を基に作成。ユーザーの物理キーボードは US QWERTY(見た目はそのまま)だが、
// OSレベルのキーリマップにより、キーを押すと onik-zxcv の文字が入力される想定。
// そのため KeyboardEvent.code (物理キー位置。レイアウトの影響を受けない) でキーを特定し、
// KeyboardEvent.key (実際に入力される文字。既に onik-zxcv 変換済み) で入力内容を判定する。

// 各キー: { code, base, shift, qwerty, w(幅・1u単位), finger }
// base   = 未シフト時に入力される文字
// shift  = Shift押下時に入力される文字
// qwerty = 参考として表示する元のQWERTY配列での文字(小さく表示)
// special = ラベル表示用の特殊キー名(Tab, Enter など。base/shiftは使わない)
// finger = 担当指(物理キー位置ベースの標準的なタッチタイピング運指)
//          l/r = 左/右手、pinky/ring/middle/index/thumb = 小指/薬指/中指/人差し指/親指

const KEYBOARD_ROWS = [
  // 数字行
  [
    { code: "Backquote", base: "`", shift: "~", qwerty: "`", w: 1, finger: "l-pinky" },
    { code: "Digit1", base: "1", shift: "!", qwerty: "1", w: 1, finger: "l-pinky" },
    { code: "Digit2", base: "2", shift: "@", qwerty: "2", w: 1, finger: "l-ring" },
    { code: "Digit3", base: "3", shift: "#", qwerty: "3", w: 1, finger: "l-middle" },
    { code: "Digit4", base: "4", shift: "$", qwerty: "4", w: 1, finger: "l-index" },
    { code: "Digit5", base: "5", shift: "%", qwerty: "5", w: 1, finger: "l-index" },
    { code: "Digit6", base: "6", shift: "^", qwerty: "6", w: 1, finger: "r-index" },
    { code: "Digit7", base: "7", shift: "&", qwerty: "7", w: 1, finger: "r-index" },
    { code: "Digit8", base: "8", shift: "*", qwerty: "8", w: 1, finger: "r-index" },
    { code: "Digit9", base: "9", shift: "(", qwerty: "9", w: 1, finger: "r-middle" },
    { code: "Digit0", base: "0", shift: ")", qwerty: "0", w: 1, finger: "r-ring" },
    { code: "Minus", base: "[", shift: "{", qwerty: "-", w: 1, finger: "r-pinky" },
    { code: "Equal", base: "]", shift: "}", qwerty: "=", w: 1, finger: "r-pinky" },
    { code: "Backspace", special: "⌫", w: 2 },
  ],
  // 上段 (QWERTY行)
  [
    { code: "Tab", special: "Tab", w: 1.5 },
    { code: "KeyQ", base: "q", shift: "Q", qwerty: "q", w: 1, finger: "l-pinky" },
    { code: "KeyW", base: "l", shift: "L", qwerty: "w", w: 1, finger: "l-ring" },
    { code: "KeyE", base: "r", shift: "R", qwerty: "e", w: 1, finger: "l-middle" },
    { code: "KeyR", base: "y", shift: "Y", qwerty: "r", w: 1, finger: "l-index" },
    { code: "KeyT", base: "w", shift: "W", qwerty: "t", w: 1, finger: "l-index" },
    { code: "KeyY", base: "=", shift: "+", qwerty: "y", w: 1, finger: "r-index" },
    { code: "KeyU", base: "p", shift: "P", qwerty: "u", w: 1, finger: "r-index" },
    { code: "KeyI", base: "b", shift: "B", qwerty: "i", w: 1, finger: "r-index" },
    { code: "KeyO", base: "u", shift: "U", qwerty: "o", w: 1, finger: "r-middle" },
    { code: "KeyP", base: ",", shift: "<", qwerty: "p", w: 1, finger: "r-ring" },
    { code: "BracketLeft", base: ".", shift: ">", qwerty: "[", w: 1, finger: "r-pinky" },
    { code: "BracketRight", base: "/", shift: "?", qwerty: "]", w: 1, finger: "r-pinky" },
    { code: "Backslash", base: "¥", shift: "|", qwerty: "\\", w: 1.5, finger: "r-pinky" },
  ],
  // ホーム段
  [
    { code: "CapsLock", special: "Caps", w: 1.75 },
    { code: "KeyA", base: "a", shift: "A", qwerty: "a", w: 1, finger: "l-pinky" },
    { code: "KeyS", base: "h", shift: "H", qwerty: "s", w: 1, finger: "l-ring" },
    { code: "KeyD", base: "n", shift: "N", qwerty: "d", w: 1, finger: "l-middle" },
    { code: "KeyF", base: "s", shift: "S", qwerty: "f", w: 1, homing: true, finger: "l-index" },
    { code: "KeyG", base: "m", shift: "M", qwerty: "g", w: 1, finger: "l-index" },
    { code: "KeyH", base: ";", shift: ":", qwerty: "h", w: 1, finger: "r-index" },
    { code: "KeyJ", base: "g", shift: "G", qwerty: "j", w: 1, homing: true, finger: "r-index" },
    { code: "KeyK", base: "t", shift: "T", qwerty: "k", w: 1, finger: "r-index" },
    { code: "KeyL", base: "e", shift: "E", qwerty: "l", w: 1, finger: "r-middle" },
    { code: "Semicolon", base: "i", shift: "I", qwerty: ";", w: 1, finger: "r-ring" },
    { code: "Quote", base: "o", shift: "O", qwerty: "'", w: 1, finger: "r-pinky" },
    { code: "Enter", special: "Enter", w: 2.25, finger: "r-pinky" },
  ],
  // 下段
  [
    { code: "ShiftLeft", special: "Shift", w: 2.25, finger: "l-pinky" },
    { code: "KeyZ", base: "z", shift: "Z", qwerty: "z", w: 1, finger: "l-pinky" },
    { code: "KeyX", base: "x", shift: "X", qwerty: "x", w: 1, finger: "l-ring" },
    { code: "KeyC", base: "c", shift: "C", qwerty: "c", w: 1, finger: "l-middle" },
    { code: "KeyV", base: "v", shift: "V", qwerty: "v", w: 1, finger: "l-index" },
    { code: "KeyB", base: "f", shift: "F", qwerty: "b", w: 1, finger: "l-index" },
    { code: "KeyN", base: "'", shift: '"', qwerty: "n", w: 1, finger: "r-index" },
    { code: "KeyM", base: "k", shift: "K", qwerty: "m", w: 1, finger: "r-index" },
    { code: "Comma", base: "d", shift: "D", qwerty: ",", w: 1, finger: "r-index" },
    { code: "Period", base: "-", shift: "_", qwerty: ".", w: 1, finger: "r-middle" },
    { code: "Slash", base: "j", shift: "J", qwerty: "/", w: 1, finger: "r-ring" },
    { code: "ShiftRight", special: "Shift", w: 2.75, finger: "r-pinky" },
  ],
  // 最下段
  [
    { code: "ControlLeft", special: "Ctrl", w: 1.25 },
    { code: "MetaLeft", special: "Win", w: 1.25 },
    { code: "AltLeft", special: "Alt", w: 1.25 },
    { code: "Space", base: " ", shift: " ", w: 6.25, finger: "r-thumb" },
    { code: "AltRight", special: "Alt", w: 1.25 },
    { code: "MetaRight", special: "Win", w: 1.25 },
    { code: "ControlRight", special: "Ctrl", w: 1.25 },
  ],
];

// code -> キー定義 の索引
const KEY_BY_CODE = {};
for (const row of KEYBOARD_ROWS) {
  for (const key of row) {
    KEY_BY_CODE[key.code] = key;
  }
}
