# QA Report v1.17.0

## 自動検査

- JavaScript構文：PASS
- Python構文：PASS
- HTML解析：PASS
- JSON解析：PASS
- ローカルHTTP配信：PASS
- API version：1.17.0
- 動画・ポスター参照：PASS
- ZIP整合性：PASS予定（パッケージ作成時に実施）

## 実装確認

- FULL / QUICK / OFF設定：実装済み
- 初回FULL・以降QUICK：実装済み
- QUICK区間進捗：実装済み
- 動画エラー時のHome移行：実装済み
- 再生停止監視：実装済み
- 初期暗色ポスター表示：実装済み
- Windows二重起動防止：実装済み
- 更新前データバックアップ：実装済み
- EXEロールバック：実装済み

## Windows実機で必要な最終確認

- pywebview起動直後の白画面が見えないこと
- FULL完走後のゲート遷移
- QUICKの再生時間と開始位置
- OFF起動時のHome表示速度
- タスクバーアイコン
- 二重起動通知
- `build_exe.ps1`と`install_desktop.ps1`
- `rollback_desktop.ps1`
- 登録済みツールの起動

## 実行済み結果

- `/api/status`応答：PASS（version 1.17.0）
- ルートHTML配信：PASS
- ローカル画像・CSS・JS・動画参照：欠落0件
- 起動動画：H.264 1920×1080 / 30fps / 9.766667秒、AAC音声を確認
- 管理Chromium：ローカルURLが管理ポリシーで遮断されたため、画面描画テストは実施不可
