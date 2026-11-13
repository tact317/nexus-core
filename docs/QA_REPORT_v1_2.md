# QA Report v1.2

## Static validation

- JavaScript syntax: PASS (`node --check app.js`)
- Python syntax: PASS (`python3 -m py_compile server.py`)
- HTML parse and duplicate IDs: PASS
- CSS brace balance: PASS
- SVG parse: PASS
- Local HTTP response: PASS
- ZIP integrity: PASS

## Browser automation

Playwright + Chromiumによる自己完結レンダーで確認。

- Home render: PASS
- Tools navigation: PASS
- Project Atlas navigation: PASS
- Research Notes navigation: PASS
- Settings navigation: PASS
- Tool detail drawer open/close: PASS
- Command search (`Radia`): PASS
- JavaScript page errors: 0

## Responsive overflow

| Viewport | document width | Result |
|---|---:|---|
| 1920 | 1920 | PASS |
| 1366 | 1366 | PASS |
| 1024 | 1024 | PASS |
| 768 | 768 | PASS |
| 390 | 390 | PASS |

## Intentional limitations

- 実アプリ起動は未接続。
- ツールデータは現時点ではJavaScript内のモックデータ。
- Blender／GLBは次工程でSVGプレビューから置き換える。
