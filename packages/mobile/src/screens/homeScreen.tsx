import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Pressable,
  Alert,
  ScrollView,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';

import {
  BotaoRecord,
  BotaoRepository,
  ConfiguracaoAcessoRepository,
  SessaoRepository,
  UsuarioRepository,
} from '@/data/repositories';
import { runMigrations } from '@/data/storage';
import { Botao } from '@/domain/entities';
import { isEmailValido } from '@/domain/security/email';
import { hashSenha } from '@/domain/security/hash';

type ModoTela = 'loading' | 'cadastroPaciente' | 'home';

const usuarioRepository = new UsuarioRepository();
const botaoRepository = new BotaoRepository();
const configuracaoAcessoRepository = new ConfiguracaoAcessoRepository();
const sessaoRepository = new SessaoRepository();
const CONFIGURACAO_ACESSO_ID = 'principal';
const SESSAO_ID = 'principal';
const SENHA_MINIMA_CARACTERES = 6;
const COR_PADRAO = '#86EFAC';

const CORES_PRESET = [
  { nome: 'Verde claro', valor: '#86EFAC' },
  { nome: 'Vermelho claro', valor: '#FCA5A5' },
  { nome: 'Azul', valor: '#60A5FA' },
  { nome: 'Laranja', valor: '#FB923C' },
  { nome: 'Marrom', valor: '#92400E' },
  { nome: 'Vermelho', valor: '#EF4444' },
  { nome: 'Roxo', valor: '#A78BFA' },
  { nome: 'Rosa', valor: '#F9A8D4' },
  { nome: 'Violeta', valor: '#8B5CF6' },
  { nome: 'Azul claro', valor: '#7DD3FC' },
  { nome: 'Amarelo claro', valor: '#FDE68A' },
] as const;

const BOTOES_PADRAO = [
  { texto: 'Sim', cor: '#86EFAC' },
  { texto: 'Não', cor: '#FCA5A5' },
  { texto: 'Sede', cor: '#60A5FA' },
  { texto: 'Fome', cor: '#FB923C' },
  { texto: 'Banheiro', cor: '#92400E' },
  { texto: 'Dor', cor: '#EF4444' },
  { texto: 'Trocar Fralda', cor: '#A78BFA' },
  { texto: 'Mudar de Posição', cor: '#F9A8D4' },
  { texto: 'Trocar Canal', cor: '#8B5CF6' },
  { texto: 'Obrigado', cor: '#7DD3FC' },
  { texto: 'Desculpe', cor: '#FDE68A' },
] as const;

const criarId = (): string => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const sanitized = hex.trim().replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(sanitized)) {
    return null;
  }

  const value = Number.parseInt(sanitized, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
};

const getCorTextoPorContraste = (hexColor: string): string => {
  const rgb = hexToRgb(hexColor);
  if (!rgb) {
    return '#111827';
  }

  const luminancia = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  return luminancia > 0.6 ? '#111827' : '#ffffff';
};

const getMensagemErro = (erro: unknown): string => {
  if (erro instanceof Error && erro.message.trim().length > 0) {
    return erro.message;
  }

  return 'Tente novamente em instantes.';
};

