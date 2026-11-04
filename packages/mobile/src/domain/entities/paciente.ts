import { Botao } from './botao';
import { Usuario } from './usuario';

export class Paciente extends Usuario {
  constructor(
    id: string,
    nome: string,
    senhaHash: string,
    private botoes: Botao[] = [],
  ) {
    super(id, nome, senhaHash, 'paciente');
  }

  obterBotoes(): Botao[] {
    return this.botoes;
  }
}
