# Implementation Notes

## 技術構成

- HTML5
- CSS3
- Vanilla JavaScript
- Python標準HTTPサーバ

外部CDN、npm、ビルド工程に依存しないため、Windows環境での起動失敗要因を減らしています。

## 保存される情報

- ツールカードの並び順
- モーション低減設定

いずれもブラウザのlocalStorageに保存します。

## 将来の接続点

`openTool()` 内の `OPEN TOOL` アクションをLaunch Bridgeへ接続します。ツール定義は `app.js` 冒頭の `tools` 配列に集約されています。