export default function homeScreen() {
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
  const [botoes, setBotoes] = useState<BotaoRecord[]>([]);
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

  const garantirBotoesPadrao = useCallback(async () => {
    const existentes = await botaoRepository.findAll(false);

    if (existentes.length > 0) {
      return;
    }

    const agora = new Date().toISOString();
    for (let index = 0; index < BOTOES_PADRAO.length; index += 1) {
      const item = BOTOES_PADRAO[index];
      await botaoRepository.create({
        id: criarId(),
        texto: item.texto,
        cor: item.cor,
        ordem: index + 1,
        ativo: true,
        criadoEm: agora,
        atualizadoEm: agora,
      });
    }
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

  const iniciarEdicao = useCallback((botao: BotaoRecord) => {
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

  const renderColorPalette = useCallback(
    (corSelecionada: string, selecionarCor: (cor: string) => void) => (
      <View style={styles.paletteGrid}>
        {CORES_PRESET.map((cor) => {
          const selecionada = corSelecionada === cor.valor;
          const corTexto = getCorTextoPorContraste(cor.valor);

          return (
            <Pressable
              key={cor.valor}
              style={[styles.colorItem, selecionada && styles.colorItemSelected]}
              onPress={() => selecionarCor(cor.valor)}
              accessibilityRole="button"
              accessibilityLabel={`Selecionar cor ${cor.nome}`}
            >
              <View style={[styles.colorSwatch, { backgroundColor: cor.valor }]} />
              <Text style={[styles.colorName, { color: corTexto === '#ffffff' ? '#111827' : '#111827' }]}>{cor.nome}</Text>
            </Pressable>
          );
        })}
      </View>
    ),
    [],
  );

  const renderCadastroPaciente = () => (
    <View style={styles.card}>
      <Text style={styles.subtitle}>Cadastro inicial do paciente</Text>
      <TextInput
        placeholder="Nome do paciente"
        value={pacienteNome}
        onChangeText={setPacienteNome}
        style={styles.input}
      />
      <TextInput
        placeholder="Senha"
        secureTextEntry
        value={pacienteSenha}
        onChangeText={setPacienteSenha}
        style={styles.input}
      />
      <Pressable style={styles.button} onPress={salvarPaciente} disabled={saving}>
        <Text style={styles.buttonText}>{saving ? 'Salvando...' : 'Criar conta e acessar Home'}</Text>
      </Pressable>
    </View>
  );

  const renderHome = () => (
    <View style={styles.card}>
      {modoEdicaoAtivo ? (
        <Pressable style={styles.closeEditButton} onPress={sairModoEdicao} disabled={saving}>
          <Text style={styles.closeEditButtonText}>✕</Text>
        </Pressable>
      ) : null}

      <Text style={styles.subtitle}>Olá, {pacienteAtualNome}</Text>
      <Text style={styles.status}>{modoEdicaoAtivo ? 'Modo edição ativo' : 'Modo paciente ativo'}</Text>

      <Text style={styles.gridTitle}>Comunicação rápida</Text>
      {botoes.length === 0 ? (
        <Text style={styles.emptyState}>Nenhum botão cadastrado ainda.</Text>
      ) : (
        <View style={styles.grid}>
          {botoes.map((botao) => {
            const corTexto = getCorTextoPorContraste(botao.cor);
            const botaoDominio = new Botao(botao.id, botao.texto, botao.cor);
            return (
              <Pressable
                key={botao.id}
                style={[styles.botaoComunicacao, { backgroundColor: botao.cor }]}
                accessibilityRole="button"
                accessibilityLabel={`Botão de comunicação: ${botao.texto}`}
                hitSlop={8}
                onPress={() => {
                  const payload = botaoDominio.pressionar();
                  navigation.navigate('MensagemTelaCheia', payload);
                }}
              >
                <Text style={[styles.botaoComunicacaoTexto, { color: corTexto }]}>{botao.texto}</Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {hasCuidador ? (
        <>
          <Text style={styles.info}>Cuidador já cadastrado no aparelho.</Text>

          {!modoEdicaoAtivo ? (
            <Pressable style={styles.buttonSecondary} onPress={() => navigation.navigate('LoginCuidadorEdicao')}>
              <Text style={styles.buttonSecondaryText}>Entrar em modo edição</Text>
            </Pressable>
          ) : (
            <View style={styles.formSection}>
              <Text style={styles.formTitle}>Painel do cuidador</Text>
              <Text style={styles.emptyState}>Gerencie os botões do paciente: criar, editar, excluir e reordenar.</Text>

              <View style={styles.painelEditor}>
                <Text style={styles.formTitle}>Criar novo botão</Text>
                <TextInput
                  placeholder="Texto do botão"
                  value={novoBotaoTexto}
                  onChangeText={setNovoBotaoTexto}
                  style={styles.input}
                />
                <Text style={styles.colorTitle}>Cor do botão</Text>
                {renderColorPalette(novoBotaoCor, setNovoBotaoCor)}
                <Pressable style={styles.button} onPress={criarBotao} disabled={saving}>
                  <Text style={styles.buttonText}>{saving ? 'Salvando...' : 'Criar botão'}</Text>
                </Pressable>
              </View>

              <View style={styles.painelEditor}>
                <Text style={styles.formTitle}>Lista de botões</Text>
                {botoes.length === 0 ? (
                  <Text style={styles.emptyState}>Nenhum botão cadastrado.</Text>
                ) : (
                  botoes.map((botao, index) => {
                    const emEdicao = botaoEmEdicaoId === botao.id;

                    return (
                      <View key={botao.id} style={styles.itemGestao}>
                        <View style={styles.itemGestaoHeader}>
                          <Text style={styles.itemGestaoTitulo}>#{botao.ordem} {botao.texto}</Text>
                          <View style={[styles.corPreview, { backgroundColor: botao.cor }]} />
                        </View>

                        {emEdicao ? (
                          <>
                            <TextInput
                              placeholder="Texto do botão"
                              value={edicaoTexto}
                              onChangeText={setEdicaoTexto}
                              style={styles.input}
                            />
                            <Text style={styles.colorTitle}>Cor do botão</Text>
                            {renderColorPalette(edicaoCor, setEdicaoCor)}
                            <View style={styles.linhaAcoes}>
                              <Pressable style={styles.buttonSmall} onPress={salvarEdicao} disabled={saving}>
                                <Text style={styles.buttonText}>Salvar</Text>
                              </Pressable>
                              <Pressable
                                style={styles.buttonSmallSecondary}
                                onPress={() => setBotaoEmEdicaoId(null)}
                                disabled={saving}
                              >
                                <Text style={styles.buttonSecondaryText}>Cancelar</Text>
                              </Pressable>
                            </View>
                          </>
                        ) : (
                          <View style={styles.linhaAcoes}>
                            <Pressable
                              style={styles.buttonSmallSecondary}
                              onPress={() => moverBotao(botao.id, 'up')}
                              disabled={saving || index === 0}
                            >
                              <Text style={styles.buttonSecondaryText}>↑</Text>
                            </Pressable>
                            <Pressable
                              style={styles.buttonSmallSecondary}
                              onPress={() => moverBotao(botao.id, 'down')}
                              disabled={saving || index === botoes.length - 1}
                            >
                              <Text style={styles.buttonSecondaryText}>↓</Text>
                            </Pressable>
                            <Pressable
                              style={styles.buttonSmallSecondary}
                              onPress={() => iniciarEdicao(botao)}
                              disabled={saving}
                            >
                              <Text style={styles.buttonSecondaryText}>Editar</Text>
                            </Pressable>
                            <Pressable
                              style={styles.buttonSmallDanger}
                              onPress={() => excluirBotao(botao.id)}
                              disabled={saving}
                            >
                              <Text style={styles.buttonText}>Excluir</Text>
                            </Pressable>
                          </View>
                        )}
                      </View>
                    );
                  })
                )}
              </View>

            </View>
          )}
        </>
      ) : (
        <>
          {!mostrarCadastroCuidador ? (
            <Pressable style={styles.buttonSecondary} onPress={() => setMostrarCadastroCuidador(true)}>
              <Text style={styles.buttonSecondaryText}>Criar conta cuidador</Text>
            </Pressable>
          ) : (
            <View style={styles.formSection}>
              <Text style={styles.formTitle}>Cadastro de cuidador</Text>
              <TextInput
                placeholder="Nome do cuidador"
                value={cuidadorNome}
                onChangeText={setCuidadorNome}
                style={styles.input}
              />
              <TextInput
                placeholder="Email do cuidador"
                value={cuidadorEmail}
                onChangeText={setCuidadorEmail}
                style={styles.input}
                autoCapitalize="none"
              />
              <TextInput
                placeholder="Senha"
                secureTextEntry
                value={cuidadorSenha}
                onChangeText={setCuidadorSenha}
                style={styles.input}
              />
              <Pressable style={styles.button} onPress={salvarCuidador} disabled={saving}>
                <Text style={styles.buttonText}>{saving ? 'Salvando...' : 'Salvar cuidador'}</Text>
              </Pressable>
              <Pressable style={styles.linkButton} onPress={() => setMostrarCadastroCuidador(false)}>
                <Text style={styles.linkText}>Cancelar</Text>
              </Pressable>
            </View>
          )}
        </>
      )}
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      {loading ? (
        <ActivityIndicator size="large" color="#0066cc" />
      ) : modoTela === 'cadastroPaciente' ? (
        renderCadastroPaciente()
      ) : (
        renderHome()
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#0b3a8f',
  },
  status: {
    fontSize: 17,
    color: '#111827',
    marginBottom: 12,
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1f2937',
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 10,
    fontSize: 17,
  },
  button: {
    backgroundColor: '#0b3a8f',
    borderRadius: 8,
    minHeight: 48,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonSecondary: {
    borderWidth: 1,
    borderColor: '#0b3a8f',
    borderRadius: 8,
    minHeight: 48,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  buttonSecondaryText: {
    color: '#0b3a8f',
    fontSize: 16,
    fontWeight: '600',
  },
  info: {
    marginTop: 14,
    color: '#065f46',
    fontWeight: '500',
  },
  formSection: {
    marginTop: 14,
    position: 'relative',
  },
  painelEditor: {
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    padding: 10,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#111827',
  },
  itemGestao: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  itemGestaoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemGestaoTitulo: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  corPreview: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  colorTitle: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  paletteGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  colorItem: {
    width: '48%',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ffffff',
  },
  colorItemSelected: {
    borderColor: '#0b3a8f',
    borderWidth: 2,
  },
  colorSwatch: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#9ca3af',
  },
  colorName: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  closeEditButton: {
    position: 'absolute',
    right: 0,
    top: -4,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  closeEditButtonText: {
    fontSize: 22,
    color: '#991b1b',
    fontWeight: '700',
    lineHeight: 24,
  },
  linhaAcoes: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  buttonSmall: {
    backgroundColor: '#0b3a8f',
    borderRadius: 8,
    minHeight: 44,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSmallSecondary: {
    borderWidth: 1,
    borderColor: '#0b3a8f',
    borderRadius: 8,
    minHeight: 44,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSmallDanger: {
    backgroundColor: '#dc2626',
    borderRadius: 8,
    minHeight: 44,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkButton: {
    marginTop: 10,
    alignItems: 'center',
  },
  linkText: {
    color: '#374151',
    textDecorationLine: 'underline',
  },
  gridTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#111827',
  },
  emptyState: {
    color: '#6b7280',
    marginBottom: 12,
    fontSize: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10,
  },
  botaoComunicacao: {
    minHeight: 108,
    width: '47%',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  botaoComunicacaoTexto: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
});
