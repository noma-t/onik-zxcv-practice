# CLAUDE.md

静的HTML/CSS/JSのタイピング練習アプリ(ビルドツール・依存パッケージなし)。

## アーキテクチャ

- `layout-data.js` - `KEYBOARD_ROWS`/`KEY_BY_CODE`(物理キー位置ごとのonik-zxcv配列定義)
- `lessons-data.js` - `LESSONS`配列(各レッスンのtitle/description/newKeys/sentences)
- `app.js` - 描画・状態・入力処理すべてを含む本体
- 正誤判定は`KeyboardEvent.key`ではなく`KeyboardEvent.code`(物理キー位置)を使う。OSレベルのキーリマップの影響を受けないようにするため
- レッスンは`#/lessons/N`のハッシュルーティングでURLを分けている(`index.html`は1つのまま)。ページ内リンクは意図的に`<button>` + `location.hash`書き換えで実装している(下記フォントの注意点を参照)

## 注意点・ハマりどころ

- `<button>`と`<a>`はブラウザデフォルトフォントが異なる(buttonはOS UIフォント、aは`body`の`font-family`スタックを継承)。日本語フォントを含むスタックだと、要素を入れ替えるだけで文字の太さ/フォントが目に見えて変わることがある
- ローカル検証でこの環境の`python`はStore版スタブで動かない。Node.jsで簡易HTTPサーバーを立てる(`node -e "..."`でhttp.createServerを書く)
- `claude-in-chrome`の`navigate`は`file://`URLを拒否する。上記のローカルサーバー経由でアクセスすること
- バックグラウンドで起動したNodeサーバーの停止は`PowerShell`ツールを直接使う(`Bash`経由で`powershell.exe`を呼ぶと`$_`のクォート展開が壊れて失敗する):
  ```powershell
  Get-NetTCPConnection -LocalPort <port> | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { Stop-Process -Id $_ -Force }
  ```
