# Migrar uma app Next para o Vite+ (receita do piloto mutual_portal)

Resultado do piloto em `mutual_portal` (vite-plus 1.2.0, `@umporg/config` v0.3.1, Windows, pnpm 12.11.2).
O Vite+ substitui `vitest`, `oxlint`, `oxfmt` e os três ficheiros de configuração; o Next continua a
fazer `dev`/`build`/`typegen`, e `tsc`, knip e Playwright ficam.

## Passos

1. **Ramo e referência.** Antes de mexer, guardar o que as ferramentas antigas dizem:
   `pnpm exec oxlint .`, `pnpm exec oxfmt --check .`, `pnpm exec vitest run` (anotar achados,
   ficheiros verificados e número de testes).
2. **Dependências.** `package.json`: `@umporg/config` para `#v0.3.1` (nunca v0.3.0: tem `prepare` e o
   pnpm recusa dependências git com scripts de ciclo de vida, `ERR_PNPM_GIT_DEP_PREPARE_NOT_ALLOWED`),
   mesma tag em `renovate.json`. Depois `pnpm add -D -E vite-plus@1.2.0` **sem** `--ignore-workspace`.
3. **`vp migrate --no-interactive --no-agent --no-editor --no-hooks`** (flags confirmadas com
   `vp migrate --help`). Faz: remove `oxlint`, `oxfmt` e `vitest` das devDependencies, reescreve os
   scripts para `vp lint .`, `vp fmt .`, `vp fmt --check .`, `vp test run`, reescreve os imports
   `vitest` para `vite-plus/test` nos testes e em `vitest.config.*`, acrescenta `.vitest/` ao
   `.gitignore`, e escreve em `pnpm-workspace.yaml` o `catalog` (`vite` → `@voidzero-dev/vite-plus-core`,
   `vite-plus`), `overrides: vite@*: catalog:`, `peerDependencyRules` e as entradas
   `minimumReleaseAgeExclude` do `@voidzero-dev/*` e `vite-plus` (necessárias enquanto o pacote tem
   menos de um dia). Mantê-los: são o que o Vite+ documenta. `vite-plus` fica `catalog:` no
   `package.json`.
4. **Não converte** `.oxlintrc.json`, `.oxfmtrc.json` nem a config do vitest. Criar `vite.config.ts`:

   ```ts
   import { fileURLToPath } from "node:url";
   import { defineUmpConfig } from "@umporg/config/vite";
   import { defineConfig } from "vite-plus";

   export default defineConfig(
     defineUmpConfig({
       preset: "next",
       lint: { ignorePatterns: [".next/**", ".source/**", "out/**", "dist/**", "build/**", "coverage/**", "node_modules/**", "next-env.d.ts"] },
       resolve: { alias: { "@": fileURLToPath(new URL("./", import.meta.url)) } },
       test: { include: ["lib/**/*.test.ts"], environment: "node", server: { deps: { inline: ["@umporg/ui"] } } },
     }),
   );
   ```

   Passar à função só o que é da app (`ignorePatterns`, `test`, `resolve`, `staged`); `fmt` já traz
   `.next`, `.source`, `next-env.d.ts` e `sortTailwindcss`. Se a app tinha ajustes em `.oxlintrc.json`
   (regras, overrides), vão em `lint:` (listas concatenam, objetos fundem). O preset do lint não
   traz `ignorePatterns`: copiar os da app. Copiar a `include`/`environment`/`server.deps.inline` do
   `vitest.config.*` para `test`; depois apagar `vitest.config.*`, `.oxlintrc.json`, `.oxfmtrc.json`.
5. **Provar que nada mudou antes de apagar os JSON** (feito com os JSON ainda no sítio, via `-c`):
   - `vp lint -c .oxlintrc.json --format json .` contra `vp lint --format json .` com ficheiros de
     amostra cheios de infrações (`console.log`, `debugger`, `alert`, `var`, `==`, `autoFocus`,
     `await` em ciclo, variáveis sem uso, `<img>`) em `app/`, `lib/`, `scripts/`, `e2e/`, num `*.test.tsx`:
     72 diagnósticos iguais (ficheiro, regra, severidade, posição). Os JSON antigos só aceitam `-c`
     enquanto existirem; `oxlint --print-config` **não serve** (não resolve `extends`).
   - `vp fmt --check -c .oxfmtrc.json .` contra `vp fmt --check .`: mesma lista de ficheiros e mesma
     saída ao formatar (inclui a ordenação de classes Tailwind).
   - `vp test run`: o mesmo número de ficheiros e testes (28/242 no portal).
6. **Formatar o que o migrate escreveu**: `vp fmt pnpm-workspace.yaml` (usa aspas simples).
7. **Scripts** (o migrate já os põe): `lint`, `format`, `format:check`, `test`. Acrescentar
   `"lint:tipos": "vp lint --type-aware --type-check ."`.
