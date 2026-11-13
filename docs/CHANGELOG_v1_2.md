# Changelog v1.2

## Visual identity

- 日本語ヒーロー見出しを二段構成へ変更。
- インクの欠け、版ずれ、紙への刷り込みをCSSで再現。
- 英字見出し、ラベル、スタンプの書体ルールを統一。
- オリジナルの研究者ステンシルSVGを2点追加。
- QUICK LAUNCH、ツールカード、詳細ドロワーへテープ表現を追加。
- 承認コンセプトに合わせてワイド画面の比率と密度を再調整。

## Interaction fixes

- `html[data-density]`と設定ボタンの`data-density`が競合し、通常クリックを設定変更として処理する問題を修正。
- 設定変更は`button[data-density]`と`button[data-accent]`に限定。
- Home、Tools、Project Atlas、Notes、Settingsのナビゲーションを回帰確認。
- ツール詳細ドロワーとコマンド検索を回帰確認。

## Responsive

- 1920×1080
- 1366×768
- 1024×768
- 768×900
- 390×844

上記で文書幅がビューポートを超えないことを確認。
