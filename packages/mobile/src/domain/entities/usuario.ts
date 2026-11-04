export type TipoUsuario = 'paciente' | 'cuidador';

export class Usuario {
  constructor(
    public readonly id: string,
    public nome: string,
    public senhaHash: string,
    public tipo: TipoUsuario,
  ) {}

  criarConta(): Usuario {
    return this;
  }

  autenticar(senhaHashInformada: string): boolean {
    return this.senhaHash === senhaHashInformada;
  }
}
