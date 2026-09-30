# @umporg/config

Configurações partilhadas pelos repositórios MUTU@L: preset do **Renovate**, **tsconfig**,
**oxlint**, **oxfmt**, **knip**, as **versões-alvo** alinhadas (`versoes.json`) e o `.nvmrc`.

Repositório público, consumido como dependência git (não é publicado no npm), tal como o
`@umporg/ui`:

```jsonc
// package.json da app
"devDependencies": {
  "@umporg/config": "github:UMPORG/mutual_config#vX.Y.Z"
}
```

```sh
pnpm add -D github:UMPORG/mutual_config#vX.Y.Z   # apps Next (pnpm)
bun add -d github:UMPORG/mutual_config#vX.Y.Z    # mutual_cerebro (Bun)
```

`vX.Y.Z` é a tag atual: `pacotes["@umporg/config"].versao` em `versoes.json`.

O pacote publicado não tem código nem dependências: só ficheiros JSON (`scripts/` e `testes/`
servem só a CI deste repositório). Cada app continua a ter os seus próprios ficheiros de
configuração, que **estendem** (ou, quando a ferramenta não o permite, **copiam**) os presets daqui.

O `mutual_cerebro` ainda não depende deste pacote: mantém cópias equivalentes dos presets em
`config/`. Os exemplos «Cérebro» abaixo mostram como fica quando o adotar.

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
  "extends": ["github>UMPORG/mutual_config#vX.Y.Z"]
}
```

`github>UMPORG/mutual_config` carrega o `default.json` da raiz, que por sua vez estende
`renovate/default.json`. Fixar a tag (`#vX.Y.Z`) é opcional mas recomendado: o próprio Renovate
propõe a subida da tag quando sair uma nova versão deste repositório.

O que o preset faz:

- **Horário:** semanal, segunda-feira entre as 00h00 e as 07h00 (`Europe/Lisbon`).
- **Títulos dos PR em pt-PT** com prefixo `chore(deps):` (ex.: `chore(deps): atualizar Next.js e React`,
  `chore(deps): manutenção do lockfile`).
- **Grupos:** Next.js e React (`next`, `react`, `react-dom`, `@types/react*`,
  `babel-plugin-react-compiler`); Better Auth (`better-auth`, `@better-auth/*`); Effect (`effect`,
  `@effect/*`); Drizzle; XState; Vitest; oxc (`oxlint`, `oxfmt`); `@types/*`; Tailwind CSS;
  Playwright; Node.js; Bun.
- **Automerge** só de _patches_ e de _minor_ em `devDependencies`, e só com a CI verde
  (o Renovate nunca faz merge com checks a falhar).
- **Better Auth sem automerge:** servidor e clientes têm de ficar na mesma minor. Ordem: primeiro o
  Cérebro (com `better-auth migrate`), depois as apps.
- **Effect 4 RC:** o grupo aceita pré-versões (`rc`), fixa a versão exata e não faz automerge.
- **Majors que pedem aprovação no Painel de dependências:** TypeScript, Node.js, Bun e pnpm.
  `@types/node` fica limitado a `<25` (acompanha o Node 24).
- **Segurança:** alertas de vulnerabilidade (GitHub + OSV) criam PR **imediatamente**, fora do horário
  e sem esperar maturação.
- **Maturação:** 3 dias para versões novas do npm (proteção contra pacotes comprometidos), exceto
  `@umporg/*`.
- **`@umporg/*`** (dependências `github:UMPORG/...#vX.Y.Z`) são seguidas por **tag**, a qualquer hora.
- **Docker:** digests fixados (`docker:pinDigests`).
- **Ficheiros de versão:** `.nvmrc`, `.node-version`, `.bun-version`, `engines`, o `packageManager`
  do Bun e as imagens Docker `node`/`oven/bun` são atualizados pelos grupos Node.js e Bun (o pnpm
  não tem grupo; só o major pede aprovação).
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
  `noEmit` (as mesmas opções das cópias em `config/` do Cérebro).
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
- `types` é explícito porque no TypeScript 6 o valor por omissão é `[]`. Uma app que use
  globais do Vitest junta-os: `"types": ["node", "vitest/globals"]`.
- Versão-alvo do TypeScript: a de `versoes.json` (a nota explica porque o major seguinte espera).

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
- **`ignorePatterns` não é herdado** (verificado): cada app declara os seus.
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

- Opções comuns aos dois presets: `printWidth: 100`, 2 espaços, aspas duplas, `;`,
  `trailingComma: all`, LF, newline final.
- `oxfmt/next.json` liga **`sortTailwindcss`** (o mesmo algoritmo do `prettier-plugin-tailwindcss`)
  com `stylesheet: ./app/globals.css` e as funções `cn`/`cva`. A primeira execução reordena classes:
  fazer um commit só de formatação.
- Markdown (`**/*.md`) fica fora da formatação (`ignorePatterns`).

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

Os valores vêm de `versoes.json` (`runtime.*`); não se repetem aqui para não divergirem.

- `.nvmrc`: copiar o deste repositório.
- `package.json` das apps: `"engines": { "node": "<runtime.node.engines>" }`,
  `"packageManager": "<runtime.pnpm.packageManager>"` e `engine-strict=true` no `.npmrc`.
- Docker: `FROM <runtime.node.docker>` (o Renovate fixa o digest). CI: `actions/setup-node` com
  `node-version-file: .nvmrc`.
- Cérebro: `.bun-version` com `runtime.bun.versao`, `"packageManager": "bun@<versão>"`,
  `"engines": { "bun": "<runtime.bun.engines>" }`, `FROM <runtime.bun.docker>`, `oven-sh/setup-bun`
  com `bun-version-file: .bun-version`, `@types/bun` fixo na mesma versão (nunca `latest`).

---

## Versões-alvo (`versoes.json`)

O ficheiro é a fonte (versão e nota por pacote); depois da adoção é o Renovate que as mantém.
Mudar uma versão-alvo por decisão: ver [CLAUDE.md](CLAUDE.md).

---

## Manutenção deste repositório

- `node scripts/validar.mjs` — JSON válido, `extends` locais existentes, coerência entre
  `versoes.json`, `.nvmrc` e `package.json`.
- A CI (`.github/workflows/ci.yml`) corre ainda: `tsc` sobre `testes/next` e `testes/bun`
  (os presets compilam), oxlint com o preset `next`, oxfmt com o preset `base` e o
  `renovate-config-validator --strict`.
- Nova versão (tag): procedimento em [CLAUDE.md](CLAUDE.md).
