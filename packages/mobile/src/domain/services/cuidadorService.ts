import { UsuarioRepository } from '@/data/repositories';
import { isEmailValido } from '@/domain/security/utils/email';
import { hashSenha } from '@/domain/security/utils/hash';
import { criarId } from './utils';
import { ResultadoOperacao, SENHA_MINIMA_CARACTERES } from './usuarioService';

export type ResultadoValidacaoCuidador =
  | { valido: true }
  | { valido: false; titulo: string; mensagem: string };

export class CuidadorService {
  private readonly usuarioRepository = new UsuarioRepository();

  public validarCuidador(
    nome: string,
    email: string,
    senha: string,
    hasCuidador: boolean,
  ): ResultadoValidacaoCuidador {
    if (hasCuidador) {
      return { valido: false, titulo: 'Limite atingido', mensagem: 'No MVP, é permitido cadastrar apenas 1 cuidador.' };
    }

    if (!nome || !email || !senha) {
      return { valido: false, titulo: 'Atenção', mensagem: 'Preencha nome, email e senha para criar o cuidador.' };
    }

    if (!isEmailValido(email)) {
      return { valido: false, titulo: 'Email inválido', mensagem: 'Informe um email válido para o cuidador.' };
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

  public async criarCuidador(
    nome: string,
    email: string,
    senha: string,
    pacienteId: string,
  ): Promise<ResultadoOperacao> {
    const usuarioExistente = await this.usuarioRepository.findByEmail(email);
    if (usuarioExistente) {
      return { sucesso: false, titulo: 'Conta existente', mensagem: 'Já existe uma conta cadastrada com este email.' };
    }

    await this.usuarioRepository.create({
      id: criarId(),
      nome,
      email,
      pacienteId,
      senhaHash: hashSenha(senha),
      tipo: 'cuidador',
      criadoEm: new Date().toISOString(),
    });

    return { sucesso: true };
  }

  public async buscarCuidadorDoPaciente(pacienteId: string) {
    return this.usuarioRepository.findByTipoAndPacienteId('cuidador', pacienteId);
  }
}
