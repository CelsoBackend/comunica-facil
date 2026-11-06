import React, { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';

import {
  BotaoEntity,
  BotaoRepository,
  ConfiguracaoAcessoRepository,
  SessaoRepository,
  UsuarioRepository,
} from '@/data/repositories';
import { runMigrations } from '@/data/storage';
import { Botao } from '@/domain/models';
import { isEmailValido } from '@/domain/security/utils/email';
import { hashSenha } from '@/domain/security/utils/hash';
import {
  getMensagemErro as getMensagemErroService,
  criarId as criarIdService,
  garantirBotoesPadrao,
  buscarBotoesAtivos,
  criarBotao as criarBotaoService,
  atualizarBotao as atualizarBotaoService,
  excluirBotaoEReordenar,
  moverBotao as moverBotaoService,
  validarCorHex as validarCorHexService,
  COR_PADRAO_BOTAO,
  criarPaciente,
  validaCriarPaciente,
  criarCuidador,
  validaCriarCuidador,
  buscarSessaoAtiva,
} from '@/domain/services';
import HomeView from "@/screens/views/HomeView";

type ModoTela = 'loading' | 'cadastroPaciente' | 'home';

const usuarioRepository = new UsuarioRepository();
const botaoRepository = new BotaoRepository();
const configuracaoAcessoRepository = new ConfiguracaoAcessoRepository();
const sessaoRepository = new SessaoRepository();
const CONFIGURACAO_ACESSO_ID = 'principal';
const SESSAO_ID = 'principal';
const SENHA_MINIMA_CARACTERES = 6;
const COR_PADRAO = COR_PADRAO_BOTAO;

const getMensagemErro = getMensagemErroService;
const criarId = criarIdService;

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [modoTela, setModoTela] = useState<ModoTela>('loading');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pacienteNome, setPacienteNome] = useState('');
  const [pacienteSenha, setPacienteSenha] = useState('');
  const [cuidadorNome, setCuidadorNome] = useState('');
  const [cuidadorEmail, setCuidadorEmail] = useState('');
  const [cuidadorSenha, setCuidadorSenha] = useState('');
  const [pacienteAtualNome, setPacienteAtualNome] = useState('');
  const [pacienteAtualId, setPacienteAtualId] = useState<string | null>(null);
  const [hasCuidador, setHasCuidador] = useState(false);
  const [mostrarCadastroCuidador, setMostrarCadastroCuidador] = useState(false);
  const [modoEdicaoAtivo, setModoEdicaoAtivo] = useState(false);
  const [botoes, setBotoes] = useState<BotaoEntity[]>([]);
  const [novoBotaoTexto, setNovoBotaoTexto] = useState('');
  const [novoBotaoCor, setNovoBotaoCor] = useState(COR_PADRAO);
  const [botaoEmEdicaoId, setBotaoEmEdicaoId] = useState<string | null>(null);
  const [edicaoTexto, setEdicaoTexto] = useState('');
  const [edicaoCor, setEdicaoCor] = useState(COR_PADRAO);

  const voltarParaHomeSegura = useCallback(() => {
    setModoTela('home');
    setMostrarCadastroCuidador(false);
    setModoEdicaoAtivo(false);
    setBotaoEmEdicaoId(null);
  }, []);

  const carregarBotoesAtivos = useCallback(async () => {
    const botoesAtivos = await botaoRepository.findAll(true);
    setBotoes(botoesAtivos);
  }, []);

  const carregarEstadoInicial = useCallback(async () => {
    setLoading(true);

    try {
      await runMigrations();
      const paciente = await usuarioRepository.findByTipo('paciente');
      const cuidador = paciente
        ? await usuarioRepository.findByTipoAndPacienteId('cuidador', paciente.id)
        : null;
      const configuracaoAcesso = await configuracaoAcessoRepository.findById(CONFIGURACAO_ACESSO_ID);

      await garantirBotoesPadrao();

      setPacienteAtualId(paciente?.id ?? null);
      setPacienteAtualNome(paciente?.nome ?? '');
      setHasCuidador(Boolean(cuidador));
      setModoEdicaoAtivo(configuracaoAcesso?.modoEdicaoAtivo ?? false);
      await carregarBotoesAtivos();
      setModoTela('home');
    } finally {
      setLoading(false);
    }
  }, [carregarBotoesAtivos, garantirBotoesPadrao]);

  useEffect(() => {
    carregarEstadoInicial();
  }, [carregarEstadoInicial]);

  useFocusEffect(
    useCallback(() => {
      const validarSessao = async () => {
        try {
          const sessao = await sessaoRepository.findById(SESSAO_ID);

          if (!sessao?.ativa) {
            navigation.reset({ index: 0, routes: [{ name: 'Auth' }] });
          }
        } catch (erro) {
          console.error(erro);
          navigation.reset({ index: 0, routes: [{ name: 'Auth' }] });
        }
      };

      validarSessao();
    }, [navigation]),
  );

  const salvarPaciente = useCallback(async () => {
    const nome = pacienteNome.trim();
    const senha = pacienteSenha.trim();

    if (!nome || !senha) {
      Alert.alert('Atenção', 'Preencha nome e senha para criar a conta do paciente.');
      return;
    }

    if (senha.length < SENHA_MINIMA_CARACTERES) {
      Alert.alert('Senha inválida', `A senha deve ter pelo menos ${SENHA_MINIMA_CARACTERES} caracteres.`);
      return;
    }

    setSaving(true);

    try {
      await usuarioRepository.create({
        id: criarId(),
        nome,
        senhaHash: hashSenha(senha),
        tipo: 'paciente',
        criadoEm: new Date().toISOString(),
      });

      await garantirBotoesPadrao();
      setPacienteNome('');
      setPacienteSenha('');
      await carregarEstadoInicial();
    } catch (erro) {
      console.error(erro);
      Alert.alert('Falha ao criar paciente', getMensagemErro(erro));
      voltarParaHomeSegura();
    } finally {
      setSaving(false);
    }
  }, [carregarEstadoInicial, garantirBotoesPadrao, pacienteNome, pacienteSenha, voltarParaHomeSegura]);

  const salvarCuidador = useCallback(async () => {
    if (!pacienteAtualId) {
      Alert.alert('Atenção', 'Paciente não identificado para vincular cuidador.');
      return;
    }

    if (hasCuidador) {
      Alert.alert('Limite atingido', 'No MVP, é permitido cadastrar apenas 1 cuidador.');
      setMostrarCadastroCuidador(false);
      return;
    }

    const nome = cuidadorNome.trim();
    const email = cuidadorEmail.trim();
    const senha = cuidadorSenha.trim();

    if (!nome || !email || !senha) {
      Alert.alert('Atenção', 'Preencha nome, email e senha para criar o cuidador.');
      return;
    }

    if (!isEmailValido(email)) {
      Alert.alert('Email inválido', 'Informe um email válido para o cuidador.');
      return;
    }

    const usuarioExistente = await usuarioRepository.findByEmail(email);
    if (usuarioExistente) {
      Alert.alert('Conta existente', 'Já existe uma conta cadastrada com este email.');
      return;
    }

    if (senha.length < SENHA_MINIMA_CARACTERES) {
      Alert.alert('Senha inválida', `A senha deve ter pelo menos ${SENHA_MINIMA_CARACTERES} caracteres.`);
      return;
    }

    setSaving(true);

    try {
      await usuarioRepository.create({
        id: criarId(),
        nome,
        email,
        pacienteId: pacienteAtualId,
        senhaHash: hashSenha(senha),
        tipo: 'cuidador',
        criadoEm: new Date().toISOString(),
      });
      setCuidadorNome('');
      setCuidadorEmail('');
      setCuidadorSenha('');
      setMostrarCadastroCuidador(false);
      await carregarEstadoInicial();
    } catch (erro) {
      console.error(erro);
      Alert.alert('Falha ao salvar cuidador', getMensagemErro(erro));
      voltarParaHomeSegura();
    } finally {
      setSaving(false);
    }
  }, [carregarEstadoInicial, cuidadorEmail, cuidadorNome, cuidadorSenha, hasCuidador, pacienteAtualId, voltarParaHomeSegura]);

  const sairModoEdicao = useCallback(async () => {
    setSaving(true);

    try {
      const configuracaoAcesso = await configuracaoAcessoRepository.findById(CONFIGURACAO_ACESSO_ID);
      await configuracaoAcessoRepository.save({
        id: CONFIGURACAO_ACESSO_ID,
        modoEdicaoAtivo: false,
        ultimoAcessoCuidadorEm: configuracaoAcesso?.ultimoAcessoCuidadorEm ?? null,
      });

      setModoEdicaoAtivo(false);
      setBotaoEmEdicaoId(null);
      setModoTela('home');
    } catch (erro) {
      console.error(erro);
      Alert.alert('Falha ao encerrar sessão', getMensagemErro(erro));
      voltarParaHomeSegura();
    } finally {
      setSaving(false);
    }
  }, [voltarParaHomeSegura]);

  const validarCorHex = useCallback((cor: string): boolean => {
    return /^#[0-9A-Fa-f]{6}$/.test(cor.trim());
  }, []);

  const criarBotao = useCallback(async () => {
    const texto = novoBotaoTexto.trim();
    const cor = novoBotaoCor.trim();

    if (!texto) {
      Alert.alert('Atenção', 'Informe o texto do botão.');
      return;
    }

    if (!validarCorHex(cor)) {
      Alert.alert('Atenção', 'Informe uma cor válida no formato #RRGGBB.');
      return;
    }

    setSaving(true);

    try {
      const proximaOrdem = botoes.length + 1;
      const agora = new Date().toISOString();
      await botaoRepository.create({
        id: criarId(),
        texto,
        cor,
        ordem: proximaOrdem,
        ativo: true,
        criadoEm: agora,
        atualizadoEm: agora,
      });

      setNovoBotaoTexto('');
      setNovoBotaoCor(COR_PADRAO);
      await carregarBotoesAtivos();
    } catch (erro) {
      console.error(erro);
      Alert.alert('Falha ao criar botão', getMensagemErro(erro));
      voltarParaHomeSegura();
    } finally {
      setSaving(false);
    }
  }, [botoes.length, carregarBotoesAtivos, novoBotaoCor, novoBotaoTexto, validarCorHex, voltarParaHomeSegura]);

  const iniciarEdicao = useCallback((botao: BotaoEntity) => {
    setBotaoEmEdicaoId(botao.id);
    setEdicaoTexto(botao.texto);
    setEdicaoCor(botao.cor);
  }, []);

  const salvarEdicao = useCallback(async () => {
    if (!botaoEmEdicaoId) {
      return;
    }

    const texto = edicaoTexto.trim();
    const cor = edicaoCor.trim();

    if (!texto) {
      Alert.alert('Atenção', 'Informe o texto do botão.');
      return;
    }

    if (!validarCorHex(cor)) {
      Alert.alert('Atenção', 'Informe uma cor válida no formato #RRGGBB.');
      return;
    }

    const botaoAtual = botoes.find((item) => item.id === botaoEmEdicaoId);
    if (!botaoAtual) {
      return;
    }

    setSaving(true);
    try {
      await botaoRepository.update({
        ...botaoAtual,
        texto,
        cor,
        atualizadoEm: new Date().toISOString(),
      });
      setBotaoEmEdicaoId(null);
      await carregarBotoesAtivos();
    } catch (erro) {
      console.error(erro);
      Alert.alert('Falha ao salvar edição', getMensagemErro(erro));
      voltarParaHomeSegura();
    } finally {
      setSaving(false);
    }
  }, [botaoEmEdicaoId, botoes, botaoRepository, edicaoCor, edicaoTexto, carregarBotoesAtivos, validarCorHex, voltarParaHomeSegura]);

  const excluirBotao = useCallback((id: string) => {
    Alert.alert('Excluir botão', 'Tem certeza que deseja excluir este botão?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          setSaving(true);
          try {
            await botaoRepository.delete(id);
            const restantes = (await botaoRepository.findAll(true)).sort((a, b) => a.ordem - b.ordem);

            for (let index = 0; index < restantes.length; index += 1) {
              const item = restantes[index];
              const novaOrdem = index + 1;

              if (item.ordem !== novaOrdem) {
                await botaoRepository.update({
                  ...item,
                  ordem: novaOrdem,
                  atualizadoEm: new Date().toISOString(),
                });
              }
            }

            if (botaoEmEdicaoId === id) {
              setBotaoEmEdicaoId(null);
            }

            await carregarBotoesAtivos();
          } catch (erro) {
            console.error(erro);
            Alert.alert('Falha ao excluir botão', getMensagemErro(erro));
            voltarParaHomeSegura();
          } finally {
            setSaving(false);
          }
        },
      },
    ]);
  }, [botaoEmEdicaoId, carregarBotoesAtivos, voltarParaHomeSegura]);

  const moverBotao = useCallback(
    async (id: string, direcao: 'up' | 'down') => {
      const indiceAtual = botoes.findIndex((item) => item.id === id);
      if (indiceAtual === -1) {
        return;
      }

      const indiceDestino = direcao === 'up' ? indiceAtual - 1 : indiceAtual + 1;
      if (indiceDestino < 0 || indiceDestino >= botoes.length) {
        return;
      }

      const reordenados = [...botoes];
      const [movido] = reordenados.splice(indiceAtual, 1);
      reordenados.splice(indiceDestino, 0, movido);

      setSaving(true);
      try {
        const agora = new Date().toISOString();
        for (let index = 0; index < reordenados.length; index += 1) {
          const item = reordenados[index];
          const novaOrdem = index + 1;

          if (item.ordem !== novaOrdem) {
            await botaoRepository.update({
              ...item,
              ordem: novaOrdem,
              atualizadoEm: agora,
            });
          }
        }
        await carregarBotoesAtivos();
      } catch (erro) {
        console.error(erro);
        Alert.alert('Falha ao reordenar botões', getMensagemErro(erro));
        voltarParaHomeSegura();
      } finally {
        setSaving(false);
      }
    },
    [botoes, carregarBotoesAtivos, voltarParaHomeSegura],
  );

  return (
    <HomeView
      loading={loading}
      saving={saving}
      modoTela={modoTela}
      pacienteAtualNome={pacienteAtualNome}
      modoEdicaoAtivo={modoEdicaoAtivo}
      hasCuidador={hasCuidador}
      mostrarCadastroCuidador={mostrarCadastroCuidador}
      botoes={botoes}
      botaoEmEdicaoId={botaoEmEdicaoId}
      pacienteNome={pacienteNome}
      pacienteSenha={pacienteSenha}
      cuidadorNome={cuidadorNome}
      cuidadorEmail={cuidadorEmail}
      cuidadorSenha={cuidadorSenha}
      novoBotaoTexto={novoBotaoTexto}
      novoBotaoCor={novoBotaoCor}
      edicaoTexto={edicaoTexto}
      edicaoCor={edicaoCor}
      onChangePacienteNome={setPacienteNome}
      onChangePacienteSenha={setPacienteSenha}
      onChangeCuidadorNome={setCuidadorNome}
      onChangeCuidadorEmail={setCuidadorEmail}
      onChangeCuidadorSenha={setCuidadorSenha}
      onChangeNovoBotaoTexto={setNovoBotaoTexto}
      onChangeNovoBotaoCor={setNovoBotaoCor}
      onChangeEdicaoTexto={setEdicaoTexto}
      onChangeEdicaoCor={setEdicaoCor}
      onSalvarPaciente={salvarPaciente}
      onSalvarCuidador={salvarCuidador}
      onSairModoEdicao={sairModoEdicao}
      onCriarBotao={criarBotao}
      onSalvarEdicao={salvarEdicao}
      onCancelarEdicao={() => setBotaoEmEdicaoId(null)}
      onIniciarEdicao={iniciarEdicao}
      onExcluirBotao={excluirBotao}
      onMoverBotao={moverBotao}
      onPressBotao={(botao) => {
        const botaoDominio = new Botao(botao.id, botao.texto, botao.cor);
        const payload = botaoDominio.pressionar();
        navigation.navigate('MensagemTelaCheia', payload);
      }}
      onMostrarCadastroCuidador={() => setMostrarCadastroCuidador(true)}
      onCancelarCadastroCuidador={() => setMostrarCadastroCuidador(false)}
      onEntrarModoEdicao={() => navigation.navigate('LoginCuidadorEdicao')}
    />
  );
}
