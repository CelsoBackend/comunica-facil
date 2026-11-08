import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { runMigrations } from '@/data/storage';
import { SessaoRepository } from '@/data/repositories';
import AuthScreen from '@/screens/AuthScreen';
import CriarContaScreen from '@/screens/CriarContaScreen';
import HomeScreen from '@/screens/HomeScreen';
import LoginCuidadorEdicaoScreen from '@/screens/LoginCuidadorEdicaoScreen';
import MensagemTelaCheiaScreen from '@/screens/MensagemTelaCheiaScreen';
import ResetarSenhaScreen from '@/screens/ResetarSenhaScreen';

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
          <Stack.Screen name="Auth" component={AuthScreen} options={{ title: 'Login' }} />
          <Stack.Screen name="CriarConta" component={CriarContaScreen} options={{ title: 'Criar Conta' }} />
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Comunica Fácil' }} />
          <Stack.Screen
            name="LoginCuidadorEdicao"
            component={LoginCuidadorEdicaoScreen}
            options={{ title: 'login cuidador' }}
          />
          <Stack.Screen name="ResetarSenha" component={ResetarSenhaScreen} options={{ title: 'Resetar Senha' }} />
          <Stack.Screen
            name="MensagemTelaCheia"
            component={MensagemTelaCheiaScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
