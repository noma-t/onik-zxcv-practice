# CLAUDE.md

静的HTML/CSS/JSのタイピング練習アプリ(ビルドツール・依存パッケージなし)。

## アーキテクチャ

- `layout-data.js` - `KEYBOARD_ROWS`/`KEY_BY_CODE`(物理キー位置ごとのonik-zxcv配列定義)
- `practice-data.js` - `PHRASES`(問題文。`{漢字|よみ}`で読みを指定、カタカナはそのまま読む。`parsePhrase`参照)、かな→ローマ字候補表`ROMAJI`/`ROMAJI_DIGRAPHS`
- `app.js` - 描画・状態・入力処理すべてを含む本体
- 正誤判定は`KeyboardEvent.key`ではなく`KeyboardEvent.code`(物理キー位置)を使う。OSレベルのキーリマップの影響を受けないようにするため
- 段ごとのレッスンはなく総合練習1本。「アルファベット/数字/記号を練習する」の練習対象オプション(練習画面上部。アルファベット=ひらがなのローマ字入力でアルファベットキーを練習。初期オン、1つ以上必須。数字だけ・記号だけも可)と、通常モード(寿司打風に問題文・読み・ローマ字の3段表示。読みをローマ字入力、変換なし。文字数は読みで数える)/フローモード(ランダムに並んだキーを左から順に入力。流れない)。最初にメニュー画面で通常(簡単2〜7/普通5〜10/長い9〜14文字の範囲。打ち終えると次の問題)かフローを選ぶ。練習対象は`?alpha=0&num=1&sym=1`などクエリで保持する(難易度・モードは保持しない)
- ローマ字入力は1かな=1ユニットで複数候補(si/shi、tta/xtu+ta、ん=nn/n)を受理する。`buildUnits`参照

## 注意点・ハマりどころ

- `<button>`と`<a>`はブラウザデフォルトフォントが異なる(buttonはOS UIフォント、aは`body`の`font-family`スタックを継承)。日本語フォントを含むスタックだと、要素を入れ替えるだけで文字の太さ/フォントが目に見えて変わることがある
- ローカル検証でこの環境の`python`はStore版スタブで動かない。Node.jsで簡易HTTPサーバーを立てる(`node -e "..."`でhttp.createServerを書く)
- `claude-in-chrome`の`navigate`は`file://`URLを拒否する。上記のローカルサーバー経由でアクセスすること
- バックグラウンドで起動したNodeサーバーの停止は`PowerShell`ツールを直接使う(`Bash`経由で`powershell.exe`を呼ぶと`$_`のクォート展開が壊れて失敗する):
  ```powershell
  Get-NetTCPConnection -LocalPort <port> | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { Stop-Process -Id $_ -Force }
  ```
