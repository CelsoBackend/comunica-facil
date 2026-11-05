import { Botao } from './botao';
import { Paciente } from './paciente';
import { Usuario } from './usuario';

export class Cuidador extends Usuario {
  private modoEdicaoAtivo = false;

  constructor(id: string, nome: string, senhaHash: string) {
    super(id, nome, senhaHash, 'cuidador');
  }

  alterarMensagemBotao(botao: Botao, novoTexto: string): void {
    this.validarModoEdicao();
    botao.texto = novoTexto;
  }

  alterarCorBotao(botao: Botao, novaCor: string): void {
    this.validarModoEdicao();
    botao.cor = novaCor;
  }

  criarBotao(paciente: Paciente, texto: string, cor: string): Botao {
    this.validarModoEdicao();
    const novoBotao = new Botao(Date.now().toString(), texto, cor);
    paciente.obterBotoes().push(novoBotao);
    return novoBotao;
  }

  excluirBotao(paciente: Paciente, botaoId: string): void {
    this.validarModoEdicao();
    const botoesAtualizados = paciente.obterBotoes().filter((botao) => botao.id !== botaoId);
    paciente.obterBotoes().splice(0, paciente.obterBotoes().length, ...botoesAtualizados);
  }

  entrarModoEdicao(senhaHashInformada: string): boolean {
    this.modoEdicaoAtivo = this.autenticar(senhaHashInformada);
    return this.modoEdicaoAtivo;
  }

  sairModoEdicao(): void {
    this.modoEdicaoAtivo = false;
  }

  private validarModoEdicao(): void {
    if (!this.modoEdicaoAtivo) {
      throw new Error('Modo de edição inativo.');
    }
  }
}
