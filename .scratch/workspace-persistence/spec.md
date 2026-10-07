## Problem Statement

Currently, DTCG Forge maintains all state strictly in memory. When a user refreshes the browser (F5), closes a tab, or closes their browser, all changes—including newly added or edited `Token File`s, token values, variant selections, and active file choices—are immediately discarded. The application resets to the hardcoded demo preset (`primitives.json`, `semantics.json`, `semantics-dark.json`). This creates high cognitive friction and substantial risk of accidental data loss.

## Solution

A robust, client-side persistence and session lifecycle architecture is introduced, as documented in [ADR-0003: Workspace Persistence and Session Lifecycle](../../docs/adr/0003-workspace-persistence-and-session-lifecycle.md):

1. **Storage Engine**: Asynchronous, transactional native IndexedDB (`dtcg-forge-db`, store `workspace`, key `current`) via a dedicated Angular `WorkspaceStorageService`. This avoids the 5MB quota limit and UI thread blocking inherent to `localStorage`.
2. **Auto-save**: Transparent background saving debounced at 400ms whenever the `Workspace` state changes, with a subtle status micro-indicator in the `File Explorer` footer (*"Salvando..."* / *"Salvo localmente"*).
3. **Session Lifecycle**: Using `sessionStorage` (`dtcg_forge_session_active`), page reloads (F5) in the same tab seamlessly restore the last saved `Workspace` without interrupting the developer. Opening a new tab/session presents a dismissible `WelcomeModalComponent` offering to continue the saved session, load the demo preset, or start a clean workspace.
4. **Safety & Workspace Management**: A popover menu in the `File Explorer` header provides quick actions (*"Novo Workspace"*, *"Carregar Workspace de Exemplo"*). Triggering these actions opens a destructive-action confirmation modal offering to download a backup JSON file before overwriting saved data.

## User Stories

1. **As a token designer**, I want my workspace (files, variants, and active selections) to be automatically saved as I edit, so that I never lose work when I refresh the page or accidentally close my browser.
2. **As a developer**, when I press F5 while testing, I want the editor to instantly restore my active tokens without showing interrupting dialogs or welcome screens.
3. **As a new or returning user opening a fresh tab**, I want a welcome screen that allows me to choose whether to pick up where I left off, explore example tokens, or start a blank workspace.
4. **As a designer**, I want clear and subtle feedback in the `File Explorer` indicating whether my recent changes have been saved to local storage.
5. **As a user wanting to reset my tokens**, I want to be prompted to download a backup of my current workspace before resetting to example presets or creating a clean workspace.

## Implementation Decisions

- **Domain Model**: The aggregate persisted unit is formalised as **`Workspace`** (defined in `CONTEXT.md`), avoiding generic terms like "Project", "Session", or "Document".
- **Database Architecture**: Native browser `indexedDB.open('dtcg-forge-db', 1)` creates an object store named `workspace`. The active workspace is stored under a single record key `'current'`.
- **Workspace State Schema**:
  ```ts
  export interface WorkspaceState {
    files: TokenFile[];
    activeFileName: string;
    selectedVariants: Record<string, string>;
    disabledFileNames: string[];
    selectedTokenPath: string[] | null;
    updatedAt: number;
  }
  ```
- **Undo/Redo Stack**: The `HistoryService` command stack is kept ephemeral in memory for the active session, avoiding serialization complexity and stale command closures across restarts.
- **Save Debounce**: 400ms RxJS debounce timer in `TokenStateService` aggregates rapid keystrokes into a single async transaction.
- **Safety Dialogs**: Confirmation modals provide explicit *"Baixar Backup e Continuar"*, *"Continuar sem Salvar"*, and *"Cancelar"* options.

## Testing Decisions

- Unit tests for `WorkspaceStorageService` using fake/mocked IndexedDB (or in-memory mock store) verifying `saveWorkspace`, `loadWorkspace`, and `clearWorkspace`.
- Integration tests in `TokenStateService` verifying debounced auto-save triggers and status signal updates.
- Component tests for `FileExplorerComponent` ensuring the save status indicator displays correctly and the workspace popover toggles and triggers actions.
- Component tests for `WelcomeModalComponent` ensuring dismissal via ESC/backdrop and selection events work as expected.

## Out of Scope

- Multi-project management / cloud synchronization.
- Persistent command undo history across restarts.
- Direct disk filesystem binding (File System Access API).
