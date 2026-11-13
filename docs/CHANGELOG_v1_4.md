# Changelog v1.5

## UI architecture

- Removed image-coordinate hotspots from the Home hero.
- Rebuilt hero notes as live HTML buttons.
- Kept silhouette illustrations as non-interactive visual assets.
- Added isolated stacking contexts to Home panels and route pages.

## Collision fixes

- Converted the Tools drag banner into an in-flow sticker.
- Prevented the banner from covering tool cards or adjacent panels.
- Split the Research Notes header, pinned state, list, and footer note into separate layout regions.
- Reduced Quick Launch ink decoration to a non-obstructive corner splatter.

## Responsive precision

- Reworked the Home hero for desktop and mobile without coordinate hotspots.
- Forced the four Home tool cards to fit the available panel width.
- Preserved Atlas drag and zoom using HTML/SVG coordinates.
