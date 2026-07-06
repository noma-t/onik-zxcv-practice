// レッスンごとの練習データ
// 各レッスンの sentences は、そのレッスンまでに解禁された文字だけで
// 書けるように選んだ単語/文章です(数字・記号レッスンを除く)。

const LESSONS = [
  {
    title: "ホーム段",
    description: "まずはホームポジション(A S D F G H J K L ; ')に慣れましょう。",
    newKeys: ["KeyA", "KeyS", "KeyD", "KeyF", "KeyG", "KeyH", "KeyJ", "KeyK", "KeyL", "Semicolon", "Quote"],
    sentences: [
      "the man ate a hot meat at nine then he sat at a gate again",
      "a stage magnet stagnates in stone as the meat sits at ease",
      "amnesia anemia stamina engine gnome insane means she ate a hot ham",
      "hot seat mason gets high esteem again as he ate a hot meat at noon",
    ],
  },
  {
    title: "上段",
    description: "上段(Q W E R T Y U I O P [ ] \\)を追加します。",
    newKeys: ["KeyQ", "KeyW", "KeyE", "KeyR", "KeyT", "KeyY", "KeyU", "KeyI", "KeyO", "KeyP", "BracketLeft", "BracketRight", "Backslash"],
    sentences: [
      "your purple paper plane soars away past a low grey bay",
      "a regular language is a story worth telling to many people this summer",
      "outgoing people request a proper output while learning a strong new language",
      "a pleasant morning brings gentle energy to a quiet room upstairs",
    ],
  },
  {
    title: "下段",
    description: "下段(Z X C V B N M , . /)を追加すると、全アルファベットが揃います。",
    newKeys: ["KeyZ", "KeyX", "KeyC", "KeyV", "KeyB", "KeyN", "KeyM", "Comma", "Period", "Slash"],
    sentences: [
      "The quick brown fox jumps over the lazy dog while a bright moon rises above the quiet farm",
      "Pack my box with five dozen liquor jugs before the next crazy delivery truck arrives",
      "How vexingly quick daft zebras jump when a sudden storm begins to roll across the valley",
      "Waltz bad nymph for quick jigs vex the judge who now writes a lengthy verdict",
    ],
  },
  {
    title: "数字と記号",
    description: "数字行と、位置が変わった記号(¥ < > ? ; ' [ ] など)を練習します。",
    newKeys: ["Backquote", "Digit1", "Digit2", "Digit3", "Digit4", "Digit5", "Digit6", "Digit7", "Digit8", "Digit9", "Digit0", "Minus", "Equal"],
    sentences: [
      "It's 9:30, and I can't wait - let's go grab a coffee before the 10:00 meeting starts!",
      "Meeting @ 3:15pm - bring [the] report & sign here before 5pm, or we'll have to reschedule it!",
      "Price: $12.50 (50% off) - don't miss it, because the sale ends at midnight & stock is very limited!",
      "Q&A: What's 7*8? It's 56, of course! Next question: what's 9-4, and can you solve it quickly?",
    ],
  },
  {
    title: "総合練習",
    description: "全てのキーを使った長めの文章で仕上げましょう。",
    newKeys: [],
    sentences: [
      "Typing quickly and accurately takes practice, patience, and a bit of daily repetition; the more you type, the more natural it becomes, until your fingers move almost without thinking.",
      "A good keyboard layout reduces finger travel, balances the load between hands, and feels comfortable over long sessions, especially when you spend many hours writing code, chatting with friends, or drafting long emails every single day.",
      "Once your fingers remember where each letter lives, you won't need to look at the keys anymore, and typing will start to feel less like a chore and more like a natural extension of your own thoughts.",
      "Consistent practice, even for just ten or fifteen minutes a day, builds muscle memory far more effectively than one long, exhausting session every now and then.",
    ],
  },
];
