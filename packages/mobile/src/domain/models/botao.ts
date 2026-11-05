export class Botao {
  constructor(
    public readonly id: string,
    public texto: string,
    public cor: string,
  ) {}

  pressionar(): { atencao: string; texto: string; cor: string } {
    const textoNormalizado = this.texto.trim();

    return {
      atencao: `ATENÇÃO       `,
      texto: textoNormalizado,
      cor: this.cor,
    };
  }
}
