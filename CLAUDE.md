# mutual_config (`@umporg/config`)

Shared presets (Renovate, tsconfig, oxlint, oxfmt, knip), target versions (`versoes.json`) and
`.nvmrc`. The published package is JSON only (`scripts/` and `testes/` serve this repo's CI).
Usage per tool: [README.md](README.md).

- Consumed as a **git dependency pinned to a tag** (`github:UMPORG/mutual_config#vX.Y.Z`; Renovate
  `github>UMPORG/mutual_config#vX.Y.Z`), never from npm. A change reaches an app only after a new tag:
  bump `version` in `package.json` **and** `pacotes["@umporg/config"]` in `versoes.json`, commit,
  `git tag vX.Y.Z`, `git push origin main --tags`; apps then bump the tag (Renovate proposes it).
  Never move or delete a published tag.
- A target-version change touches `versoes.json`, `.nvmrc` (Node), the Renovate preset
  (`@types/node` `allowedVersions`) and the tool versions pinned in `.github/workflows/ci.yml`;
  `validar.mjs` checks only `versoes.json` against `.nvmrc`/`package.json`. Docs point to
  `versoes.json` keys instead of copying numbers.
- A preset change changes lint/format/type errors in every app: say so in the commit and expect the
  apps to need a follow-up.
- Tool limits that shape the files: oxfmt has no `extends` (apps copy `oxfmt/*.json`); oxlint
  `extends` is a relative path and `ignorePatterns` is not inherited; tsconfig `paths`/`include`/
  `exclude`/`outDir`/`rootDir` stay in the app; no `baseUrl`.
- The Cérebro does not consume this package (it keeps copies in its own `config/`).
- Check: `node scripts/validar.mjs` (CI also runs `tsc` on `testes/*`, oxlint, oxfmt and
  `renovate-config-validator --strict`).
- Git: `main` only, no force-push, no skipped hooks; commits in Portuguese ending with
  `Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>`.
