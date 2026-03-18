import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity,
  SafeAreaView, StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

interface Step3Props {
  onNext?: (selectedDifficulty: string) => void;
  onBack?: () => void;
}

export default function OnboardingStep3({ onNext, onBack }: Step3Props) {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const options = [
    { id: 'gasto_maior', label: "Gasto mais do que ganho", icon: "trending-down-outline" },
    { id: 'sem_rastreio', label: "Não sei para onde meu dinheiro vai", icon: "search-outline" },
    { id: 'dificuldade_planejar', label: "Tenho dificuldade em planejar", icon: "calendar-outline" },
    { id: 'dividas', label: "Tenho dívidas", icon: "warning-outline" },
    { id: 'nao_economizo', label: "Não consigo economizar", icon: "lock-closed-outline" },
  ];

  const handleContinue = () => {
    if (!selectedOption) return;

    console.log("Maior dificuldade:", selectedOption);

    if (onNext) {
      onNext(selectedOption);
    } else {
      router.push('/screenInicio4');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* --- HEADER: BACK BUTTON & PROGRESS BAR 3/5 --- */}
      <View style={styles.header}>
        <View style={styles.navRow}>
          <TouchableOpacity
            onPress={() => (onBack ? onBack() : router.push('/screenInicio2'))}
            style={styles.backBtn}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>

          <Text style={styles.stepText}>3 <Text style={{ color: '#666' }}>DE</Text> 5</Text>

          <View style={styles.iconPlaceholder} />
        </View>

        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: '60%' }]} />
        </View>
      </View>

      {/* --- CONTENT: PERGUNTA PRINCIPAL --- */}
      <View style={styles.content}>
        <Text style={styles.questionText}>Qual é sua maior dificuldade com dinheiro?</Text>
        <Text style={styles.subtitleText}>
          Diagnosticar o problema exato é o primeiro passo para a nossa engenharia resolver.
        </Text>

        {/* --- OPÇÕES DE RESPOSTA --- */}
        <View style={styles.optionsContainer}>
          {options.map((option) => {
            const isSelected = selectedOption === option.id;

            return (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.optionCard,
                  isSelected && styles.optionCardSelected
                ]}
                onPress={() => setSelectedOption(option.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.iconBox, isSelected && styles.iconBoxSelected]}>
                  <Ionicons
                    name={option.icon as any}
                    size={22}
                    color={isSelected ? "#00E5FF" : "#888"}
                  />
                </View>

                <Text style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}>
                  {option.label}
                </Text>

                {/* Indicador Visual (Radio Button) */}
                <View style={[styles.radio, isSelected && styles.radioSelected]}>
                  {isSelected && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* --- FOOTER: BOTÃO NEXT --- */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.nextButtonWrapper}
          onPress={handleContinue}
          disabled={!selectedOption}
        >
          {selectedOption ? (
            <LinearGradient
              colors={['#00E5FF', '#0099B3']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.nextButtonActive}
            >
              <Text style={styles.nextButtonTextActive}>CONTINUAR</Text>
              <Ionicons name="arrow-forward" size={20} color="#000" />
            </LinearGradient>
          ) : (
            <View style={styles.nextButtonDisabled}>
              <Text style={styles.nextButtonTextDisabled}>SELECIONE UMA OPÇÃO</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },

  // Header & Progress
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  navRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'flex-start' },
  iconPlaceholder: { width: 40 },
  stepText: { color: '#FFF', fontSize: 12, fontWeight: '900', letterSpacing: 2 },
  progressBarBg: { height: 4, backgroundColor: '#1A1A1A', borderRadius: 2, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#00E5FF', borderRadius: 2 },

  // Content
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 30 },
  questionText: { color: '#FFF', fontSize: 32, fontWeight: '900', lineHeight: 40, letterSpacing: -1 },
  subtitleText: { color: '#666', fontSize: 14, marginTop: 12, marginBottom: 40, lineHeight: 22 },

  // Options
  optionsContainer: { gap: 14 },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0A0A0A',
    borderWidth: 1,
    borderColor: '#1A1A1A',
    borderRadius: 20,
    padding: 16,
  },
  optionCardSelected: {
    borderColor: '#00E5FF',
    backgroundColor: '#00E5FF0A',
  },
  iconBox: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  iconBoxSelected: { backgroundColor: '#00E5FF15' },
  optionLabel: { flex: 1, color: '#AAA', fontSize: 16, fontWeight: '600' },
  optionLabelSelected: { color: '#FFF', fontWeight: '800' },

  // Radio
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#333', justifyContent: 'center', alignItems: 'center' },
  radioSelected: { borderColor: '#00E5FF' },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#00E5FF' },

  // Footer & Button
  footer: { paddingHorizontal: 24, paddingBottom: 40, paddingTop: 20 },
  nextButtonWrapper: { width: '100%' },
  nextButtonActive: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    paddingVertical: 20, borderRadius: 100, gap: 10,
    shadowColor: '#00E5FF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5
  },
  nextButtonTextActive: { color: '#000', fontSize: 14, fontWeight: '900', letterSpacing: 1.5 },
  nextButtonDisabled: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    paddingVertical: 20, borderRadius: 100, backgroundColor: '#111', borderWidth: 1, borderColor: '#222'
  },
  nextButtonTextDisabled: { color: '#555', fontSize: 12, fontWeight: '800', letterSpacing: 1.5 },
});