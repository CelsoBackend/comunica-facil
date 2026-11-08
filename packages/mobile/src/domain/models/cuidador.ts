import { Usuario } from './usuario';

export class Cuidador extends Usuario {
  constructor(id: string, nome: string, senhaHash: string) {
    super(id, nome, senhaHash, 'cuidador');
  }
}
