# 03: Ação de Vinculação na UI e Serviço de Estado

**What to build:** O usuário consegue abrir o menu de contexto (três pontos) de qualquer arquivo JSON importado no File Explorer e clicar em "Vincular ao Preview". Isso engatilha o motor heurístico e o preview passa a usar as cores semânticas importadas, sem alterar fisicamente o arquivo do usuário.

**Blocked by:** 01 (Criar o estado do Default Preview Sheet), 02 (Desenvolver o Heuristic Scoring Engine).

**Status:** ready-for-agent

- [ ] O serviço de estado (`token-state.service.ts`) possui um novo método `linkFileToPreview` que recebe o arquivo do usuário, roda o motor heurístico, e regrava o conteúdo da folha padrão.
- [ ] O `file-explorer.component.ts` exibe o botão "Vincular ao Preview" e aciona o método.
