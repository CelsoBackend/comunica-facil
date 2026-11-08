import {UsuarioRepository, UsuarioEntity} from '@/data/repositories';
import {runMigrations} from '@/data/storage';
import {isEmailValido} from '@/domain/security/utils/email';
import {hashSenha} from '@/domain/security/utils/hash';
import {criarId} from './utils';

export type ResultadoValidacao =
    | { valido: true }
    | { valido: false; titulo: string; mensagem: string };

export type ResultadoOperacao =
    | { sucesso: true }
    | { sucesso: false; titulo: string; mensagem: string };

export const SENHA_MINIMA_CARACTERES = 6;

export class UsuarioService {
    private readonly usuarioRepository = new UsuarioRepository();

    public validarCriarConta(nome: string, email: string, senha: string): ResultadoValidacao {
        if (!nome || !email || !senha) {
            return {valido: false, titulo: 'Atenção', mensagem: 'Informe nome, email e senha para criar conta.'};
        }

        if (!isEmailValido(email)) {
            return {valido: false, titulo: 'Email inválido', mensagem: 'Informe um email válido.'};
        }

        if (senha.length < SENHA_MINIMA_CARACTERES) {
            return {
                valido: false,
                titulo: 'Senha inválida',
                mensagem: `A senha deve ter pelo menos ${SENHA_MINIMA_CARACTERES} caracteres.`,
            };
        }

        return {valido: true};
    }

    public validarLogin(email: string, senha: string): ResultadoValidacao {
        if (!email || !senha) {
            return {valido: false, titulo: 'Atenção', mensagem: 'Informe email e senha.'};
        }

        if (!isEmailValido(email)) {
            return {valido: false, titulo: 'Email inválido', mensagem: 'Informe um email válido.'};
        }

        return {valido: true};
    }

    public validarResetarSenha(email: string, novaSenha: string): ResultadoValidacao {
        if (!email || !novaSenha) {
            return {valido: false, titulo: 'Atenção', mensagem: 'Informe email e nova senha.'};
        }

        if (!isEmailValido(email)) {
            return {valido: false, titulo: 'Email inválido', mensagem: 'Informe um email válido.'};
        }

        if (novaSenha.length < SENHA_MINIMA_CARACTERES) {
            return {
                valido: false,
                titulo: 'Senha inválida',
                mensagem: `A senha deve ter pelo menos ${SENHA_MINIMA_CARACTERES} caracteres.`,
            };
        }

        return {valido: true};
    }

    public async criarConta(nome: string, email: string, senha: string): Promise<ResultadoOperacao> {
        await runMigrations();

        const usuarioExistente = await this.usuarioRepository.findByEmail(email);
        if (usuarioExistente) {
            return {
                sucesso: false,
                titulo: 'Conta existente',
                mensagem: 'Já existe uma conta cadastrada com este email.'
            };
        }

        await this.usuarioRepository.create({
            id: criarId(),
            nome,
            email,
            senhaHash: hashSenha(senha),
            tipo: 'paciente',
            criadoEm: new Date().toISOString(),
        });

        return {sucesso: true};
    }

    public async autenticarUsuario(email: string, senha: string): Promise<{ sucesso: true; usuario: UsuarioEntity } | {
        sucesso: false;
        titulo: string;
        mensagem: string
    }> {
        await runMigrations();

        const usuario = await this.usuarioRepository.findByEmail(email);

        if (!usuario || usuario.senhaHash !== hashSenha(senha)) {
            return {sucesso: false, titulo: 'Acesso negado', mensagem: 'Credenciais inválidas.'};
        }

        if (usuario.tipo !== 'paciente') {
            return {sucesso: false, titulo: 'Acesso negado', mensagem: 'Use o login do paciente para acessar a Home.'};
        }

        return {sucesso: true, usuario};
    }

    public async resetarSenha(email: string, novaSenha: string): Promise<ResultadoOperacao> {
        await runMigrations();

        const usuario = await this.usuarioRepository.findByEmail(email);

        if (!usuario) {
            return {sucesso: false, titulo: 'Atenção', mensagem: 'não foi possivel resetar a senha email invalido'};
        }

        await this.usuarioRepository.update({
            ...usuario,
            senhaHash: hashSenha(novaSenha),
        });

        return {sucesso: true};
    }
}
