import { existsSync } from "node:fs";
import { execFileSync } from "node:child_process";

// Em CI, Docker ou fora de um checkout git não há hooks para ativar.
if (process.env.CI === "true" || existsSync("/.dockerenv") || !existsSync(".git")) process.exit(0);

try {
  execFileSync("git", ["config", "core.hooksPath", ".githooks"], { stdio: "ignore" });
} catch {
  // sem git disponível: o hook fica por ativar, sem falhar a instalação
}
