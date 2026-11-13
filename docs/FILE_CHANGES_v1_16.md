# File Changes v1.16

## 追加

- `assets/video/nexus_cinematic_wall_opening_v2.mp4`
- `assets/video/nexus_cinematic_wall_poster_v2.jpg`
- `assets/video/source/wall_sparse.png`
- `assets/video/source/wall_dense.png`
- `assets/video/source/wall_access.png`
- `tools/generate_cinematic_wall_opening.py`
- `docs/OPENING_ART_DIRECTION_v1_16.md`
- `docs/CHANGELOG_v1_16.md`
- `docs/FILE_CHANGES_v1_16.md`
- `docs/QA_REPORT_v1_16.md`
- `docs/RELEASE_MANIFEST_v1_16.txt`
- `docs/v1_16_cinematic_opening_storyboard.jpg`
- `docs/qa_runtime_v1_16/*`

## 変更

- `index.html`
  - v1.16動画とポスターへ参照変更
  - 映像上の登録ラベルを削除
  - 音声切り替えと最小スキップUIを追加
  - バージョン表記を1.16.0へ更新
- `styles.css`
  - シネマティック表示と左右ゲート遷移を追加
  - 手動スキップ専用フェードを追加
  - Home露出時にゲート背後を透明化
- `app.js`
  - 音声切り替えを追加
  - 自動終了と手動スキップの遷移を分離
  - バージョン表記を1.16.0へ更新
- `server.py`
  - `APP_VERSION`を1.16.0へ更新
- `build_exe.ps1`
- `run_all.ps1`
- `run_browser.ps1`
- `VERSION.txt`
- `README.md`

## 削除

- `assets/video/nexus_fragment_assembly_opening_v1.mp4`
- `assets/video/nexus_fragment_assembly_poster.jpg`
- `tools/generate_fragment_assembly_opening.py`
