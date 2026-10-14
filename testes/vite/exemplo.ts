import { defineUmpConfig, fmtNext, lintBase, type UmpPreset } from "@umporg/config/vite";

const preset: UmpPreset = "next";
const config = defineUmpConfig({ preset, lint: { ignorePatterns: [".next/**"] } });

export const usado: unknown[] = [config.lint, config.fmt, lintBase, fmtNext];
