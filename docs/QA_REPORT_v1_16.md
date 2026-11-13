# QA Report v1.16.0

## 対象

- Project: `NexusCore_StreetResearchHub_v1_16`
- Opening video: `assets/video/nexus_cinematic_wall_opening_v2.mp4`
- Poster: `assets/video/nexus_cinematic_wall_poster_v2.jpg`

## 動画仕様検証

`ffprobe`結果：

```text
Video codec : H.264
Profile use : High-compatible yuv420p
Resolution  : 1920 x 1080
Frame rate  : 30 fps
Audio codec : AAC
Audio       : 48 kHz / stereo
Duration    : 9.766667 s
File size   : 24,377,668 bytes
Bit rate    : 19,968,055 bit/s
```

- 全フレームデコード：PASS
- 音声デコード：PASS
- 平均音量：-17.2 dB
- 最大音量：-2.2 dB
- ポスター生成：PASS
- 6ショット・ストーリーボード生成：PASS

## 構文・生成コード

- `node --check app.js`：PASS
- `python3 -m py_compile server.py`：PASS
- `python3 -m py_compile tools/generate_cinematic_wall_opening.py`：PASS
- 生成スクリプト実行：PASS

## HTTP配信

- `/api/status`：HTTP 200
- API version：`1.16.0`
- MP4配信：HTTP 200
- Content-Type：`video/mp4`
- Content-Length：`24377668`

## Chromium実行検証

ローカルファイルとAPIをPlaywrightのルート経由で供給し、Chromium上で実DOM、CSS、JavaScript、MP4を実行した。

```text
playing_time_1          = 1.61 s
playing_paused_1        = false
sound_muted_after_click = false
sound_label_after_click = SOUND ON
intro_hidden_after_end  = true
body_intro_active       = false
home_visible_after_end  = true
console/page errors     = 0
```

### スキップ経路

- Enter：PASS
- Space：PASS
- Esc：PASS
- `SKIP`ボタン：PASS

### 遷移

- 動画完走後の自動遷移：PASS
- 最終ポスターへの置換：PASS
- 左右ゲート開放：PASS
- ゲート背後に実Homeが露出：PASS
- 手動スキップ時の短時間フェード：PASS

## 画面確認画像

```text
docs/qa_runtime_v1_16/cinema_01_traverse.png
docs/qa_runtime_v1_16/cinema_02_field.png
docs/qa_runtime_v1_16/cinema_03_access.png
docs/qa_runtime_v1_16/gate_transition_mid.png
docs/qa_runtime_v1_16/home_after_natural_end.png
docs/qa_runtime_v1_16/home_after_space_skip.png
```

## 未実施

実行環境がLinuxのため、Windows上でのPyInstallerによる完成EXE生成とWindowsデスクトップショートカット更新は未実施。`build_exe.ps1`は従来どおり`assets`全体を同梱するため、新動画とポスターはビルド対象に含まれる。
