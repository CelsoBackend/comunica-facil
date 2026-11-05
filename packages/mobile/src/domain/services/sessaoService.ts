import { SessaoRepository } from '@/data/repositories';

const sessaoRepository = new SessaoRepository();

export const SESSAO_ID = 'principal';

export const salvarSessaoAtiva = async (usuarioNome: string): Promise<void> => {
  const agora = new Date().toISOString();
  const sessaoExistente = await sessaoRepository.findById(SESSAO_ID);

  await sessaoRepository.save({
    id: SESSAO_ID,
    ativa: true,
    usuarioNome,
    criadoEm: sessaoExistente?.criadoEm ?? agora,
    atualizadoEm: agora,
  });
};

export const encerrarSessao = async (): Promise<void> => {
  const agora = new Date().toISOString();
  const sessaoExistente = await sessaoRepository.findById(SESSAO_ID);

  await sessaoRepository.save({
    id: SESSAO_ID,
    ativa: false,
    usuarioNome: null,
    criadoEm: sessaoExistente?.criadoEm ?? agora,
    atualizadoEm: agora,
  });
};

export const buscarSessaoAtiva = async () => {
  return sessaoRepository.findById(SESSAO_ID);
};
