# NEXUS CORE — Street Research Hub v1.20.0 正式版

v1.20は、NEXUS COREの最初の正式リリースです。v1.18までに確定したUIと日常利用機能を固定し、インストール、更新、バックアップ、ロールバック、最終診断を整理しました。

## 主な機能

- NEXUS専用アイコンを持つWindowsネイティブウィンドウ
- FULL／QUICK／OFFを選べるオリジナル起動映像
- ローカルツールの登録と起動
- 起動履歴、実行中プロセス、前面表示、停止
- 小型の紙カード型Research Notes
- ツール、メモ、ファイル、フォルダーを関連付けるProject Atlas
- ツール・プロジェクト・メモ・資料の横断検索
- バックアップ、復元、パス修復、カスタム画像登録
- 更新前バックアップと旧EXEへのロールバック

## ユーザーデータの保存先

ツール設定、プロジェクト、メモ、履歴、バックアップ、ログ、カスタム画像はEXEの外へ保存されます。

```text
%LOCALAPPDATA%\NexusCoreStreetResearchHub
```

アプリを更新または再インストールしても、通常はこのデータを維持します。

## インストールせずに確認する

```powershell
cd "<このリポジトリを置いたフォルダ>"
Set-ExecutionPolicy -Scope Process Bypass
.\run_all.ps1
```

## 正式版診断

```powershell
.\release_check.ps1
```

## EXE作成・インストール

```powershell
.\build_exe.ps1
.\install_desktop.ps1
.\verify_install.ps1
```

インストール先：

```text
%LOCALAPPDATA%\Programs\Nexus Core\NexusCoreHub.exe
```

## 旧EXEへ戻す

```powershell
.\rollback_desktop.ps1
```

ロールバックで置き換えるのはEXEだけです。ユーザーデータは変更しません。

## アンインストール

```powershell
.\uninstall_desktop.ps1
```

アプリ本体とショートカットを削除し、ユーザーデータは残します。

## 正式版資料

- `docs\RELEASE_NOTES_v1_20.md`
- `docs\FINAL_ACCEPTANCE_CHECKLIST_v1_20.md`
- `docs\RELEASE_MANIFEST_v1_20.txt`
- `docs\KNOWN_LIMITATIONS_v1_20.md`
