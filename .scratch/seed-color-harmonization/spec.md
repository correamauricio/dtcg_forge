## Problem Statement

The user wants to efficiently harmonize multiple color groups within a Design Token file based on a newly generated seed color. Currently, they have to individually configure and regenerate each color group when they change the primary theme color, which is tedious and error-prone. They want a feature similar to Material Theme Builder's "harmonize" functionality, where one base color can shift all other color palettes (e.g. secondary, tertiary, background) towards the new seed color, while maintaining their fundamental hues.

## Solution

Implement an optional "Harmonize other color groups" toggle within the Palette Generator UI. When activated during a seed color update on a Primitive Token Group, the system will identify all other "Color Primitive Groups" in the Active File, determine their base color, harmonize that base color with the new seed color using Material 3's `Blend.harmonize`, and regenerate their entire tonal palette. This bulk operation is wrapped in a single history state for easy undoing.

## User Stories

1. As a designer, I want a toggle to "Harmonize other color groups" when changing a seed color, so that I can automatically update my entire theme's color harmony in one click.
2. As a user, I want the system to only target "Color Primitive Groups" (groups containing only raw colors, no aliases), so that my semantic tokens or spacing tokens are not accidentally corrupted by the color generator.
3. As a user, I want the harmonization to be mathematically consistent, so that the resulting palettes maintain a perfect Material 3 tonal curve.
4. As a user, I want to be able to undo the entire harmonization process with a single `Ctrl+Z` keystroke, so that I can safely experiment with different seed colors without ruining my file.

## Implementation Decisions

- **Definition of Target Group**: We introduced the term "Color Primitive Group" to the glossary. It is defined strictly as a primitive token group composed entirely of color values (hex/rgb) where no token is an alias.
- **Harmonization Algorithm**: The system will harmonize the target group's "base color" and then regenerate the entire palette from scratch (Option A). This was chosen over individually shifting each shade (Option B) to guarantee a consistent tonal curve.
- **Base Color Selection**: The base color of a target group is determined by looking for a token named `500`, `base`, or `primary`. If none exist, the median token is used.
- **Customizability**: The loop traversing groups and harmonizing the base colors will be hardcoded internally for stability, rather than exposing this complexity to the user's custom JavaScript snippet. The user's snippet is only invoked per-group using the harmonized base color.
- **State Management**: The UI component (`PrimitiveGroupNodeComponent`) will emit a `harmonizeGroup` event. `TokenStateService` will handle the traversal and bulk update, committing everything as a single history memento using `updateActiveFileContent`.

## Testing Decisions

- A good test verifies external behavior: given a mocked file with a `color.primary` and `color.secondary`, harmonizing `color.primary` with yellow should correctly shift `color.secondary` towards yellow, but should leave `spacing.md` untouched.
- `PaletteGeneratorService` will be tested for `findBaseColor` logic and `harmonizeColorPrimitiveGroups` traversal/regeneration logic.
- `TokenStateService` will be tested to ensure the state updates correctly without losing non-color groups.

## Out of Scope

- Exposing the harmonization loop logic to the user's customizable Javascript snippet.
- Harmonizing groups that contain aliases (semantic tokens).
- Cross-file harmonization (only groups within the "Active File" are harmonized).

## Further Notes
- Material 3's `Blend` utility must be imported from `@material/material-color-utilities` in the generator service.
