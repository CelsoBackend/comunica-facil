import { Usuario } from './usuario';

export class Paciente extends Usuario {
  constructor(
    id: string,
    nome: string,
    senhaHash: string,
  ) {
    super(id, nome, senhaHash, 'paciente');
  }
}
