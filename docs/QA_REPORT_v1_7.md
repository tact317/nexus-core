# QA Report — v1.7

## Static validation

- HTMLを標準パーサーで解析
- HTML IDの重複を検査
- JavaScriptを`node --check`で検査
- Pythonサーバーを`py_compile`で検査
- CSSの波括弧対応を検査
- ローカル画像・SVG参照を検査
- ZIP展開テストを実施

## Interaction logic reviewed

- START、SKIP、Enter、Space、Escapeによるイントロ終了
- 起動イントロ設定のLocal Storage保存
- Settingsからのイントロ再生
- ツール検索、カテゴリ絞り込み、並び順切替
- 自由配置時のみツールカードをドラッグ可能
- ドラッグ終了後の誤クリック抑止
- Atlasの移動、ズーム、リセット
- Notesの表示条件、件数、ピン切替
- 詳細ドロワーと検索レイヤーの開閉

## Manual Windows checks requested

- 1920×1080、2560×1440
- Windows表示倍率100%、125%、150%
- Homeの付箋と中央表示の重なり
- Toolsのドラッグと並び順切替
- Atlasの線とノードの同期
- Notesのフィルターとピン切替
- Settingsでイントロを無効化して再起動
