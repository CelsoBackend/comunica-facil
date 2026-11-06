import React, { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';

import {
  BotaoEntity,
  ConfiguracaoAcessoRepository,
  SessaoRepository,
  UsuarioRepository,
} from '@/data/repositories';
import { runMigrations } from '@/data/storage';
import { Botao } from '@/domain/models';
import {
  getMensagemErro as getMensagemErroService,
  criarId as criarIdService,
  COR_PADRAO_BOTAO,
  BotaoService,
  CuidadorService,
  PacienteService,
} from '@/domain/services';
import HomeView from "@/screens/views/HomeView";

type ModoTela = 'loading' | 'cadastroPaciente' | 'home';

const usuarioRepository = new UsuarioRepository();
const configuracaoAcessoRepository = new ConfiguracaoAcessoRepository();
const sessaoRepository = new SessaoRepository();
const CONFIGURACAO_ACESSO_ID = 'principal';
const SESSAO_ID = 'principal';
const COR_PADRAO = COR_PADRAO_BOTAO;

const getMensagemErro = getMensagemErroService;

const botaoService = new BotaoService();
const cuidadorService = new CuidadorService();
const pacienteService = new PacienteService();

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
    const botoesAtivos = await botaoService.buscarBotoesAtivos();
    setBotoes(botoesAtivos);
  }, []);

  const carregarEstadoInicial = useCallback(async () => {
    setLoading(true);

    try {
      await runMigrations();
      const paciente = await usuarioRepository.findByTipo('paciente');
      const cuidador = paciente
        ? await cuidadorService.buscarCuidadorDoPaciente(paciente.id)
        : null;
      const configuracaoAcesso = await configuracaoAcessoRepository.findById(CONFIGURACAO_ACESSO_ID);

      await botaoService.garantirBotoesPadrao();

      setPacienteAtualId(paciente?.id ?? null);
      setPacienteAtualNome(paciente?.nome ?? '');
      setHasCuidador(Boolean(cuidador));
      setModoEdicaoAtivo(configuracaoAcesso?.modoEdicaoAtivo ?? false);
      await carregarBotoesAtivos();
      setModoTela('home');
    } finally {
      setLoading(false);
    }
  }, [carregarBotoesAtivos]);

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

    const validacao = pacienteService.validarPaciente(nome, senha);
    if (!validacao.valido) {
      Alert.alert(validacao.titulo, validacao.mensagem);
      return;
    }

    setSaving(true);

    try {
      await pacienteService.criarPaciente(nome, senha);
      await botaoService.garantirBotoesPadrao();
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
  }, [carregarEstadoInicial, pacienteNome, pacienteSenha, voltarParaHomeSegura]);

  const salvarCuidador = useCallback(async () => {
    if (!pacienteAtualId) {
      Alert.alert('Atenção', 'Paciente não identificado para vincular cuidador.');
      return;
    }

    const nome = cuidadorNome.trim();
    const email = cuidadorEmail.trim();
    const senha = cuidadorSenha.trim();

    const validacao = cuidadorService.validarCuidador(nome, email, senha, hasCuidador);
    if (!validacao.valido) {
      Alert.alert(validacao.titulo, validacao.mensagem);
      return;
    }

    setSaving(true);

    try {
      const resultado = await cuidadorService.criarCuidador(nome, email, senha, pacienteAtualId);
      if (!resultado.sucesso) {
        Alert.alert(resultado.titulo ?? 'Erro', resultado.mensagem ?? '');
        return;
      }
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

  const criarBotao = useCallback(async () => {
    const texto = novoBotaoTexto.trim();
    const cor = novoBotaoCor.trim();

    if (!texto) {
      Alert.alert('Atenção', 'Informe o texto do botão.');
      return;
    }

    if (!botaoService.validarCorHex(cor)) {
      Alert.alert('Atenção', 'Informe uma cor válida no formato #RRGGBB.');
      return;
    }

    setSaving(true);

    try {      
      await botaoService.criarBotao(
        texto,
        cor,
        botoes.length,
      );

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
  }, [botoes.length, carregarBotoesAtivos, novoBotaoCor, novoBotaoTexto, voltarParaHomeSegura]);

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
    const validarCorHex = botaoService.validarCorHex(cor);

    if (!texto) {
      Alert.alert('Atenção', 'Informe o texto do botão.');
      return;
    }

    if (!validarCorHex) {
      Alert.alert('Atenção', 'Informe uma cor válida no formato #RRGGBB.');
      return;
    }

    const botaoAtual = botoes.find((item) => item.id === botaoEmEdicaoId);
    if (!botaoAtual) {
      return;
    }

    setSaving(true);
    try {
      await botaoService.atualizarBotao(botaoAtual, texto, cor);
      setBotaoEmEdicaoId(null);
      await carregarBotoesAtivos();
    } catch (erro) {
      console.error(erro);
      Alert.alert('Falha ao salvar edição', getMensagemErro(erro));
      voltarParaHomeSegura();
    } finally {
      setSaving(false);
    }
  }, [botaoEmEdicaoId, botoes, edicaoCor, edicaoTexto, carregarBotoesAtivos, voltarParaHomeSegura]);

  const excluirBotao = useCallback((id: string) => {
    Alert.alert('Excluir botão', 'Tem certeza que deseja excluir este botão?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          setSaving(true);
          try {
            await botaoService.excluirBotaoEReordenar(id);
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
      setSaving(true);
      try {
        await botaoService.moverBotao(botoes, id, direcao);
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
