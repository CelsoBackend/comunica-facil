export type TipoUsuario = 'paciente' | 'cuidador';

export class Usuario {
  constructor(
    public readonly id: string,
    public nome: string,
    public email: string,
    public senhaHash: string,
  ) {}


  login(): Usuario {
    return this;
  }
}
