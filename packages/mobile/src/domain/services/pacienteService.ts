import { UsuarioRepository } from '@/data/repositories';
import { runMigrations } from '@/data/storage';
import { hashSenha } from '@/domain/security/utils/hash';
import { criarId } from './utils';
import { ResultadoOperacao, SENHA_MINIMA_CARACTERES } from './usuarioService';

const usuarioRepository = new UsuarioRepository();

export type ResultadoValidacaoPaciente =
  | { valido: true }
  | { valido: false; titulo: string; mensagem: string };

export class PacienteService {
  private readonly usuarioRepository = new UsuarioRepository();

  public validarPaciente(nome: string, senha: string): ResultadoValidacaoPaciente {
    if (!nome || !senha) {
      return { valido: false, titulo: 'Atenção', mensagem: 'Preencha nome e senha para criar a conta do paciente.' };
    }

    if (senha.length < SENHA_MINIMA_CARACTERES) {
      return {
        valido: false,
        titulo: 'Senha inválida',
        mensagem: `A senha deve ter pelo menos ${SENHA_MINIMA_CARACTERES} caracteres.`,
      };
    }

    return { valido: true };
  }

  public async criarPaciente(nome: string, senha: string): Promise<ResultadoOperacao> {
    await runMigrations();

    await usuarioRepository.create({
      id: criarId(),
      nome,
      senhaHash: hashSenha(senha),
      tipo: 'paciente',
      criadoEm: new Date().toISOString(),
    });

    return { sucesso: true };
  }

  public async buscarPaciente() {
    await runMigrations();
    return this.usuarioRepository.findByTipo('paciente');
  }
}
