## Parent
Part of #19

## What to build
Integrate the core harmonization logic from Ticket 1 into the `TokenStateService`. When a color is updated and harmonization is requested, the service should invoke the generator to calculate the bulk updates and commit the new state in a single transaction so it can be undone easily via History.

## Acceptance criteria
- [ ] `TokenStateService` implements `harmonizeActiveFile(sourceGroupPath: string[], seedColorHex: string, generatedSourceGroup: any)`.
- [ ] The method deep clones the active file, applies the user's generated source group, calls `harmonizeColorPrimitiveGroups`, and commits via `updateActiveFileContent`.
- [ ] Unit tests verify that calling `harmonizeActiveFile` updates the state correctly as a single transaction without corrupting non-color tokens.

## Blocked by
- Ticket 1 (Core Harmonization Algorithm)
