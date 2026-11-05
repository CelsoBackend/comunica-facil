export const hashSenha = (senha: string): string => {
  let hash = 5381;

  for (let index = 0; index < senha.length; index += 1) {
    hash = (hash * 33) ^ senha.charCodeAt(index);
  }

  return `h${(hash >>> 0).toString(16)}`;
};
