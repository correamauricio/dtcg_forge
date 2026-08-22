# 04: Header Removal, Conflict Footer & Layout Integration

**What to build:**
Remove the legacy `HeaderComponent` and the old file dropdown `<select>` from `SidebarComponent`. Integrate token conflict messages (`duplicateTokensInfo`) directly into the File Explorer footer as a pure visual treatment. Assemble the clean 4-column layout (`[File Explorer] [Tokens Inspector] [JSON Editor] [Preview]`).

**Blocked by:** 03: Elevated Variant Grouping and Active Preview Eye Switching

**Status:** ready-for-agent

- [ ] `HeaderComponent` is removed from the application and template.
- [ ] `SidebarComponent` removes the redundant `<select>` file dropdown while preserving token inspection and JSON editor toggle.
- [ ] `FileExplorerComponent` renders a footer showing duplicate/conflict messages from `tokenService.duplicateTokensInfo()`.
- [ ] `App` template coordinates the 4-column responsive layout without a top header.
- [ ] All unit and integration test suites pass with 100% success.
