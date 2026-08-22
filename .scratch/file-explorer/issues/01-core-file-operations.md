# 01: Core File Operations in State & History (Rename & Delete)

**What to build:**
Enable renaming and deleting Token Files within the application state and command history. When a file is deleted, if it was currently active, the state gracefully falls back to another remaining file. When a file is renamed, all references and active selection seamlessly follow the new name. Both operations record command mementos so that undo (`Ctrl+Z`) and redo (`Ctrl+Y`) fully revert and restore the operations.

**Blocked by:** None (can start immediately)

**Status:** completed

- [x] `TokenStateService` implements `deleteFile(name: string)` that removes the file, cleans references, and updates `activeFileName` if the deleted file was active.
- [x] `TokenStateService` implements `renameFile(oldName: string, newName: string)` with validation against empty or colliding file names.
- [x] `TokenService` exposes `deleteFile` and `renameFile` wrapped in `StateChangeCommand` for history (undo/redo) tracking.
- [x] Unit tests in `token.service.spec.ts` verify deletion, renaming, active fallback, and undo/redo behavior.
