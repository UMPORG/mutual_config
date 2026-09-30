# @umporg/config

Configurações partilhadas pelos repositórios MUTU@L: preset do **Renovate**, **tsconfig**,
**oxlint**, **oxfmt**, **knip**, as **versões-alvo** alinhadas (`versoes.json`) e o `.nvmrc`.

Repositório público, consumido como dependência git (não é publicado no npm), tal como o
`@umporg/ui`:

```jsonc
// package.json da app
"devDependencies": {
  "@umporg/config": "github:UMPORG/mutual_config#v0.1.0"
}
```

```sh
pnpm add -D github:UMPORG/mutual_config#v0.1.0   # apps Next (pnpm)
bun add -d github:UMPORG/mutual_config#v0.1.0    # mutual_cerebro (Bun)
```

O pacote não tem código nem dependências: só ficheiros JSON. Cada app continua a ter os seus
próprios ficheiros de configuração, que **estendem** (ou, quando a ferramenta não o permite,
**copiam**) os presets daqui.

| Ficheiro | Para quê | Como a app o usa |
|---|---|---|
| `default.json`, `renovate/default.json` | Preset Renovate | `renovate.json` com `extends` |
| `tsconfig/base.json`, `next.json`, `bun.json`, `estrito.json` | TypeScript | `tsconfig.json` com `extends` |
| `oxlint/base.json`, `oxlint/next.json` | Lint | `.oxlintrc.json` com `extends` |
| `oxfmt/base.json`, `oxfmt/next.json` | Formatação | copiar para `.oxfmtrc.json` (o oxfmt não suporta `extends`) |
| `knip/next.json`, `knip/bun.json` | Código e dependências mortas | `knip.ts` que importa o JSON (ou cópia) |
| `versoes.json` | Versões-alvo alinhadas | referência para as subidas; o Renovate mantém depois |
| `.nvmrc` | Versão do Node | copiar para a raiz da app |

---

## Renovate

`renovate.json` na raiz de cada repositório:

```json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": ["github>UMPORG/mutual_config#v0.1.0"]
}
```

`github>UMPORG/mutual_config` carrega o `default.json` da raiz, que por sua vez estende
`renovate/default.json`. Fixar a tag (`#v0.1.0`) é opcional mas recomendado: o próprio Renovate
propõe a subida da tag quando sair uma nova versão deste repositório.

O que o preset faz:

- **Horário:** semanal, segunda-feira entre as 00h00 e as 07h00 (`Europe/Lisbon`).
- **Títulos dos PR em pt-PT** com prefixo `chore(deps):` (ex.: `chore(deps): atualizar next para v16.3.7`,
  `chore(deps): atualizar Next.js e React`, `chore(deps): manutenção do lockfile`).
- **Grupos:** Next.js e React (`next`, `react`, `react-dom`, `@types/react*`,
  `babel-plugin-react-compiler`); Better Auth (`better-auth`, `@better-auth/*`); Effect (`effect`,
  `@effect/*`); Drizzle; XState; Vitest; oxc (`oxlint`, `oxfmt`); `@types/*`; Tailwind CSS;
  Playwright; Node.js; Bun.
- **Automerge** só de _patches_ e de _minor_ em `devDependencies`, e só com a CI verde
  (o Renovate nunca faz merge com checks a falhar).
- **Better Auth sem automerge:** servidor e clientes têm de ficar na mesma minor. Ordem: primeiro o
  Cérebro (com `better-auth migrate`), depois as apps.
- **Effect 4 RC:** o grupo aceita pré-versões (`rc`), fixa a versão exata e não faz automerge.
- **Majors que pedem aprovação no Painel de dependências:** TypeScript (7.0), Node.js, Bun e pnpm.
  `@types/node` fica limitado a `<25` (acompanha o Node 24).
- **Segurança:** alertas de vulnerabilidade (GitHub + OSV) criam PR **imediatamente**, fora do horário
  e sem esperar maturação.
- **Maturação:** 3 dias para versões novas do npm (proteção contra pacotes comprometidos), exceto
  `@umporg/*`.
- **`@umporg/*`** (dependências `github:UMPORG/...#vX.Y.Z`) são seguidas por **tag**, a qualquer hora.
- **Docker:** digests fixados (`docker:pinDigests`).
- **Ficheiros de versão:** `.nvmrc`, `.node-version`, `.bun-version`, `engines`, `packageManager`
  e imagens Docker `node`/`oven/bun` são atualizados pelos grupos Node.js e Bun.
