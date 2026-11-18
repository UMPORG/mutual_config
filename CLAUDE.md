# mutual_config (`@umporg/config`)

`vite/index.js` (+ `.d.ts`) stays plain JS: Node won't strip types in `node_modules`. During the expand phase it must
equal the merge of `oxlint/*.json`/`oxfmt/*.json` (`validar.mjs` fails otherwise); the JSON goes in a later contract release.
Usage per tool: [README.md](README.md).

- Consumed as a **git dependency pinned to a tag** (`github:UMPORG/mutual_config#vX.Y.Z`; Renovate
  `github>UMPORG/mutual_config#vX.Y.Z`), never from npm. A change reaches an app only after a new tag:
  bump `version` in `package.json` **and** `pacotes["@umporg/config"]` in `versoes.json`, commit,
  `git tag vX.Y.Z`, `git push origin main --tags`; apps then bump the tag (Renovate proposes it).
  Never move or delete a published tag.
- A target-version change touches `versoes.json`, `.nvmrc` (Node), the Renovate preset
  (`@types/node` `allowedVersions`) and the tool versions pinned in `.github/workflows/ci.yml`;
  `validar.mjs` checks `versoes.json` against `.nvmrc`/`package.json` and that `.oxfmtrc.json` equals
  `oxfmt/base.json` (change both together); it does not check `ci.yml` or the Renovate preset. Docs point to `versoes.json` keys instead of
  copying numbers.
- A preset change changes lint/format/type errors in every app: say so in the commit and expect the
  apps to need a follow-up.
- Tool limits that shape the files: oxfmt has no `extends` (apps copy `oxfmt/*.json`); oxlint
  `extends` is a relative path and `ignorePatterns` is not inherited; tsconfig `paths`/`include`/
  `exclude`/`outDir`/`rootDir` stay in the app; no `baseUrl`.
- The Cérebro does not consume this package (it keeps copies in its own `config/`).
- Pre-commit hook (`.githooks`; enable once with `pnpm run hooks`, never via `prepare`: pnpm refuses git dependencies that have lifecycle scripts) runs secretlint on staged files; CI runs gitleaks in warning mode.
- Check: `node scripts/validar.mjs` (CI also runs `tsc` on `testes/*`, oxlint, oxfmt and
  `renovate-config-validator --strict`).
- Git: `main` only, no force-push, no skipped hooks; commits in Portuguese ending with
  `Co-Authored-By: Claude Opus 5.5 (1M context) <noreply@anthropic.com>`.
