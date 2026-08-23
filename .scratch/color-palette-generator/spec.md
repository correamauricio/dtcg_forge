## Problem Statement

Users of DTCG Forge need a way to easily generate and visualize color palettes (e.g., Google Material 3 scales from 50 to 900). Currently, tokens are just displayed in a standard tree view, and modifying a base color requires manually recalculating and updating all related color steps. There is no compact way to view a color scale side-by-side, nor an automated way to generate one.

## Solution

A new **Palette Generator** feature will be introduced. When a **Primitive Token Group** (a group containing only color tokens and no aliases) is detected, the UI will display the colors in a compact side-by-side horizontal view (color circles). 
In the group title, a settings button will allow the user to inject a custom generation script (defaulting to Material 3). When any color in this compact palette is edited, it becomes the "seed" color, and the custom script is executed to automatically recalculate and update the rest of the colors in the group.

## User Stories

1. As a designer, I want to see color token groups in a compact side-by-side visualization, so that I can easily perceive the whole palette at a glance.
2. As a designer, I want to edit a single color in a primitive color group, so that the entire palette is regenerated based on that new seed color.
3. As a power user, I want to configure a custom JavaScript generator script per session/globally, so that I can use my own company's color algorithms instead of the default Material 3 algorithm.
4. As a user, I want to expand the compact group back into the standard list view, so that I can see the raw values or metadata if needed.
5. As a user, I want my custom script to automatically have access to Material 3 utilities (`@material/material-color-utilities`), so that I don't have to worry about imports when writing the script.
6. As a user, I want my generator script to persist in my local browser storage (`localStorage`), so that I don't have to paste it again every time I open the app.

## Implementation Decisions

- **Detection**: `TokenGroupAnalyzerService` will scan a group to ensure all its leaf tokens are of type `color` and none are aliases. If true, it flags the group as a `Primitive Color Group`.
- **Visualization**: A new `PrimitiveGroupNodeComponent` will handle the horizontal list rendering and the expand/collapse state (which defaults to compact and persists in-memory for the session).
- **Execution**: `PaletteGeneratorService` will execute the user's script securely using `new Function()`. The script receives the `seedColor` (the one just edited), the `tokenName` of the seed, and the `currentGroup` object.
- **Library Injection**: The `@material/material-color-utilities` package will be installed. Its core functions (like `themeFromSourceColor`, `argbFromHex`, `hexFromArgb`) will be injected as arguments into the `new Function` scope so the user script can call them directly.
- **Storage**: The custom script string is saved globally in `localStorage`.

## Testing Decisions

- Test the `TokenGroupAnalyzerService` to ensure it only flags groups that strictly contain primitive colors. Groups with typography tokens, dimension tokens, or aliases should return false.
- Test the `PaletteGeneratorService` to verify that `new Function` executes without throwing errors when given a valid script, and properly catches/reports syntax errors for invalid scripts.
- Ensure the compact component renders the exact number of circles as there are tokens in the group.

## Out of Scope

- Adding custom generator configurations to the token file itself (e.g. `$extensions`). This keeps the W3C token file clean.
- Complex sandboxing of the user script (e.g., Web Workers or iframes). Since this is a local editor and the script is provided by the user in `localStorage`, `new Function` is sufficient.

## Further Notes

None.