- **Manutenção do lockfile** mensal (dia 1, de madrugada).
- **Painel de dependências** ligado (issue "Painel de dependências (Renovate)").

Pré-requisito: a GitHub App do Renovate instalada na organização UMPORG com acesso aos repositórios.

---

## TypeScript

Presets:

- `tsconfig/base.json` — o denominador comum de todos: `strict`, **`noUncheckedIndexedAccess`**,
  `noImplicitOverride`, `noFallthroughCasesInSwitch`, `isolatedModules`, `moduleResolution: bundler`,
  `module: esnext`, `target: ES2022`, `skipLibCheck`, `resolveJsonModule`.
- `tsconfig/next.json` — base + DOM, `jsx: react-jsx`, `allowJs`, `noEmit`, `incremental`, plugin
  `next` e `types: ["node"]`.
- `tsconfig/bun.json` — base + `exactOptionalPropertyTypes`, `target/lib: ESNext`, `types: ["bun"]`,
  `noEmit` (é o que o Cérebro já usa).
- `tsconfig/estrito.json` — camada opcional que só liga `exactOptionalPropertyTypes`.

App Next (`tsconfig.json`):

```json
{
  "extends": "@umporg/config/tsconfig/next.json",
  "compilerOptions": {
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts", ".next/dev/types/**/*.ts"],
  "exclude": ["node_modules", "e2e", "playwright.config.ts", "playwright-report", "test-results"]
}
```

Para ligar também `exactOptionalPropertyTypes`:
`"extends": ["@umporg/config/tsconfig/next.json", "@umporg/config/tsconfig/estrito.json"]`.

Cérebro (`tsconfig.json`):

```json
{
  "extends": "@umporg/config/tsconfig/bun.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "hono/jsx",
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

Regras:

- **`paths`, `include`, `exclude`, `outDir` e `rootDir` ficam sempre na app**: o TypeScript resolve-os
  em relação ao ficheiro que os declara, por isso não podem vir do preset.
- **Sem `baseUrl`** (deprecado no TypeScript 6; `paths` funciona sem ele).
- `types` é explícito porque no TypeScript 6 o valor por omissão passou a `[]`. Uma app que use
  globais do Vitest junta-os: `"types": ["node", "vitest/globals"]`.
- Versão-alvo do TypeScript: a de `versoes.json`. O 7.0 (compilador nativo) mede-se primeiro num ramo.

`exactOptionalPropertyTypes` fica fora da base (em `estrito.json`) porque ligá-lo nas apps Next custa
dezenas a centenas de erros; é recomendado onde já está perto de zero.

---

## oxlint

`.oxlintrc.json` da app Next:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "extends": ["./node_modules/@umporg/config/oxlint/next.json"],
  "ignorePatterns": [
    ".next/**",
    "out/**",
    "dist/**",
    "build/**",
    "coverage/**",
    "node_modules/**",
    "next-env.d.ts",
    "playwright-report/**",
    "test-results/**"
  ]
}
```

Cérebro: `"extends": ["./node_modules/@umporg/config/oxlint/base.json"]` e
`"ignorePatterns": ["dist/**", "build/**", "coverage/**", "node_modules/**", "drizzle/meta/**"]`.

Importante:

- O `extends` do oxlint é um **caminho relativo ao ficheiro**, não um nome de pacote.
- **`ignorePatterns` não é herdado** (verificado com o oxlint 1.85): cada app declara os seus.
- Os `overrides` herdados funcionam com caminhos relativos à raiz da app.
- A app pode acrescentar `rules`/`overrides` próprios (ex.: `no-console: off` num ficheiro concreto),
  sempre com um comentário a justificar.

Decisões do preset: `correctness` + `suspicious` em `deny` na base; `perf` e os plugins `react`,
`jsx-a11y`, `nextjs` só no preset `next`; categoria `style` fora (opt-in por app); `eqeqeq` com
`{ "null": "ignore" }`; `no-console`/`no-await-in-loop` desligados em scripts, testes e loggers. Uma
regra que não sirva uma app desliga-se localmente com justificação; se valer para todas, PR aqui.

---

## oxfmt

O oxfmt não suporta `extends`. Copiar o preset para `.oxfmtrc.json` na raiz da app e acrescentar
só `ignorePatterns` específicos:

