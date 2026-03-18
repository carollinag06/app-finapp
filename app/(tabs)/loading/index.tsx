import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Animated, SafeAreaView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function LoadingSetup() {
  const router = useRouter();

  // Valores da animação
  const pulseAnim = useRef(new Animated.Value(0.4)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 1. Efeito de Pulsar (Opacidade)
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0.4, duration: 800, useNativeDriver: true })
      ])
    ).start();

    // 2. Efeito de Rotação contínua
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true
      })
    ).start();

    // 3. Tempo simulado de carregamento (3 segundos) antes de navegar para o login
    const timer = setTimeout(() => {
      // IMPORTANTE: Aqui você define para onde o app vai APÓS o loading!
      // Queremos ir para a tela de login.
      router.replace('/login');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Convertendo o valor de 0 a 1 em graus (0deg a 360deg)
  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <View style={styles.content}>
        {/* Ícone Animado */}
        <Animated.View style={{ transform: [{ rotate: spin }], opacity: pulseAnim, marginBottom: 30 }}>
          <Ionicons name="aperture-outline" size={90} color="#00E5FF" />
        </Animated.View>

        {/* Textos de Engajamento */}
        <Text style={styles.titleText}>Configurando sua IA...</Text>
        <Text style={styles.subtitleText}>
          Ajustando o algoritmo para o seu perfil financeiro.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 },
  titleText: { color: '#FFF', fontSize: 24, fontWeight: '900', letterSpacing: -0.5, marginBottom: 12, textAlign: 'center' },
  subtitleText: { color: '#888', fontSize: 16, textAlign: 'center', lineHeight: 24 },
});