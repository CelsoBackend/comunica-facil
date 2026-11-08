import React from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { BotaoEntity } from '@/data/repositories';
import { stylesHome } from "@/screens/styles/HomeStyle";

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

type Props = {
  loading: boolean;
  saving: boolean;
  modoTela: 'loading' | 'cadastroPaciente' | 'home';
  pacienteAtualNome: string;
  modoEdicaoAtivo: boolean;
  hasCuidador: boolean;
  mostrarCadastroCuidador: boolean;
  botoes: BotaoEntity[];
  botaoEmEdicaoId: string | null;
  pacienteNome: string;
  pacienteSenha: string;
  cuidadorNome: string;
  cuidadorEmail: string;
  cuidadorSenha: string;
  novoBotaoTexto: string;
  novoBotaoCor: string;
  edicaoTexto: string;
  edicaoCor: string;
  onChangePacienteNome: (value: string) => void;
  onChangePacienteSenha: (value: string) => void;
  onChangeCuidadorNome: (value: string) => void;
  onChangeCuidadorEmail: (value: string) => void;
  onChangeCuidadorSenha: (value: string) => void;
  onChangeNovoBotaoTexto: (value: string) => void;
  onChangeNovoBotaoCor: (value: string) => void;
  onChangeEdicaoTexto: (value: string) => void;
  onChangeEdicaoCor: (value: string) => void;
  onSalvarPaciente: () => void;
  onSalvarCuidador: () => void;
  onSairModoEdicao: () => void;
  onCriarBotao: () => void;
  onSalvarEdicao: () => void;
  onCancelarEdicao: () => void;
  onIniciarEdicao: (botao: BotaoEntity) => void;
  onExcluirBotao: (id: string) => void;
  onMoverBotao: (id: string, direcao: 'up' | 'down') => void;
  onPressBotao: (botao: BotaoEntity) => void;
  onMostrarCadastroCuidador: () => void;
  onCancelarCadastroCuidador: () => void;
  onEntrarModoEdicao: () => void;
};

