import { Ionicons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { Stack, router, useRootNavigationState, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

<<<<<<< HEAD
// Impede que a Splash Screen feche automaticamente antes das fontes carregarem
SplashScreen.preventAutoHideAsync();

=======
>>>>>>> 14802390a1a29baf316ffb435ca22710137c5412
// Importação das stores para gerenciar autenticação e dados ao iniciar o app
import { useAuthStore } from '../store/authStore';
import { useCardStore } from '../store/cardStore';
import { useCategoryStore } from '../store/categoryStore';
import { useTransactionStore } from '../store/transactionStore';

<<<<<<< HEAD
// ROOT LAYOUT (O "Pai" de todos os componentes) - Sincronizado com rotas atuais
export default function RootLayout() {
  const segments = useSegments(); // Obtém a rota atual em partes (Ex: ['(tabs)', 'index'])
  const rootNavigationState = useRootNavigationState(); // Estado da navegação do sistema

  // Carregamento de fontes
  const [loaded, error] = useFonts({
    ...Ionicons.font,
  });

=======
/**
 * ROOT LAYOUT (O "Pai" de todos os componentes)
 * Este arquivo define a estrutura base do app, navegação global e regras de autenticação.
 */
export default function RootLayout() {
  const segments = useSegments(); // Obtém a rota atual em partes (Ex: ['(tabs)', 'index'])
  const rootNavigationState = useRootNavigationState(); // Estado da navegação do sistema
  
>>>>>>> 14802390a1a29baf316ffb435ca22710137c5412
  // Estado global de autenticação
  const { user, isAuthReady, checkAuth } = useAuthStore();

  // Funções para limpar os dados locais (usadas quando o usuário faz logout)
  const resetTransactions = useTransactionStore((state) => state.reset);
  const resetCards = useCardStore((state) => state.reset);
  const resetCategories = useCategoryStore((state) => state.reset);

<<<<<<< HEAD
  // EFEITO: Esconde a Splash Screen quando as fontes e o auth estiverem prontos
  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

=======
>>>>>>> 14802390a1a29baf316ffb435ca22710137c5412
  // EFEITO: Verifica se o usuário já está logado assim que o app abre
  useEffect(() => {
    checkAuth();
  }, []);

  // EFEITO: Se o usuário deslogar, limpa todos os dados sensíveis do estado
  useEffect(() => {
    if (!user) {
      resetTransactions();
      resetCards();
      resetCategories();
    }
  }, [user]);

  /**
   * PROTEÇÃO DE ROTAS (Middleware de Autenticação)
   * Redireciona o usuário baseado no estado de login:
   * - Se NÃO logado e tentar acessar áreas restritas -> vai para 'Welcome'
   * - Se logado e estiver em áreas de login/welcome -> vai para o Dashboard '(tabs)'
   */
  useEffect(() => {
    if (!isAuthReady || !rootNavigationState?.key || !loaded) return;

<<<<<<< HEAD
    // @ts-ignore - Os segmentos podem variar e o TS é muito restrito aqui
    const currentSegments = segments as string[];
    const firstSegment = currentSegments[0];

    // Define quais rotas são protegidas
    const inAuthGroup = firstSegment === '(tabs)' || 
                       firstSegment === 'nova-transacao' || 
                       firstSegment === 'novo-cartao' || 
                       firstSegment === 'perfil' || 
                       firstSegment === 'categorias' ||
                       firstSegment === 'nova-categoria' ||
                       firstSegment === 'cartoes';
    
    // Verifica se está na rota raiz
    const isRoot = currentSegments.length === 0 || firstSegment === 'index' || firstSegment === '';

    if (!user && (inAuthGroup || isRoot)) {
      // Usuário não logado tentando acessar o app ou na raiz -> Redireciona para Welcome
      router.replace('/welcome');
    } else if (user && (!inAuthGroup || isRoot)) {
      // Usuário logado tentando acessar telas de welcome/login ou na raiz -> Redireciona para o App
      router.replace('/(tabs)');
=======
    // Define quais rotas são protegidas
    const inAuthGroup = segments[0] === '(tabs)' || segments[0] === 'new-transaction' || segments[0] === 'new-card' || segments[0] === 'profile' || segments[0] === 'categories';

    if (!user && inAuthGroup) {
      // Usuário não logado tentando acessar o app -> Redireciona para Welcome
      setTimeout(() => {
        router.replace('/welcome');
      }, 0);
    } else if (user && !inAuthGroup) {
      // Usuário logado tentando acessar telas de boas-vindas/login -> Redireciona para o App
      setTimeout(() => {
        // @ts-ignore - A rota existe mas o TS pode não reconhecer o grupo de abas
        router.replace('/(tabs)');
      }, 0);
>>>>>>> 14802390a1a29baf316ffb435ca22710137c5412
    }
  }, [user, isAuthReady, segments, rootNavigationState?.key, loaded]);

<<<<<<< HEAD
  // Enquanto a autenticação ou as fontes estão sendo verificadas, não renderiza nada
  if (!isAuthReady || (!loaded && !error)) return null;
=======
  // Enquanto a autenticação está sendo verificada, não renderiza nada (evita "piscada" de tela)
  if (!isAuthReady) return null;
>>>>>>> 14802390a1a29baf316ffb435ca22710137c5412

  return (
    <SafeAreaProvider>
      {/* GestureHandlerRootView: Necessário para animações e gestos (como deslizar para excluir) */}
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#0F0F0F' }}>
        <StatusBar style="light" />
        
        {/* Stack: Gerencia a pilha de telas do app */}
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0F0F0F' } }}>
          {/* Telas Públicas */}
<<<<<<< HEAD
          <Stack.Screen name="welcome/index" />
          <Stack.Screen name="login/index" />
          <Stack.Screen name="cadastro/index" />
=======
          <Stack.Screen name="welcome" />
          <Stack.Screen name="login" />
          <Stack.Screen name="cadastro" />
>>>>>>> 14802390a1a29baf316ffb435ca22710137c5412
          
          {/* Telas Protegidas (Dashboard) */}
          <Stack.Screen name="(tabs)" />
          
          {/* Modais: Telas que abrem "por cima" das outras */}
          <Stack.Screen
            name="nova-transacao/index"
            options={{
              presentation: 'modal',
              headerShown: true,
              title: 'Nova Transação',
              headerStyle: { backgroundColor: '#1E1E1E' },
              headerTintColor: '#FFFFFF',
            }}
          />
          <Stack.Screen
            name="novo-cartao/index"
            options={{
              presentation: 'modal',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="perfil/index"
            options={{
              presentation: 'modal',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="categorias/index"
            options={{
              presentation: 'modal',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="nova-categoria/index"
            options={{
              presentation: 'modal',
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="cartoes/index"
            options={{
              presentation: 'modal',
              headerShown: false,
            }}
          />
        </Stack>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
