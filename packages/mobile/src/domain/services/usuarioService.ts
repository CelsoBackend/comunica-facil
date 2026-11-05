import { UsuarioRepository, UsuarioEntity } from '@/data/repositories';
import { runMigrations } from '@/data/storage';
import { isEmailValido } from '@/domain/security/utils/email';
import { hashSenha } from '@/domain/security/utils/hash';
import { criarId } from './utils';

export const SENHA_MINIMA_CARACTERES = 6;

export type ResultadoValidacao =
  | { valido: true }
  | { valido: false; titulo: string; mensagem: string };

export type ResultadoOperacao =
  | { sucesso: true }
  | { sucesso: false; titulo: string; mensagem: string };

const usuarioRepository = new UsuarioRepository();

export const validaCriarConta = (
  nome: string,
  email: string,
  senha: string,
): ResultadoValidacao => {
  if (!nome || !email || !senha) {
    return { valido: false, titulo: 'Atenção', mensagem: 'Informe nome, email e senha para criar conta.' };
  }

  if (!isEmailValido(email)) {
    return { valido: false, titulo: 'Email inválido', mensagem: 'Informe um email válido.' };
  }

  if (senha.length < SENHA_MINIMA_CARACTERES) {
    return {
      valido: false,
      titulo: 'Senha inválida',
      mensagem: `A senha deve ter pelo menos ${SENHA_MINIMA_CARACTERES} caracteres.`,
    };
  }

  return { valido: true };
};

export const validaLogin = (email: string, senha: string): ResultadoValidacao => {
  if (!email || !senha) {
    return { valido: false, titulo: 'Atenção', mensagem: 'Informe email e senha.' };
  }

  if (!isEmailValido(email)) {
    return { valido: false, titulo: 'Email inválido', mensagem: 'Informe um email válido.' };
  }

  return { valido: true };
};

export const validaResetarSenha = (email: string, novaSenha: string): ResultadoValidacao => {
  if (!email || !novaSenha) {
    return { valido: false, titulo: 'Atenção', mensagem: 'Informe email e nova senha.' };
  }

  if (!isEmailValido(email)) {
    return { valido: false, titulo: 'Email inválido', mensagem: 'Informe um email válido.' };
  }

  if (novaSenha.length < SENHA_MINIMA_CARACTERES) {
    return {
      valido: false,
      titulo: 'Senha inválida',
      mensagem: `A senha deve ter pelo menos ${SENHA_MINIMA_CARACTERES} caracteres.`,
    };
  }

  return { valido: true };
};

export const criarConta = async (
  nome: string,
  email: string,
  senha: string,
): Promise<ResultadoOperacao> => {
  await runMigrations();

  const usuarioExistente = await usuarioRepository.findByEmail(email);
  if (usuarioExistente) {
    return { sucesso: false, titulo: 'Conta existente', mensagem: 'Já existe uma conta cadastrada com este email.' };
  }

  await usuarioRepository.create({
    id: criarId(),
    nome,
    email,
    senhaHash: hashSenha(senha),
    tipo: 'paciente',
    criadoEm: new Date().toISOString(),
  });

  return { sucesso: true };
};

export const autenticarUsuario = async (
  email: string,
  senha: string,
): Promise<{ sucesso: true; usuario: UsuarioEntity } | { sucesso: false; titulo: string; mensagem: string }> => {
  await runMigrations();

  const usuario = await usuarioRepository.findByEmail(email);

  if (!usuario || usuario.senhaHash !== hashSenha(senha)) {
    return { sucesso: false, titulo: 'Acesso negado', mensagem: 'Credenciais inválidas.' };
  }

  if (usuario.tipo !== 'paciente') {
    return { sucesso: false, titulo: 'Acesso negado', mensagem: 'Use o login do paciente para acessar a Home.' };
  }

  return { sucesso: true, usuario };
};

export const resetarSenha = async (
  email: string,
  novaSenha: string,
): Promise<ResultadoOperacao> => {
  await runMigrations();

  const usuario = await usuarioRepository.findByEmail(email);

  if (!usuario) {
    return { sucesso: false, titulo: 'Atenção', mensagem: 'não foi possivel resetar a senha email invalido' };
  }

  await usuarioRepository.update({
    ...usuario,
    senhaHash: hashSenha(novaSenha),
  });

  return { sucesso: true };
};