export default function HomeView({
  loading,
  saving,
  modoTela,
  pacienteAtualNome,
  modoEdicaoAtivo,
  hasCuidador,
  mostrarCadastroCuidador,
  botoes,
  botaoEmEdicaoId,
  pacienteNome,
  pacienteSenha,
  cuidadorNome,
  cuidadorEmail,
  cuidadorSenha,
  novoBotaoTexto,
  novoBotaoCor,
  edicaoTexto,
  edicaoCor,
  onChangePacienteNome,
  onChangePacienteSenha,
  onChangeCuidadorNome,
  onChangeCuidadorEmail,
  onChangeCuidadorSenha,
  onChangeNovoBotaoTexto,
  onChangeNovoBotaoCor,
  onChangeEdicaoTexto,
  onChangeEdicaoCor,
  onSalvarPaciente,
  onSalvarCuidador,
  onSairModoEdicao,
  onCriarBotao,
  onSalvarEdicao,
  onCancelarEdicao,
  onIniciarEdicao,
  onExcluirBotao,
  onMoverBotao,
  onPressBotao,
  onMostrarCadastroCuidador,
  onCancelarCadastroCuidador,
  onEntrarModoEdicao,
}: Props) {
  const renderColorPalette = (corSelecionada: string, selecionarCor: (cor: string) => void) => (
    <View style={stylesHome.paletteGrid}>
      {CORES_PRESET.map((cor) => {
        const selecionada = corSelecionada === cor.valor;
        const corTexto = getCorTextoPorContraste(cor.valor);

        return (
          <Pressable
            key={cor.valor}
            style={[stylesHome.colorItem, selecionada && stylesHome.colorItemSelected]}
            onPress={() => selecionarCor(cor.valor)}
            accessibilityRole="button"
            accessibilityLabel={`Selecionar cor ${cor.nome}`}
          >
            <View style={[stylesHome.colorSwatch, { backgroundColor: cor.valor }]} />
            <Text style={[stylesHome.colorName, { color: corTexto === '#ffffff' ? '#111827' : '#111827' }]}>{cor.nome}</Text>
          </Pressable>
        );
      })}
    </View>
  );

  const renderCadastroPaciente = () => (
    <View style={stylesHome.card}>
      <Text style={stylesHome.subtitle}>Cadastro inicial do paciente</Text>
      <View style={stylesHome.fieldRow}>
        <Text style={stylesHome.fieldLabel}>Nome:</Text>
        <TextInput value={pacienteNome} onChangeText={onChangePacienteNome} style={stylesHome.inputFlex} />
      </View>
      <View style={stylesHome.fieldRow}>
        <Text style={stylesHome.fieldLabel}>Senha:</Text>
        <TextInput secureTextEntry value={pacienteSenha} onChangeText={onChangePacienteSenha} style={stylesHome.inputFlex} />
      </View>
      <Pressable style={stylesHome.button} onPress={onSalvarPaciente} disabled={saving}>
        <Text style={stylesHome.buttonText}>{saving ? 'Salvando...' : 'Criar conta e acessar Home'}</Text>
      </Pressable>
    </View>
  );

  const renderHome = () => (
    <View style={stylesHome.card}>

      <Image source={require('../../../assets/icon.png')} style={stylesHome.icon} resizeMode="contain" />
      <Text style={stylesHome.subtitle}>Olá, {modoEdicaoAtivo ? 'Cuidador' : pacienteAtualNome}</Text>
      <Text style={stylesHome.status}>{modoEdicaoAtivo ? 'Modo edição ativo' : 'Modo paciente ativo'}</Text>

      <Text style={stylesHome.gridTitle}>Comunicação Rápida</Text>
      {botoes.length === 0 ? (
        <Text style={stylesHome.emptyState}>Nenhum botão cadastrado ainda.</Text>
      ) : (
        <View style={stylesHome.grid}>
          {botoes.map((botao) => {
            const corTexto = getCorTextoPorContraste(botao.cor);
            return (
              <Pressable
                key={botao.id}
                style={[stylesHome.botaoComunicacao, { backgroundColor: botao.cor }]}
                accessibilityRole="button"
                accessibilityLabel={`Botão de comunicação: ${botao.texto}`}
                hitSlop={8}
                onPress={() => onPressBotao(botao)}
              >
                <Text style={[stylesHome.botaoComunicacaoTexto, { color: corTexto }]}>{botao.texto}</Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {hasCuidador ? (
        <>
          <Text style={stylesHome.info}>Cuidador já cadastrado no aparelho.</Text>

          {!modoEdicaoAtivo ? (
            <Pressable style={stylesHome.buttonSecondary} onPress={onEntrarModoEdicao}>
              <Text style={stylesHome.buttonSecondaryText}>Entrar em modo edição</Text>
            </Pressable>
          ) : (
            <View style={stylesHome.formSection}>
              <Pressable style={stylesHome.buttonSecondary} onPress={onSairModoEdicao} disabled={saving}>
                <Text style={stylesHome.closeEditButtonText}>Sair modo edição</Text>
              </Pressable>
              <Text style={stylesHome.formTitle}>Painel do cuidador</Text>
              <Text style={stylesHome.emptyState}>Gerencie os botões do paciente: criar, editar, excluir e reordenar.</Text>

              <View style={stylesHome.painelEditor}>
                <Text style={stylesHome.formTitle}>Criar novo botão</Text>
                <View style={stylesHome.fieldRow}>
                  <Text style={stylesHome.fieldLabel}>Texto:</Text>
                  <TextInput value={novoBotaoTexto} onChangeText={onChangeNovoBotaoTexto} style={stylesHome.inputFlex} />
                </View>
                <Text style={stylesHome.colorTitle}>Cor do botão</Text>
                {renderColorPalette(novoBotaoCor, onChangeNovoBotaoCor)}
                <Pressable style={stylesHome.button} onPress={onCriarBotao} disabled={saving}>
                  <Text style={stylesHome.buttonText}>{saving ? 'Salvando...' : 'Criar botão'}</Text>
                </Pressable>
              </View>

              <View style={stylesHome.painelEditor}>
                <Text style={stylesHome.formTitle}>Lista de botões</Text>
                {botoes.length === 0 ? (
                  <Text style={stylesHome.emptyState}>Nenhum botão cadastrado.</Text>
                ) : (
                  botoes.map((botao, index) => {
                    const emEdicao = botaoEmEdicaoId === botao.id;

                    return (
                      <View key={botao.id} style={stylesHome.itemGestao}>
                        <View style={stylesHome.itemGestaoHeader}>
                          <Text style={stylesHome.itemGestaoTitulo}>#{botao.ordem} {botao.texto}</Text>
                          <View style={[stylesHome.corPreview, { backgroundColor: botao.cor }]} />
                        </View>

                        {emEdicao ? (
                          <>
                            <View style={stylesHome.fieldRow}>
                              <Text style={stylesHome.fieldLabel}>Texto:</Text>
                              <TextInput value={edicaoTexto} onChangeText={onChangeEdicaoTexto} style={stylesHome.inputFlex} />
                            </View>
                            <Text style={stylesHome.colorTitle}>Cor do botão</Text>
                            {renderColorPalette(edicaoCor, onChangeEdicaoCor)}
                            <View style={stylesHome.linhaAcoes}>
                              <Pressable style={stylesHome.buttonSmall} onPress={onSalvarEdicao} disabled={saving}>
                                <Text style={stylesHome.buttonText}>Salvar</Text>
                              </Pressable>
                              <Pressable
                                style={stylesHome.buttonSmallSecondary}
                                onPress={onCancelarEdicao}
                                disabled={saving}
                              >
                                <Text style={stylesHome.buttonSecondaryText}>Cancelar</Text>
                              </Pressable>
                            </View>
                          </>
                        ) : (
                          <View style={stylesHome.linhaAcoes}>
                            <Pressable
                              style={stylesHome.buttonSmallSecondary}
                              onPress={() => onMoverBotao(botao.id, 'up')}
                              disabled={saving || index === 0}
                            >
                              <Text style={stylesHome.buttonSecondaryText}>↑</Text>
                            </Pressable>
                            <Pressable
                              style={stylesHome.buttonSmallSecondary}
                              onPress={() => onMoverBotao(botao.id, 'down')}
                              disabled={saving || index === botoes.length - 1}
                            >
                              <Text style={stylesHome.buttonSecondaryText}>↓</Text>
                            </Pressable>
                            <Pressable
                              style={stylesHome.buttonSmallSecondary}
                              onPress={() => onIniciarEdicao(botao)}
                              disabled={saving}
                            >
                              <Text style={stylesHome.buttonSecondaryText}>Editar</Text>
                            </Pressable>
                            <Pressable
                              style={stylesHome.buttonSmallDanger}
                              onPress={() => onExcluirBotao(botao.id)}
                              disabled={saving}
                            >
                              <Text style={stylesHome.buttonText}>Excluir</Text>
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
            <Pressable style={stylesHome.buttonSecondary} onPress={onMostrarCadastroCuidador}>
              <Text style={stylesHome.buttonSecondaryText}>Criar Conta Cuidador</Text>
            </Pressable>
          ) : (
            <View style={stylesHome.formSection}>
              <Text style={stylesHome.formTitle}>Cadastro de Cuidador</Text>
              <View style={stylesHome.fieldRow}>
                <Text style={stylesHome.fieldLabel}>Nome:</Text>
                <TextInput value={cuidadorNome} onChangeText={onChangeCuidadorNome} style={stylesHome.inputFlex} />
              </View>
              <View style={stylesHome.fieldRow}>
                <Text style={stylesHome.fieldLabel}>Email:</Text>
                <TextInput value={cuidadorEmail} onChangeText={onChangeCuidadorEmail} style={stylesHome.inputFlex} autoCapitalize="none" />
              </View>
              <View style={stylesHome.fieldRow}>
                <Text style={stylesHome.fieldLabel}>Senha:</Text>
                <TextInput secureTextEntry value={cuidadorSenha} onChangeText={onChangeCuidadorSenha} style={stylesHome.inputFlex} />
              </View>
              <Pressable style={stylesHome.button} onPress={onSalvarCuidador} disabled={saving}>
                <Text style={stylesHome.buttonText}>{saving ? 'Salvando...' : 'Salvar cuidador'}</Text>
              </Pressable>
              <Pressable style={stylesHome.linkButton} onPress={onCancelarCadastroCuidador}>
                <Text style={stylesHome.linkText}>Cancelar</Text>
              </Pressable>
            </View>
          )}
        </>
      )}
    </View>
  );

  return (
    <ScrollView contentContainerStyle={stylesHome.container} keyboardShouldPersistTaps="handled">
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
