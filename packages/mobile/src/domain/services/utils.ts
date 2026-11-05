export const criarId = (): string => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const getMensagemErro = (erro: unknown): string => {
  if (erro instanceof Error && erro.message.trim().length > 0) {
    return erro.message;
  }

  return 'Tente novamente em instantes.';
};
