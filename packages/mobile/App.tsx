import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import HomeScreen from '@/screens/homeScreen';
import MensagemTelaCheiaScreen from '@/screens/mensagemTelaCheiaScreen';

export type RootStackParamList = {
  Home: undefined;
  MensagemTelaCheia: {
    atencao: string;
    texto: string;
    cor: string;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Comunica Fácil' }} />
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
