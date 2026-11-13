# QA Report v1.15.0

## Media validation

- File: `assets/video/nexus_fragment_assembly_opening_v1.mp4`
- Codec: H.264
- Pixel format: yuv420p
- Resolution: 1920×1080
- Frame rate: 30fps
- Duration: 8.400s
- Audio: none
- Fast start: enabled

## Static validation

- `app.js`: `node --check` PASS
- `server.py`: Python compile PASS
- `tools/generate_fragment_assembly_opening.py`: Python compile PASS
- `styles.css`: brace balance PASS
- HTML media references: PASS
- Removed v1.14 opening asset references: PASS

## Runtime browser validation

Chromium headlessへHTML、CSS、JavaScript、MP4、ポスターをインライン投入して検証しました。ローカルURLへの直接アクセスは実行環境の管理ポリシーで遮断されたため、表示・再生・操作検証は同一ブラウザエンジンの`set_content`方式で実施し、サーバーAPIは別途HTTPで確認しています。

結果：

- 1.8秒時点でイントロ表示: PASS
- 1.8秒時点で動画再生中: PASS
- ステータス更新`COLLIDE EVIDENCE`: PASS
- 動画終了後にイントロを非表示: PASS
- 動画終了後にHomeを表示: PASS
- Enter入力でイントロを非表示: PASS
- Space入力でイントロを非表示: PASS
- Esc入力でイントロを非表示: PASS
- `SKIP INTRO`ボタンでイントロを非表示: PASS
- JavaScript console error: 0
- Page error: 0

実測値：

```text
video_time_at_1_8s = 1.936s
video_paused_at_1_8s = false
intro_hidden_after_end = true
route_visible_after_end = true
intro_hidden_after_space = true
Enter / Space / Escape / SkipButton = true
```

## Server validation

`python server.py --no-browser --host 127.0.0.1 --port 4173`を起動し、`/api/status`を確認しました。

```text
ok = true
version = 1.15.0
packaged = false
```

## Visual evidence

- `docs/qa_runtime/intro_playing.png`
- `docs/qa_runtime/home_after_intro.png`
- `docs/qa_runtime/home_after_space_skip.png`

## Known scope

Windowsの実pywebviewとPyInstaller完成EXEそのものは、このLinux検証環境では起動していません。ただし、EXEビルド定義は従来どおり`assets`全体を同梱し、HTML/CSS/JS/MP4のブラウザ実行はChromiumで確認済みです。最終利用PCでは、READMEの手順で`run_all.ps1`確認後に`build_exe.ps1`を実行してください。
