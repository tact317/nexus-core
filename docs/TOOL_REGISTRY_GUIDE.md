# Tool Registry Guide

## 推奨登録順

1. 単体EXEで起動できるツール
2. `run.bat`または`run.ps1`があるツール
3. 仮想環境を使うPythonツール
4. ブラウザ型ツール
5. 複数プロセスを起動するツール

最初は1本ずつ登録し、`OPEN TOOL`、ログ、再起動を確認してください。

## 各方式の設定

### EXE

- TYPE: `EXE`
- TARGET: `.exe`
- WORKING DIRECTORY: 通常はEXEのあるフォルダー

### Python

- TYPE: `PYTHON`
- TARGET: 起点となる`.py`
- PYTHON INTERPRETER: 使用するvenvの`python.exe`
- WORKING DIRECTORY: 設定ファイルや相対パスの基準フォルダー

### PowerShell

- TYPE: `POWERSHELL`
- TARGET: `.ps1`
- 実行時に`-NoProfile -ExecutionPolicy Bypass -File`が自動で付与されます

### BAT

- TYPE: `BAT`
- TARGET: `.bat`または`.cmd`
- `cmd.exe /d /c`で起動します

### URL

- TYPE: `URL`
- TARGET: WebアプリのURL

### Folder

- TYPE: `FOLDER`
- TARGET: 開きたい作業フォルダー

## トラブル確認

1. TARGETが存在するか
2. WORKING DIRECTORYが存在するか
3. Pythonのvenvが正しいか
4. 引数内の空白を引用符で囲んでいるか
5. `logs`の最新ファイルにエラーがないか
6. PowerShellから同じコマンドを直接実行できるか
