# File Changes v1.15

## 追加

- `assets/video/nexus_fragment_assembly_opening_v1.mp4`
- `assets/video/nexus_fragment_assembly_poster.jpg`
- `tools/generate_fragment_assembly_opening.py`
- `docs/OPENING_ART_DIRECTION_v1_15.md`
- `docs/CHANGELOG_v1_15.md`
- `docs/FILE_CHANGES_v1_15.md`
- `docs/QA_REPORT_v1_15.md`
- `docs/RELEASE_MANIFEST_v1_15.txt`
- `docs/v1_15_intro_preview.png`
- `docs/v1_15_intro_storyboard.jpg`
- `docs/qa_runtime/intro_playing.png`
- `docs/qa_runtime/home_after_intro.png`
- `docs/qa_runtime/home_after_space_skip.png`

## 変更

- `index.html`
  - 新しい動画、ポスター、進捗、ステータス、スキップUIへ差し替え
  - バージョン表記を1.15.0へ更新
  - Settingsのイントロ説明を更新
- `styles.css`
  - v1.14動画用スタイルを削除
  - 起動専用の材質オーバーレイ、操作UI、ACCESS CUT遷移を追加
- `app.js`
  - 動画終了時の自動遷移
  - Enter / Space / Esc / Skip
  - 自動再生拒否、動画エラー、モーション低減
  - 進捗・段階表示
  - バージョン表記を1.15.0へ更新
- `server.py`
  - `APP_VERSION`を1.15.0へ更新
- `run_all.ps1`
  - 表示バージョンを1.15.0へ更新
- `run_browser.ps1`
  - 表示バージョンを1.15.0へ更新
- `build_exe.ps1`
  - 表示バージョンを1.15.0へ更新
- `VERSION.txt`
  - `1.15.0`
- `README.md`
  - v1.15の設計、操作、起動、再生成、EXE化を記載

## 削除

- `assets/video/nexus_core_original_opening_v1.mp4`
- `assets/video/nexus_core_original_opening_poster.jpg`
- `tools/generate_opening_video.py`
