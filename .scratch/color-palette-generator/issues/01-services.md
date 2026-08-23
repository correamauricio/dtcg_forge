# 01: Services

**What to build:** The core base logic of the Palette Generator. This ticket delivers the `TokenGroupAnalyzerService` (to identify if a token group is a Primitive Color Group) and the `PaletteGeneratorService` (to handle script storage and execution). This step installs `@material/material-color-utilities`. No UI changes are delivered here.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] Install `@material/material-color-utilities`.
- [ ] Create `TokenGroupAnalyzerService` that ensures a token group has only `color` primitive tokens and no aliases.
- [ ] Create `PaletteGeneratorService` that manages `localStorage` saving/loading for the script.
- [ ] Implement `PaletteGeneratorService.generate(...)` to evaluate the user's custom script securely and inject material utilities.
- [ ] Write unit tests for both services.
