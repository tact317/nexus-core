# QA Report — v1.8

## Passed

- JavaScript構文検査
- Python構文検査
- tools/projects/history JSON解析
- `/api/status`、`/api/workspace`応答
- Tool Registry保存API
- Project関連付けAPI
- 未設定ツールの起動拒否
- Pythonダミーツールの起動、PID返却、ログ出力
- 起動履歴の保存
- JSONバックアップ生成
- ZIP整合性検査

## Environment limitation

管理環境のブラウザは`127.0.0.1`へのページ遷移が管理ポリシーでブロックされたため、Playwrightによる最終描画テストは実行できませんでした。Windows環境でTool Registry、パス選択、実アプリ起動を確認する必要があります。
