const lista: readonly string[] = ["a"];
const primeiro = lista[0];

export function Exemplo(): React.JSX.Element | null {
  // noUncheckedIndexedAccess: `primeiro` é string | undefined.
  return primeiro === undefined ? null : <p>{primeiro.toUpperCase()}</p>;
}

export const ambiente: string | undefined = process.env["NODE_ENV"];
