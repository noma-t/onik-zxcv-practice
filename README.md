# onik-zxcv-practice

onik-zxcvの配列を練習するための静的Webアプリケーション

参考: [Colemakや大西配列を凌ぐ日英両立配列ができたので比較する(note)](https://note.com/oidy/n/n80f31fe43b98#85b574f1-bf45-4b55-a72f-6d88cb0705b5)

![onik-zxcv配列](https://assets.st-note.com/img/1699152364099-KDqUiHhgi8.png?width=2000&height=2000&fit=bounds&quality=85)

## これは何か

キーボードの配列(OSレベルのキーリマップ)が既に onik-zxcv になっている人向けの、タッチタイピング練習ページです。

- キーボード配列図(物理キーの位置に、そのキーを押すと入力される文字を表示)
- 現在押されているキーのハイライト表示
- 例文を使ったレッスン形式の練習(ホーム段 → 上段 → 下段 → 数字/記号 → 総合練習)
- ミス回数・打鍵速度の計測と、次のレッスンの解禁

ビルド不要の素のHTML/CSS/JavaScriptで作られており、`index.html` を開くだけで動作します。

## 使い方

ローカルで試す場合は、このディレクトリで簡易サーバーを立てて開いてください(`file://` で直接開くとブラウザによっては動作しないため)。

```sh
python -m http.server 8000
# http://localhost:8000/ をブラウザで開く
```

## GitHub Pagesでの公開

このリポジトリの Settings → Pages で、Source を「Deploy from a branch」、Branch を `main` / `/(root)` に設定すると、`index.html` がそのまま公開されます。追加のビルド手順は不要です。
