import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ignorar = new Set(["node_modules", ".git"]);
const erros = [];

function listarJson(dir) {
  return readdirSync(dir).flatMap((nome) => {
    if (ignorar.has(nome)) return [];
    const caminho = join(dir, nome);
    if (statSync(caminho).isDirectory()) return listarJson(caminho);
    return nome.endsWith(".json") ? [caminho] : [];
  });
}

const ficheiros = new Map();
for (const ficheiro of listarJson(raiz)) {
  try {
    ficheiros.set(ficheiro, JSON.parse(readFileSync(ficheiro, "utf8")));
  } catch (erro) {
    erros.push(`${relative(raiz, ficheiro)}: JSON inválido (${erro.message})`);
  }
}

for (const [ficheiro, conteudo] of ficheiros) {
  const alvo = conteudo?.extends;
  const lista = Array.isArray(alvo) ? alvo : typeof alvo === "string" ? [alvo] : [];
  for (const caminho of lista) {
    if (!caminho.startsWith(".")) continue;
    if (!existsSync(resolve(dirname(ficheiro), caminho))) {
      erros.push(`${relative(raiz, ficheiro)}: extends "${caminho}" não existe`);
    }
  }
}

const versoes = ficheiros.get(join(raiz, "versoes.json"));
const obrigatorios = [
  "typescript",
  "next",
  "react",
  "react-dom",
  "better-auth",
  "zod",
  "effect",
  "xstate",
  "vitest",
  "oxlint",
  "oxfmt",
  "@types/node",
  "tailwindcss",
  "@playwright/test",
];
for (const nome of obrigatorios) {
  if (typeof versoes?.pacotes?.[nome]?.versao !== "string") {
    erros.push(`versoes.json: falta pacotes["${nome}"].versao`);
  }
}
const nvmrc = readFileSync(join(raiz, ".nvmrc"), "utf8").trim();
if (versoes?.runtime?.node?.versao !== nvmrc) {
  erros.push(
    `.nvmrc (${nvmrc}) difere de versoes.json runtime.node.versao (${versoes?.runtime?.node?.versao})`,
  );
}
const pacote = ficheiros.get(join(raiz, "package.json"));
if (pacote?.version !== versoes?.pacotes?.["@umporg/config"]?.versao) {
  erros.push('package.json version difere de versoes.json pacotes["@umporg/config"].versao');
}
if (pacote?.packageManager !== versoes?.runtime?.pnpm?.packageManager) {
  erros.push("package.json packageManager difere de versoes.json runtime.pnpm.packageManager");
}
const majorTiposNode = versoes?.pacotes?.["@types/node"]?.versao?.split(".")[0];
if (majorTiposNode !== nvmrc.split(".")[0]) {
  erros.push(`@types/node (${majorTiposNode}) não acompanha o major do Node (${nvmrc})`);
}

// O oxfmt não tem extends: .oxfmtrc.json tem de igualar oxfmt/base.json.
const oxfmtLocal = ficheiros.get(join(raiz, ".oxfmtrc.json"));
const oxfmtBase = ficheiros.get(join(raiz, "oxfmt", "base.json"));
if (JSON.stringify(oxfmtLocal) !== JSON.stringify(oxfmtBase)) {
  erros.push(".oxfmtrc.json difere de oxfmt/base.json");
}

if (erros.length > 0) {
  for (const erro of erros) process.stderr.write(`✗ ${erro}\n`);
  process.exit(1);
}
process.stdout.write(`✓ ${ficheiros.size} ficheiros JSON válidos\n`);
