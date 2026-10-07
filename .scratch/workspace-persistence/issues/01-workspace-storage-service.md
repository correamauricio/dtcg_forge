# 01: Implementar o WorkspaceStorageService com IndexedDB (#33)

**What to build:**
Um serviço Angular desacoplado (`WorkspaceStorageService`) que gerencia a persistência do `Workspace` de forma assíncrona usando a API nativa do IndexedDB (`dtcg-forge-db`), conforme documentado no ADR-0003.

**Blocked by:** None (can start immediately)

**GitHub Issue:** https://github.com/correamauricio/dtcg_forge/issues/33

**Status:** ready-for-agent

- [ ] Criar a interface de modelo `WorkspaceState` (`src/app/models/workspace.model.ts` ou `token.model.ts`) contendo:
  - `files: TokenFile[]`
  - `activeFileName: string`
  - `selectedVariants: Record<string, string>`
  - `disabledFileNames: string[]`
  - `selectedTokenPath: string[] | null`
  - `updatedAt: number`
- [ ] Implementar `WorkspaceStorageService` (`src/app/services/workspace-storage.service.ts`) com IndexedDB nativo (database `dtcg-forge-db`, object store `workspace`).
- [ ] Implementar método `saveWorkspace(workspace: WorkspaceState): Promise<void>` gravando sob a chave única `'current'`.
- [ ] Implementar método `loadWorkspace(): Promise<WorkspaceState | null>` retornando o estado persistido ou `null` se vazio.
- [ ] Implementar método `clearWorkspace(): Promise<void>`.
- [ ] Tratamento gracioso de exceções de banco/cota sem quebrar a execução da aplicação.
- [ ] Testes unitários em `workspace-storage.service.spec.ts` cobrindo inicialização, gravação, carregamento e limpeza.
