type Opcoes = { nome?: string };

export function saudar(opcoes: Opcoes): string {
  return `Olá, ${opcoes.nome ?? "mundo"} (Bun ${Bun.version})`;
}
