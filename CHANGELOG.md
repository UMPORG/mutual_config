# Changelog

Todas as alterações notáveis a este projeto são documentadas neste ficheiro.

O formato segue o [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), e o projeto usa [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [Unreleased]

### Adicionado
- Receita de migração das apps Next para o Vite+, validada no piloto do portal.

## [0.3.1] - 2026-10-14

### Corrigido
- O pacote voltou a poder ser instalado como dependência git com o pnpm; os hooks de git ativam-se agora com `pnpm run hooks`.

## [0.3.0] - 2026-10-14

### Adicionado
- Exportação `@umporg/config/vite` com os presets de lint e formatação para o Vite+ (`defineUmpConfig`, `lintBase`, `lintNext`, `lintBun`, `fmtBase`, `fmtNext`, `fmtBun`); os JSON mantêm-se nesta fase.
- Grupo Renovate do Vite+ com versão exata e sem atualização automática.

### Alterado
- Os presets de formatação deixam de formatar ficheiros `.mdx`, ficando iguais ao Vite+.

## [0.2.0] - 2026-10-14

### Alterado
- Versões-alvo atualizadas (em `versoes.json`): Node 24.21.0, Bun 1.4.3, pnpm 12.11.2, TypeScript 7.0.2, Next 16.4.0, Effect 4.0.4, Playwright 1.64.1, Vitest 5.0.4, entre outras.
- Preset de lint: regra `capitalized-comments` desligada. Muda o resultado do lint nas apps, que terão de fazer retoques.

## [0.1.1] - 2026-10-14

### Alterado
- O preset Renovate do Effect passa a seguir a versão 4 estável, sem pré-versões.

## [0.1.0] - 2026-09-26

### Adicionado
- Presets partilhados: Renovate (horário de Lisboa, grupos por ecossistema, automerge só de patch e de minor em devDependencies, alertas de segurança imediatos, títulos em português), tsconfig (base, Next, Bun, estrito), lint, formatação e knip (Next e Bun).
- `versoes.json` com as versões-alvo alinhadas e `.nvmrc` com Node 24 LTS.

[Unreleased]: https://github.com/UMPORG/mutual_config/compare/v0.3.1...HEAD
[0.3.1]: https://github.com/UMPORG/mutual_config/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/UMPORG/mutual_config/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/UMPORG/mutual_config/compare/v0.1.1...v0.2.0
[0.1.1]: https://github.com/UMPORG/mutual_config/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/UMPORG/mutual_config/tree/v0.1.0
