# QA Report — v1.6

## Static validation
- HTML parsed successfully.
- JavaScript syntax checked with Node.js.
- Python server compiled successfully.
- CSS brace balance checked.
- All local image references verified.
- Duplicate HTML IDs checked.

## Interaction checks
- Intro can be dismissed by START, SKIP, Enter, Space and Escape.
- Intro prevents background interaction until dismissal.
- Hero sticky notes remain real buttons.
- Hero center message remains a live button and cycles text.
- SVG paths are pointer-transparent and cannot block controls.

## Manual Windows checks requested
- 1920x1080 at 100%, 125% and 150% display scaling.
- Confirm arc, arrows and notes remain separated.
- Confirm intro reveal and dismissal timing.

## Automated Chromium smoke test
A self-contained QA build with inlined local assets was rendered in headless Chromium at 1920x1080.

Passed checks:
- Painted intro exists and dismisses correctly.
- Home renders four tool cards.
- Central message cycles on click.
- Explore note creates feedback.
- Connect note remains inside the hero panel.
- Tools, Project Atlas and Research Notes routes render successfully.
