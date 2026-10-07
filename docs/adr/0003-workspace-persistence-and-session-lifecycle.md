# Workspace Persistence and Session Lifecycle

We implemented client-side persistence using native IndexedDB (`dtcg-forge-db`) with a 400ms debounced auto-save for the active Workspace, avoiding the storage quotas and main-thread blocking of localStorage. To balance rapid development with onboarding, `sessionStorage` suppresses the welcome modal during same-tab reloads (F5) while new tabs present the Workspace chooser, backed by a header popover and a destructive-action confirmation modal offering backup export before resetting.
