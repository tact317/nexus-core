# v1.10.1

## Research Notes
- カラフルな細長い紙カードから、資料の表紙を思わせる白い大型破れ紙へ変更。
- 太い日本語見出し、赤いブラシ下線、番号付き要点、プロジェクト参照を追加。
- 1920px級では2列、狭い画面では1列。

## EXE builder
- Windows PowerShell 5.1で`pip show pyinstaller`の警告がNativeCommandErrorとして停止する問題を修正。
- `importlib.util.find_spec`でPyInstallerを確認し、未導入なら自動インストール。
- インストール・ビルドの終了コードを検査。
