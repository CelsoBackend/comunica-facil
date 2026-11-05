import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { runMigrations } from '@/data/storage';
import { SessaoRepository } from '@/data/repositories';
import AuthScreen from '@/screens/authScreen';
import criarContaScreen from '@/screens/criarContaScreen';
import homeScreen from '@/screens/homeScreen';
import loginCuidadorEdicaoScreen from '@/screens/loginCuidadorEdicaoScreen';
import mensagemTelaCheiaScreen from '@/screens/mensagemTelaCheiaScreen';
import resetarSenhaScreen from '@/screens/resetarSenhaScreen';

const sessaoRepository = new SessaoRepository();
const SESSAO_ID = 'principal';

export type RootStackParamList = {
  Auth: undefined;
  CriarConta: undefined;
  Home: undefined;
  LoginCuidadorEdicao: undefined;
  MensagemTelaCheia: {
    atencao: string;
    texto: string;
    cor: string;
  };
  ResetarSenha: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [loadingSessao, setLoadingSessao] = useState(true);
  const [rotaInicial, setRotaInicial] = useState<keyof RootStackParamList>('Auth');

  useEffect(() => {
    const carregarSessao = async () => {
      setLoadingSessao(true);

      try {
        await runMigrations();
        const sessao = await sessaoRepository.findById(SESSAO_ID);
        setRotaInicial(sessao?.ativa ? 'Home' : 'Auth');
      } catch (erro) {
        console.error(erro);
        setRotaInicial('Auth');
      } finally {
        setLoadingSessao(false);
      }
    };

    carregarSessao();
  }, []);

  if (loadingSessao) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#0b3a8f" />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName={rotaInicial}>
          <Stack.Screen name="Auth" component={AuthScreen} options={{ title: 'login' }} />
          <Stack.Screen name="CriarConta" component={criarContaScreen} options={{ title: 'criar conta' }} />
          <Stack.Screen name="Home" component={homeScreen} options={{ title: 'Comunica Fácil' }} />
          <Stack.Screen
            name="LoginCuidadorEdicao"
            component={loginCuidadorEdicaoScreen}
            options={{ title: 'login cuidador' }}
          />
          <Stack.Screen name="ResetarSenha" component={resetarSenhaScreen} options={{ title: 'resetar senha' }} />
          <Stack.Screen
            name="MensagemTelaCheia"
            component={mensagemTelaCheiaScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
