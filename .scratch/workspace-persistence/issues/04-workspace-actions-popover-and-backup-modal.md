# 04: Popover de Ações de Workspace e Modal de Confirmação com Backup (#36)

**What to build:**
Adicionar botão com menu Popover no cabeçalho do `File Explorer` para ações de gerenciamento de `Workspace`, e implementar modal de confirmação com oferta de download de backup antes de sobrescrever ou resetar dados.

**Blocked by:** #33, #34, #35

**GitHub Issue:** https://github.com/correamauricio/dtcg_forge/issues/36

**Status:** ready-for-agent

- [ ] No cabeçalho do `File Explorer`, adicionar botão de opções de `Workspace` (ícone de ajustes/menu) ao lado de *Exportar Todos*.
- [ ] O botão abre um Popover flutuante com as ações:
  - *"Novo Workspace"*
  - *"Carregar Workspace de Exemplo"*
- [ ] Ao clicar em qualquer uma das duas ações (se houver dados salvos), abrir modal de confirmação:
  - Mensagem: *"Essa ação substituirá o seu Workspace atual. Deseja baixar um backup antes de prosseguir?"*
  - Botão *"Baixar Backup e Continuar"*: gera o download do arquivo de backup JSON dos arquivos atuais e aplica a nova ação.
  - Botão *"Continuar sem Salvar"*: descarta e aplica imediatamente a ação escolhida.
  - Botão *"Cancelar"*: fecha o modal sem alterar o estado.
- [ ] Fechamento do popover ao clicar fora ou apertar `ESC`.
- [ ] Testes unitários para o popover, modal de confirmação e rotina de exportação prévia de backup.
