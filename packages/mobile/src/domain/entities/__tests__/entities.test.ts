import { Botao } from '../botao';
import { Cuidador } from '../cuidador';
import { Paciente } from '../paciente';
import { Usuario } from '../usuario';

describe('Entidades de domínio', () => {
  it('deve autenticar usuário com hash correto', () => {
    const usuario = new Usuario('u-1', 'Paciente', 'hash-123', 'paciente');

    expect(usuario.autenticar('hash-123')).toBe(true);
    expect(usuario.autenticar('hash-errado')).toBe(false);
  });

  it('deve retornar payload esperado ao pressionar botão', () => {
    const botao = new Botao('b-1', 'SIM', '#22c55e');

    expect(botao.pressionar()).toEqual({
      texto: 'SIM',
      cor: '#22c55e',
    });
  });

  it('deve permitir entrar no modo edição com credencial válida', () => {
    const cuidador = new Cuidador('c-1', 'Cuidador', 'hash-certo');

    expect(cuidador.entrarModoEdicao('hash-certo')).toBe(true);
    expect(cuidador.entrarModoEdicao('hash-errado')).toBe(false);
  });

  it('deve bloquear CRUD de botões quando modo edição está inativo', () => {
    const paciente = new Paciente('p-1', 'Paciente', 'hash-paciente');
    const cuidador = new Cuidador('c-1', 'Cuidador', 'hash-certo');

    expect(() => cuidador.criarBotao(paciente, 'ÁGUA', '#2563eb')).toThrow('Modo de edição inativo.');
  });

  it('deve gerenciar ciclo de vida de botão no modo edição ativo', () => {
    const paciente = new Paciente('p-1', 'Paciente', 'hash-paciente');
    const cuidador = new Cuidador('c-1', 'Cuidador', 'hash-certo');
    cuidador.entrarModoEdicao('hash-certo');

    const botao = cuidador.criarBotao(paciente, 'NÃO', '#ef4444');
    expect(paciente.obterBotoes()).toHaveLength(1);

    cuidador.alterarMensagemBotao(botao, 'AJUDA');
    cuidador.alterarCorBotao(botao, '#f97316');
    expect(paciente.obterBotoes()[0]).toMatchObject({ texto: 'AJUDA', cor: '#f97316' });

    cuidador.excluirBotao(paciente, botao.id);
    expect(paciente.obterBotoes()).toHaveLength(0);

    cuidador.sairModoEdicao();
    expect(() => cuidador.criarBotao(paciente, 'SIM', '#22c55e')).toThrow('Modo de edição inativo.');
  });
});