8. **Hook.** Ver abaixo. **CI.** Ver abaixo.
9. **Knip, tsc, `next build`** ficam como estão (`vite.config.ts` é entrada automática do knip).
10. `pnpm install` no Dockerfile funciona sem alterações (o `pnpm-workspace.yaml` é copiado).

## Hooks: decisão

Escolhido: **manter `.githooks/pre-commit`** (já ativado pelo `prepare` com `core.hooksPath`) e chamar
`vp staged` dele, em vez de `vp config` + `.vite-hooks`. Razões: `vp config` não instala o despachante
quando já existe outro `core.hooksPath` (documentado), por isso seria preciso desfazer o caminho em
todos os clones; o `.githooks` já está em todos os repos e no Cérebro; não depende do `prepare`
correr o `vp`. `VP_GIT_HOOKS=0` é respeitado pelo nosso script (primeira linha).

`.githooks/pre-commit`: lista de ficheiros → secretlint em segundo plano (`node_modules/.bin/secretlint`,
não `pnpm exec`: poupa ~1 s) e `node_modules/.bin/vp staged` em primeiro plano; espera pelos dois.
Bloco `staged`: o código passa por `["vp fmt", "<comando do lint>"]` **em sequência** numa só chave, e
JSON/CSS/YAML só por `vp fmt`. Em chaves separadas o lint lia o ficheiro enquanto o fmt o reescrevia
(`no-empty-file` intermitente, visto no Cartão). Em CI o `prepare` não ativa o hook; em Docker não há `.git`.

Na máquina Windows do piloto um `node -e 0` custa 1,2 s: o commit de 1 ficheiro demora 6 a 8 s (mais com a
máquina carregada). Em Linux/CI é bastante menor.

## CI

Os passos chamam `pnpm lint`, `pnpm format:check`, `pnpm test`: não é preciso `setup-vp`; mantêm-se
`pnpm/action-setup` e `setup-node`. Só mudaram os nomes dos passos. Acrescentado
`pnpm lint:tipos` com `continue-on-error: true` (aviso).

## Type-aware (aviso)

`lint.options.typeAware`/`typeCheck` no `vite.config.ts` tornam **todos** os achados bloqueantes, por
isso ficou só como script `lint:tipos` (flags `--type-aware --type-check`). No portal: 5 s, sem
bloqueios no Windows (com stdin fechado, `< /dev/null`), 101 achados:
`no-unsafe-type-assertion` 54, `consistent-return` 13, `no-unnecessary-type-assertion` 10,
`no-base-to-string` 10, `TS7006`/`TS2550`/`TS2868` só em `scripts/gateway-local.ts` (o `tsconfig`
exclui `scripts`, por isso `tsc` não os vê), 1 `no-unnecessary-boolean-literal-compare`. Zero
diagnósticos TS fora de `scripts/`, tal como o `tsc`. `tsc --noEmit` continua obrigatório até haver uma
semana de diagnósticos iguais.

## Armadilhas encontradas

- **`@umporg/config` v0.3.0 não instala**: tinha `prepare` (hook). Corrigido em v0.3.1
  (`pnpm run hooks` ativa o hook deste repo). Aplica-se a qualquer dependência git: sem `prepare`,
  `install`, `postinstall`.
- **`pnpm install --ignore-workspace` ignora o `pnpm-workspace.yaml`**: perde `allowBuilds`
  (`ERR_PNPM_IGNORED_BUILDS` por `esbuild`, que o Vite+ traz) e `minimumReleaseAgeExclude`
  (`ERR_PNPM_MINIMUM_RELEASE_AGE_VIOLATION` para next 16.4.1, react 19.3.1, vite-plus). Usar
  `pnpm install` simples. O `CLAUDE.md` do workspace manda usar `--ignore-workspace`: rever.
- `vp lint` imprime uma nota (`you are running vp lint as a built-in command`) no stderr; ao usar
  `--format json` ou `--print-config` redirecionar `2>/dev/null`.
- Não correr `git stash` com o `node_modules` do ramo novo: o `pnpm <script>` reinstala as dependências
  do ramo antigo ao detetar o `package.json` diferente.
- O `vp` demora ~1,5 s a arrancar (carrega o `vite.config.ts`): agrupar tarefas, não encadear.
- Renovate: o grupo «Vite+» (`vite-plus`, `@voidzero-dev/**`) já existe no preset. Os grupos `vitest` e
  `oxc` **ficam** até à última app migrar e até o Cérebro (que usa `oxlint`/`oxfmt` diretos) decidir:
  retirá-los é a fase contract (v0.4.0, com a remoção dos JSON de oxlint/oxfmt). Com `catalog:` o
  Renovate lê o `pnpm-workspace.yaml`; confirmar na primeira PR que sobe `vite-plus` e o alias `vite`
  juntos.

## Não migrado

- `tsc --noEmit`: fica (item 10 do plano).
- `vp build`/`vp dev`/`vp run`/`vp pack`: o Next constrói; sem cache do Vite Task.
- `setup-vp` no CI: só quando um job chamar `vp` diretamente.
- Despachante `vp config`/`.vite-hooks`: ver «Hooks: decisão».
