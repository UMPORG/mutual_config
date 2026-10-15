# Changelog

Todas as alterações notáveis a este projeto são documentadas neste ficheiro.

O formato segue o [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), e o projeto usa [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [Unreleased]

### Adicionado
- Receita de migração de apps Next para o Vite+ (`docs/vite-plus.md`), validada no piloto do mutual_portal.

## [0.3.1] - 2026-10-14

### Corrigido
- Removido o script `prepare`, que fazia o pnpm recusar a dependência git do pacote; os hooks ativam-se agora com `pnpm run hooks`.

## [0.3.0] - 2026-10-14

### Adicionado
- Exportação `@umporg/config/vite` com os presets de lint e formatação fundidos para o Vite+ (`defineUmpConfig`, `lintBase`, `lintNext`, `lintBun`, `fmtBase`, `fmtNext`, `fmtBun`); os JSON mantêm-se nesta fase.
- Hook de pré-commit que bloqueia segredos nos ficheiros em stage (secretlint).
- CI com gitleaks em modo aviso.
- Grupo Renovate do Vite+ com versão exata e sem atualização automática.

### Alterado
- Os presets oxfmt deixam de formatar ficheiros `**/*.mdx`, para ficarem iguais ao formatador do Vite+.
- Limpeza de comentários e documentação, sem efeito nos presets.

## [0.2.0] - 2026-10-14

### Alterado
- Versões-alvo atualizadas (em `versoes.json`): Node 24.21.0, Bun 1.4.3, pnpm 12.11.2, TypeScript 7.0.2, Next 16.4.0, Effect 4.0.4, oxlint 1.88.0, oxfmt 0.73.0, knip 6.41.0, Playwright 1.64.1, Vitest 5.0.4, entre outras.
- A CI passa a compilar os presets com TypeScript 7.
- Preset oxlint: regra `capitalized-comments` desligada. Muda o resultado do lint nas apps, que terão de fazer retoques.

## [0.1.1] - 2026-10-14

### Alterado
- Revisão para produção: textos, código morto e comentários; o preset Renovate do Effect passa a seguir a versão 4 estável, sem pré-versões.
- Documentação alinhada: README em português europeu, versões-alvo apenas em `versoes.json`, regras de versões e tags no `CLAUDE.md`.

### Corrigido
- CI: cache do gestor de pacotes desligada no `setup-node`.
- CI: formatação feita com `.oxfmtrc.json` na raiz (cópia do preset base).

## [0.1.0] - 2026-09-26

### Adicionado
- Presets partilhados: Renovate (horário de Lisboa, grupos por ecossistema, automerge só de patch e de minor em devDependencies, alertas de segurança imediatos, títulos em português), tsconfig (base, Next, Bun, estrito), oxlint (base e Next), oxfmt e knip (Next e Bun).
- `versoes.json` com as versões-alvo alinhadas e `.nvmrc` com Node 24 LTS.
- CI de validação dos presets e README em português.

### Alterado
- Fins de linha LF em todos os ficheiros.

[Unreleased]: https://github.com/UMPORG/mutual_config/compare/v0.3.1...HEAD
[0.3.1]: https://github.com/UMPORG/mutual_config/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/UMPORG/mutual_config/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/UMPORG/mutual_config/compare/v0.1.1...v0.2.0
[0.1.1]: https://github.com/UMPORG/mutual_config/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/UMPORG/mutual_config/tree/v0.1.0
