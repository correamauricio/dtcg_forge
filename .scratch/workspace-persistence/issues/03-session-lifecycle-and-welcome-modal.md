# 03: Implementar Ciclo de Vida de Sessão e Modal de Boas-Vindas (#35)

**What to build:**
Implementar o fluxo de ciclo de vida da sessão utilizando `sessionStorage` para diferenciar recarregamentos (F5) de novas sessões/abas, exibindo o `WelcomeModalComponent` quando apropriado, conforme ADR-0003.

**Blocked by:** #33, #34

**GitHub Issue:** https://github.com/correamauricio/dtcg_forge/issues/35

**Status:** ready-for-agent

- [ ] Na inicialização da aplicação (`TokenStateService` / `App`), verificar a flag no `sessionStorage` (`dtcg_forge_session_active`):
  - Se presente (F5 / reload na mesma aba): carregar diretamente o `Workspace` persistido do IndexedDB.
  - Se ausente (nova aba ou primeiro acesso): exibir o `WelcomeModalComponent`.
- [ ] Criar o componente `WelcomeModalComponent`:
  - Se existir `Workspace` salvo: exibir opção de destaque *"Continuar de onde parei"* (mostrando data/hora ou quantidade de arquivos).
  - Opção *"Carregar Workspace de Exemplo"* (inicializa com os presets padrão).
  - Opção *"Novo Workspace em Branco"* (inicia com área limpa para novos arquivos).
- [ ] Suportar fechamento inteligente com tecla `ESC` ou clique no backdrop: dispensar o modal e carregar o `Workspace` salvo (ou presets se vazio).
- [ ] Gravar a flag no `sessionStorage` assim que uma opção for selecionada ou o modal for dispensado.
- [ ] Testes unitários cobrindo os cenários de reload na mesma aba e abertura em nova sessão.
