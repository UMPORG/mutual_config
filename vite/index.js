// Presets de lint (oxlint) e formatação (oxfmt) já fundidos, para o bloco `lint`/`fmt` do
// vite.config.ts do Vite+. Sem `extends` (o bloco não herda ficheiros), sem TypeScript (o Node
// recusa type-stripping dentro de node_modules) e sem dependências.
// Fonte de verdade durante a fase expand: oxlint/*.json e oxfmt/*.json; `scripts/validar.mjs`
// falha se este ficheiro divergir deles.

const regrasBase = {
  "no-console": "deny",
  "no-debugger": "deny",
  "no-alert": "deny",
  "no-var": "deny",
  "prefer-const": "deny",
  eqeqeq: ["deny", "always", { null: "ignore" }],
  "no-underscore-dangle": "off",
  "capitalized-comments": "off",
};

const sobreposicoesBase = [
  {
    files: [
      "scripts/**",
      "lib/logger.ts",
      "src/lib/logger.ts",
      "drizzle.config.ts",
      "db/migrate.ts",
      "db/seed.ts",
    ],
    rules: { "no-console": "off" },
  },
  {
    files: [
      "**/__tests__/**",
      "**/*.test.{ts,tsx}",
      "**/*.spec.{ts,tsx}",
      "tests/**",
      "e2e/**",
      "scripts/**",
    ],
    rules: {
      "no-console": "off",
      "no-await-in-loop": "off",
      "unicorn/consistent-function-scoping": "off",
    },
  },
];

export const lintBase = {
  env: { node: true, es2024: true },
  categories: { correctness: "deny", suspicious: "deny" },
  rules: regrasBase,
  overrides: sobreposicoesBase,
};

export const lintNext = {
  env: { browser: true, node: true, es2024: true },
  plugins: ["typescript", "unicorn", "oxc", "react", "jsx-a11y", "nextjs"],
  categories: { correctness: "deny", suspicious: "deny", perf: "deny" },
  rules: {
    ...regrasBase,
    "react/react-in-jsx-scope": "off",
    "react/no-unstable-nested-components": "off",
    "jsx-a11y/no-autofocus": "deny",
  },
  overrides: sobreposicoesBase,
};

// O Cérebro (Bun) usa hoje só o preset base.
export const lintBun = lintBase;

const fmtComum = {
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  singleQuote: false,
  jsxSingleQuote: false,
  semi: true,
  trailingComma: "all",
  bracketSpacing: true,
  endOfLine: "lf",
  insertFinalNewline: true,
};

const ignorarComum = [
  "dist/**",
  "build/**",
  "out/**",
  "coverage/**",
  "node_modules/**",
  "drizzle/meta/**",
  "playwright-report/**",
  "test-results/**",
  "**/*.md",
  "**/*.mdx",
];

export const fmtBase = { ...fmtComum, ignorePatterns: ignorarComum };

export const fmtNext = {
  ...fmtComum,
  ignorePatterns: [".next/**", ".next-e2e/**", ".source/**", "next-env.d.ts", ...ignorarComum],
  sortTailwindcss: { stylesheet: "./app/globals.css", functions: ["cn", "cva"] },
};

export const fmtBun = fmtBase;

const predefinicoes = {
  base: { lint: lintBase, fmt: fmtBase },
  next: { lint: lintNext, fmt: fmtNext },
  bun: { lint: lintBun, fmt: fmtBun },
};

const ehObjeto = (v) => typeof v === "object" && v !== null && !Array.isArray(v);

// Listas concatenam (ignorePatterns, overrides, plugins), objetos fundem em profundidade,
// escalares da app ganham ao preset.
function fundir(base, extra) {
  if (extra === undefined) return base;
  if (Array.isArray(base) && Array.isArray(extra)) return [...base, ...extra];
  if (ehObjeto(base) && ehObjeto(extra)) {
    const saida = { ...base };
    for (const [chave, valor] of Object.entries(extra)) saida[chave] = fundir(base[chave], valor);
    return saida;
  }
  return extra;
}

/**
 * Devolve a configuração para `defineConfig` do Vite+ com `lint` e `fmt` do preset escolhido,
 * fundidos com os ajustes da app. Não importa `vite-plus`: quem chama envolve o resultado.
 */
export function defineUmpConfig({ preset = "next", lint, fmt, ...resto } = {}) {
  const escolhido = predefinicoes[preset];
  if (!escolhido) throw new Error(`@umporg/config/vite: preset desconhecido «${preset}»`);
  return {
    ...resto,
    lint: fundir(structuredClone(escolhido.lint), lint),
    fmt: fundir(structuredClone(escolhido.fmt), fmt),
  };
}
