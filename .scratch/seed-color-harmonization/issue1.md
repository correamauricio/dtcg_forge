## Parent
Part of #19

## What to build
Implement the core logic for seed color harmonization without UI or state management integration. We need a way to identify the "base color" of any target color primitive group, and an algorithm that applies `Blend.harmonize` across all target color groups in a given JSON object, returning the mutated JSON.
Update the `CONTEXT.md` with the new "Color Primitive Group" definition.

## Acceptance criteria
- [ ] `CONTEXT.md` is updated to define "Color Primitive Group" (a primitive token group composed entirely of color values (hex/rgb) where no token is an alias).
- [ ] `PaletteGeneratorService` has a `findBaseColor` method that returns `500`, `base`, `primary`, or the median token's value.
- [ ] `PaletteGeneratorService` has a `harmonizeColorPrimitiveGroups` method that traverses a given token JSON, skipping the source group, and replaces target color groups with a newly generated palette harmonized against the given seed color.
- [ ] Unit tests cover both methods.

## Blocked by
None (can start immediately)
