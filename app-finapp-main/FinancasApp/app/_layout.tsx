import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" backgroundColor="#121212" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />

        {/* Modal do botão central flutuante */}
        <Stack.Screen
          name="new-transaction"
          options={{
            presentation: 'modal',
            headerShown: true,
            title: 'Nova Transação',
            headerStyle: { backgroundColor: '#1E1E1E' },
            headerTintColor: '#FFFFFF',
          }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}