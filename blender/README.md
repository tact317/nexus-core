# Blender Asset Integration

このフォルダは次工程でGLBを追加するための予約領域です。

## 推奨ファイル名

```text
tape_reel.glb
periodic_tape.glb
radia_studio.glb
model_interpreter.glb
paper_translator.glb
ws_control.glb
```

## アニメーションクリップ名

各モデルで可能な範囲で以下を統一します。

```text
Idle
Hover
Select
Open
Close
```

## 目標

- 通常時は静止またはごく小さいIdle
- ホバーで機能を説明する短い動き
- 選択でカードから中央ステージへ移動
- 実アプリ起動前にOpenを再生

GLB導入時も、テキスト・検索・ナビゲーション・詳細情報はHTML側に残します。
