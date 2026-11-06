import {BotaoRepository, BotaoEntity} from '@/data/repositories';
import {criarId} from './utils';


export const COR_PADRAO_BOTAO = '#86EFAC';
export const BOTOES_PADRAO = [
    {texto: 'Sim', cor: '#86EFAC'},
    {texto: 'Não', cor: '#FCA5A5'},
    {texto: 'Sede', cor: '#60A5FA'},
    {texto: 'Fome', cor: '#FB923C'},
    {texto: 'Banheiro', cor: '#92400E'},
    {texto: 'Dor', cor: '#EF4444'},
    {texto: 'Trocar Fralda', cor: '#A78BFA'},
    {texto: 'Mudar de Posição', cor: '#F9A8D4'},
    {texto: 'Trocar Canal', cor: '#8B5CF6'},
    {texto: 'Obrigado', cor: '#7DD3FC'},
    {texto: 'Desculpe', cor: '#FDE68A'},
] as const;

export class BotaoService {
    public botaoRepository = new BotaoRepository();

    public async buscarBotoesAtivos(): Promise<BotaoEntity[]> {
        return this.botaoRepository.findAll(true);
    };

    public async criarBotao(
        texto: string,
        cor: string,
        ordemAtual: number,
    ): Promise<void> {
        const agora = new Date().toISOString();
        await this.botaoRepository.create({
            id: criarId(),
            texto,
            cor,
            ordem: ordemAtual +1,
            ativo: true,
            criadoEm: agora,
            atualizadoEm: agora,
        });
    };

    public async atualizarBotao(
        botaoAtual: BotaoEntity,
        texto: string,
        cor: string,
    ): Promise<void> {
        await this.botaoRepository.update({
            ...botaoAtual,
            texto,
            cor,
            atualizadoEm: new Date().toISOString(),
        });
    };

    public async excluirBotaoEReordenar(id: string): Promise<void> {
        await this.botaoRepository.delete(id);
        const restantes = (await this.botaoRepository.findAll(true)).sort((a, b) => a.ordem - b.ordem);

        for (let index = 0; index < restantes.length; index += 1) {
            const item = restantes[index];
            const novaOrdem = index + 1;

            if (item.ordem !== novaOrdem) {
                await this.botaoRepository.update({
                    ...item,
                    ordem: novaOrdem,
                    atualizadoEm: new Date().toISOString(),
                });
            }
        }
    };

    public async moverBotao(
        botoes: BotaoEntity[],
        id: string,
        direcao: 'up' | 'down',
    ): Promise<void> {
        const indiceAtual = botoes.findIndex((item) => item.id === id);
        if (indiceAtual === -1) return;

        const indiceDestino = direcao === 'up' ? indiceAtual - 1 : indiceAtual + 1;
        if (indiceDestino < 0 || indiceDestino >= botoes.length) return;

        const reordenados = [...botoes];
        const [movido] = reordenados.splice(indiceAtual, 1);
        reordenados.splice(indiceDestino, 0, movido);

        const agora = new Date().toISOString();
        for (let index = 0; index < reordenados.length; index += 1) {
            const item = reordenados[index];
            const novaOrdem = index + 1;

            if (item.ordem !== novaOrdem) {
                await this.botaoRepository.update({
                    ...item,
                    ordem: novaOrdem,
                    atualizadoEm: agora,
                });
            }
        }
    };

    public validarCorHex(cor: string): boolean {
        return /^#[0-9A-Fa-f]{6}$/.test(cor.trim());
    };

    public garantirBotoesPadrao = async (): Promise<void> => {
        const existentes = await this.botaoRepository.findAll(false);

        if (existentes.length > 0) {
            return;
        }

        const agora = new Date().toISOString();
        for (let index = 0; index < BOTOES_PADRAO.length; index += 1) {
            const item = BOTOES_PADRAO[index];
            await this.botaoRepository.create({
                id: criarId(),
                texto: item.texto,
                cor: item.cor,
                ordem: index + 1,
                ativo: true,
                criadoEm: agora,
                atualizadoEm: agora,
            });
        }
    };
}


