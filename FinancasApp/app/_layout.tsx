import { Stack } from 'expo-router';
import { StatusBar } from 'react-native';

export default function RootLayout() {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      <Stack screenOptions={{ headerShown: false }}>
        {/* Aponta para a pasta (tabs) */}
        <Stack.Screen name="(tabs)" />
      </Stack>
    </>
  );
}