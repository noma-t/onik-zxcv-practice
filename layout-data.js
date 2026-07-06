// onik-zxcv 配列データ
// 配列.webp を基に作成。ユーザーの物理キーボードは US QWERTY(見た目はそのまま)だが、
// OSレベルのキーリマップにより、キーを押すと onik-zxcv の文字が入力される想定。
// そのため KeyboardEvent.code (物理キー位置。レイアウトの影響を受けない) でキーを特定し、
// KeyboardEvent.key (実際に入力される文字。既に onik-zxcv 変換済み) で入力内容を判定する。

// 各キー: { code, base, shift, qwerty, w(幅・1u単位) }
// base   = 未シフト時に入力される文字
// shift  = Shift押下時に入力される文字
// qwerty = 参考として表示する元のQWERTY配列での文字(小さく表示)
// special = ラベル表示用の特殊キー名(Tab, Enter など。base/shiftは使わない)

const KEYBOARD_ROWS = [
  // 数字行
  [
    { code: "Backquote", base: "`", shift: "~", qwerty: "`", w: 1 },
    { code: "Digit1", base: "1", shift: "!", qwerty: "1", w: 1 },
    { code: "Digit2", base: "2", shift: "@", qwerty: "2", w: 1 },
    { code: "Digit3", base: "3", shift: "#", qwerty: "3", w: 1 },
    { code: "Digit4", base: "4", shift: "$", qwerty: "4", w: 1 },
    { code: "Digit5", base: "5", shift: "%", qwerty: "5", w: 1 },
    { code: "Digit6", base: "6", shift: "^", qwerty: "6", w: 1 },
    { code: "Digit7", base: "7", shift: "&", qwerty: "7", w: 1 },
    { code: "Digit8", base: "8", shift: "*", qwerty: "8", w: 1 },
    { code: "Digit9", base: "9", shift: "(", qwerty: "9", w: 1 },
    { code: "Digit0", base: "0", shift: ")", qwerty: "0", w: 1 },
    { code: "Minus", base: "[", shift: "{", qwerty: "-", w: 1 },
    { code: "Equal", base: "]", shift: "}", qwerty: "=", w: 1 },
    { code: "Backspace", special: "⌫", w: 2 },
  ],
  // 上段 (QWERTY行)
  [
    { code: "Tab", special: "Tab", w: 1.5 },
    { code: "KeyQ", base: "q", shift: "Q", qwerty: "q", w: 1 },
    { code: "KeyW", base: "l", shift: "L", qwerty: "w", w: 1 },
    { code: "KeyE", base: "r", shift: "R", qwerty: "e", w: 1 },
    { code: "KeyR", base: "y", shift: "Y", qwerty: "r", w: 1 },
    { code: "KeyT", base: "w", shift: "W", qwerty: "t", w: 1 },
    { code: "KeyY", base: "=", shift: "+", qwerty: "y", w: 1 },
    { code: "KeyU", base: "p", shift: "P", qwerty: "u", w: 1 },
    { code: "KeyI", base: "b", shift: "B", qwerty: "i", w: 1 },
    { code: "KeyO", base: "u", shift: "U", qwerty: "o", w: 1 },
    { code: "KeyP", base: ",", shift: "<", qwerty: "p", w: 1 },
    { code: "BracketLeft", base: ".", shift: ">", qwerty: "[", w: 1 },
    { code: "BracketRight", base: "/", shift: "?", qwerty: "]", w: 1 },
    { code: "Backslash", base: "¥", shift: "|", qwerty: "\\", w: 1.5 },
  ],
  // ホーム段
  [
    { code: "CapsLock", special: "Caps", w: 1.75 },
    { code: "KeyA", base: "a", shift: "A", qwerty: "a", w: 1 },
    { code: "KeyS", base: "h", shift: "H", qwerty: "s", w: 1 },
    { code: "KeyD", base: "n", shift: "N", qwerty: "d", w: 1 },
    { code: "KeyF", base: "s", shift: "S", qwerty: "f", w: 1, homing: true },
    { code: "KeyG", base: "m", shift: "M", qwerty: "g", w: 1 },
    { code: "KeyH", base: ";", shift: ":", qwerty: "h", w: 1 },
    { code: "KeyJ", base: "g", shift: "G", qwerty: "j", w: 1, homing: true },
    { code: "KeyK", base: "t", shift: "T", qwerty: "k", w: 1 },
    { code: "KeyL", base: "e", shift: "E", qwerty: "l", w: 1 },
    { code: "Semicolon", base: "i", shift: "I", qwerty: ";", w: 1 },
    { code: "Quote", base: "o", shift: "O", qwerty: "'", w: 1 },
    { code: "Enter", special: "Enter", w: 2.25 },
  ],
  // 下段
  [
    { code: "ShiftLeft", special: "Shift", w: 2.25 },
    { code: "KeyZ", base: "z", shift: "Z", qwerty: "z", w: 1 },
    { code: "KeyX", base: "x", shift: "X", qwerty: "x", w: 1 },
    { code: "KeyC", base: "c", shift: "C", qwerty: "c", w: 1 },
    { code: "KeyV", base: "v", shift: "V", qwerty: "v", w: 1 },
    { code: "KeyB", base: "f", shift: "F", qwerty: "b", w: 1 },
    { code: "KeyN", base: "'", shift: '"', qwerty: "n", w: 1 },
    { code: "KeyM", base: "k", shift: "K", qwerty: "m", w: 1 },
    { code: "Comma", base: "d", shift: "D", qwerty: ",", w: 1 },
    { code: "Period", base: "-", shift: "_", qwerty: ".", w: 1 },
    { code: "Slash", base: "j", shift: "J", qwerty: "/", w: 1 },
    { code: "ShiftRight", special: "Shift", w: 2.75 },
  ],
  // 最下段
  [
    { code: "ControlLeft", special: "Ctrl", w: 1.25 },
    { code: "MetaLeft", special: "Win", w: 1.25 },
    { code: "AltLeft", special: "Alt", w: 1.25 },
    { code: "Space", base: " ", shift: " ", w: 6.25 },
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