```sh
cp node_modules/@umporg/config/oxfmt/next.json .oxfmtrc.json   # apps Next
cp node_modules/@umporg/config/oxfmt/base.json .oxfmtrc.json   # Cérebro
```

- Todas as configurações existentes eram **idênticas** nas opções (`printWidth: 100`, 2 espaços,
  aspas duplas, `;`, `trailingComma: all`, LF, newline final); o preset mantém-nas.
- `oxfmt/next.json` liga **`sortTailwindcss`** (o mesmo algoritmo do `prettier-plugin-tailwindcss`)
  com `stylesheet: ./app/globals.css` e as funções `cn`/`cva`. A primeira execução reordena classes:
  fazer um commit só de formatação.
- Markdown (`**/*.md`) continua fora da formatação, como já estava.

---

## knip

O knip não tem `extends` em JSON. Recomendado: `knip.ts` que importa o preset.

```ts
// knip.ts (app Next)
import type { KnipConfig } from "knip";
import base from "@umporg/config/knip/next.json" with { type: "json" };

export default {
  ...base,
  ignoreDependencies: [...base.ignoreDependencies /* , "exceção-justificada" */],
} satisfies KnipConfig;
```

Cérebro: o mesmo com `@umporg/config/knip/bun.json`. Em alternativa, copiar o JSON para `knip.json`.

- `knip/next.json`: entradas do App Router (páginas, layouts, `route.ts`, imagens OG, `sitemap`,
  `robots`, `manifest`), `proxy.ts`, `instrumentation.ts`, `instrumentation-client.ts`,
  `mdx-components.tsx`/`source.config.ts` (portal), `scripts/**`, `*.worker.ts`, `db/migrate.ts` e
  `db/seed.ts` (Saúde), testes Vitest (`*.test.ts(x)`, `__tests__`, `vitest.*.config.ts`) e
  Playwright (`e2e/**`, `tests/e2e/**`). O CSS entra no projeto para que os `@import` do Tailwind
  (ex.: `tw-animate-css`, `@umporg/ui/css`) contem como uso.
- `knip/bun.json`: `src/index.ts`, `scripts/**`, `drizzle.config.ts` e os testes `bun test`.
- Script e CI: `"knip": "knip"`; na CI começar com `knip --no-exit-code` (aviso) e passar a bloqueante
  quando a app estiver limpa.
- Mocks de e2e carregados só pelo `webServer` do Playwright (ex.: `e2e/mock-cerebro.mjs`) aparecem
  como ficheiros não usados: acrescentá-los a `entry` na app.

---

## Node, Bun e pnpm

- `.nvmrc`: copiar o deste repositório (`24.21.0`, Node 24 LTS "Krypton").
- `package.json` das apps:
  ```json
  "engines": { "node": ">=24.21.0 <25" },
  "packageManager": "pnpm@10.34.5"
  ```
  e `engine-strict=true` no `.npmrc`.
- Docker: `FROM node:24-alpine` (o Renovate fixa o digest). CI: `actions/setup-node` com
  `node-version-file: .nvmrc`.
- Cérebro: `.bun-version` com `1.4.2`, `"packageManager": "bun@1.4.2"`, `"engines": { "bun": ">=1.4.2" }`,
  `FROM oven/bun:1.4.2-alpine`, `oven-sh/setup-bun` com `bun-version-file: .bun-version`,
  `@types/bun` fixo em `1.4.2`.

---

## Versões-alvo (`versoes.json`)

O ficheiro é a fonte (versão e nota por pacote). Depois da adoção, é o Renovate que as mantém.
Quando uma versão-alvo mudar por decisão (ex.: Node 26 LTS, TypeScript 7), atualiza-se aqui, no
`.nvmrc` e no preset Renovate, e sai uma nova tag.

---

## Manutenção deste repositório

- `node scripts/validar.mjs` — JSON válido, `extends` locais existentes, coerência entre
  `versoes.json`, `.nvmrc` e `package.json`.
- A CI (`.github/workflows/ci.yml`) corre ainda: `tsc` sobre `testes/next` e `testes/bun`
  (os presets compilam), oxlint com o preset `next`, oxfmt com o preset `base` e o
  `renovate-config-validator --strict`.
- Nova versão: atualizar `version` no `package.json` e `pacotes["@umporg/config"]` no `versoes.json`,
  commit, `git tag vX.Y.Z`, `git push origin main --tags`. As apps sobem a tag na dependência (o
  Renovate propõe-no).
