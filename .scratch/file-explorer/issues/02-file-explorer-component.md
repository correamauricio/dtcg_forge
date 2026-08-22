# 02: File Explorer Component with Drag & Drop and File Actions

**What to build:**
A dedicated left-side File Explorer sidebar displaying project files, branding, import area with drag & drop support, export all, file selection for editing, and individual file action menus (rename, export individual, delete with confirmation).

**Blocked by:** 01: Core File Operations in State & History (Rename & Delete)

**Status:** completed

- [x] `FileExplorerComponent` renders a header with `[D] DTCG Forge` branding and an "Export All" action button.
- [x] Users can import multiple JSON token files by dragging and dropping them anywhere over the File Explorer, with visual drag-over feedback (dashed outline), or via the import button.
- [x] Files are listed in the explorer; clicking a file sets it as the active file for editing in the token inspector.
- [x] Each file item provides a `···` action menu on hover allowing the user to rename the file (with inline edit on double-click), export the individual file, or delete the file (with confirmation).
- [x] Comprehensive unit tests in `file-explorer.component.spec.ts` verify rendering, drag & drop, file selection, and file action flows.
