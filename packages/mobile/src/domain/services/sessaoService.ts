import {SessaoRepository} from '@/data/repositories';

export const SESSAO_ID = 'principal';

export class SessaoService {
    private readonly sessaoRepository = new SessaoRepository();

    public async salvarSessaoAtiva(usuarioNome: string): Promise<void> {
        const agora = new Date().toISOString();
        const sessaoExistente = await this.sessaoRepository.findById(SESSAO_ID);

        await this.sessaoRepository.save({
            id: SESSAO_ID,
            ativa: true,
            usuarioNome,
            criadoEm: sessaoExistente?.criadoEm ?? agora,
            atualizadoEm: agora,
        });
    }

    public async encerrarSessao(): Promise<void> {
        const agora = new Date().toISOString();
        const sessaoExistente = await this.sessaoRepository.findById(SESSAO_ID);

        await this.sessaoRepository.save({
            id: SESSAO_ID,
            ativa: false,
            usuarioNome: null,
            criadoEm: sessaoExistente?.criadoEm ?? agora,
            atualizadoEm: agora,
        });
    }

    public async buscarSessaoAtiva() {
        return this.sessaoRepository.findById(SESSAO_ID);
    }
}
