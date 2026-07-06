// レッスンごとの練習データ
// 各レッスンの sentences は、そのレッスンまでに解禁された文字だけで
// 書けるように選んだ単語/文章です(数字・記号レッスンを除く)。

const LESSONS = [
  {
    title: "ホーム段",
    description: "まずはホームポジション(A S D F G H J K L ; ')に慣れましょう。",
    newKeys: ["KeyA", "KeyS", "KeyD", "KeyF", "KeyG", "KeyH", "KeyJ", "KeyK", "KeyL", "Semicolon", "Quote"],
    sentences: [
      "the man ate a hot meat at nine",
      "a stage magnet stagnates in stone",
      "amnesia anemia stamina engine gnome insane",
      "hot seat mason gets high esteem again",
    ],
  },
  {
    title: "上段",
    description: "上段(Q W E R T Y U I O P [ ] \\)を追加します。",
    newKeys: ["KeyQ", "KeyW", "KeyE", "KeyR", "KeyT", "KeyY", "KeyU", "KeyI", "KeyO", "KeyP", "BracketLeft", "BracketRight", "Backslash"],
    sentences: [
      "your purple paper plane soars away",
      "a regular language is a story worth telling",
      "outgoing people request a proper output",
      "a pleasant morning brings gentle energy",
    ],
  },
  {
    title: "下段",
    description: "下段(Z X C V B N M , . /)を追加すると、全アルファベットが揃います。",
    newKeys: ["KeyZ", "KeyX", "KeyC", "KeyV", "KeyB", "KeyN", "KeyM", "Comma", "Period", "Slash"],
    sentences: [
      "The quick brown fox jumps over the lazy dog",
      "Pack my box with five dozen liquor jugs",
      "How vexingly quick daft zebras jump",
      "Waltz bad nymph for quick jigs vex",
    ],
  },
  {
    title: "数字と記号",
    description: "数字行と、位置が変わった記号(¥ < > ? ; ' [ ] など)を練習します。",
    newKeys: ["Backquote", "Digit1", "Digit2", "Digit3", "Digit4", "Digit5", "Digit6", "Digit7", "Digit8", "Digit9", "Digit0", "Minus", "Equal"],
    sentences: [
      "It's 9:30, and I can't wait - let's go!",
      "Meeting @ 3:15pm - bring [the] report & sign here.",
      "Price: $12.50 (50% off) - don't miss it!",
      "Q&A: What's 7*8? It's 56, of course!",
    ],
  },
  {
    title: "総合練習",
    description: "全てのキーを使った長めの文章で仕上げましょう。",
    newKeys: [],
    sentences: [
      "Typing quickly and accurately takes practice, patience, and a bit of daily repetition.",
      "A good keyboard layout reduces finger travel, balances the load between hands, and feels comfortable over long sessions.",
      "Once your fingers remember where each letter lives, you won't need to look at the keys anymore.",
    ],
  },
];
