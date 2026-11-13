# UI Architecture v1.5

## Principle

The interface is interactive first and decorative second. Decorative assets cannot define click geometry.

## Live UI

- Japanese and English headings
- Sticky-note actions
- Tool cards
- Project cards and progress
- Atlas nodes and connections
- Research notes
- Search, drawers, settings and navigation

## Image assets

- Researcher silhouettes
- Tool preview illustrations
- Static paper and ink references

Image assets use `pointer-events: none` when they are decorative. Every clickable surface is a real button or link.

## Layer policy

Each major panel creates its own stacking context using `isolation: isolate` and clips nonessential decoration. Decorative layers remain below interactive content. Overlays such as search and tool detail drawers use the global overlay layer only.
