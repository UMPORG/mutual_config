/** Bloco `lint` do Vite+ (Oxlint). Tipado de forma larga: o esquema vive em `vite-plus`. */
export type UmpLintConfig = Record<string, unknown>;
/** Bloco `fmt` do Vite+ (Oxfmt). */
export type UmpFmtConfig = Record<string, unknown>;

export type UmpPreset = "base" | "next" | "bun";

export const lintBase: UmpLintConfig;
export const lintNext: UmpLintConfig;
export const lintBun: UmpLintConfig;
export const fmtBase: UmpFmtConfig;
export const fmtNext: UmpFmtConfig;
export const fmtBun: UmpFmtConfig;

export interface UmpConfigOptions {
  /** Predefinição; por omissão `next`. */
  preset?: UmpPreset;
  /** Ajustes da app fundidos no preset (listas concatenam, objetos fundem). */
  lint?: UmpLintConfig;
  fmt?: UmpFmtConfig;
  [outra: string]: unknown;
}

export function defineUmpConfig(opcoes?: UmpConfigOptions): Record<string, unknown> & {
  lint: UmpLintConfig;
  fmt: UmpFmtConfig;
};
