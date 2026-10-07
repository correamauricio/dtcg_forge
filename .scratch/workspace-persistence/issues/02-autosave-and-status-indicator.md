# 02: Integrar Auto-save Contínuo e Indicador de Status no File Explorer (#34)

**What to build:**
Conectar o `TokenStateService` ao `WorkspaceStorageService` para persistência contínua com debounce de 400ms a cada mutação de estado, e exibir um micro-indicador de status visual no rodapé do `File Explorer`.

**Blocked by:** #33

**GitHub Issue:** https://github.com/correamauricio/dtcg_forge/issues/34

**Status:** ready-for-agent

- [ ] No `TokenStateService`, disparar salvamento assíncrono no `WorkspaceStorageService` com debounce de 400ms sempre que houver mutação em:
  - Adição, exclusão ou renomeação de `Token File`
  - Edição de valor de token ou alteração direta de JSON
  - Seleção de `Active File`, `Active Variant` ou arquivos desabilitados
- [ ] Expor signal de status de salvamento: `saveStatus = signal<'saved' | 'saving' | 'error'>('saved')`.
- [ ] No rodapé do `File Explorer` (`file-explorer.component.ts`), adicionar micro-indicador visual sincronizado com o status:
  - `'saving'`: Ícone animado/spinner discreto e texto *"Salvando..."*
  - `'saved'`: Ícone de check discreto e texto *"Salvo localmente"*
- [ ] Testes unitários em `token-state.service.spec.ts` e `file-explorer.component.spec.ts` garantindo que o debounce agrupa mutações rápidas e atualiza os sinais de status.
