import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCardStore } from '../store/cardStore';

const theme = {
  bg: '#0F0F12',
  surface: '#1A1A1F',
  surfaceLight: '#25252D',
  text: '#FFFFFF',
  textMuted: '#8E8E93',
  primary: '#8A2BE2',
  primaryLight: 'rgba(138, 43, 226, 0.15)',
  border: '#2C2C2E',
  danger: '#FF453A',
};

interface CardColor {
  main: string;
  grad: string[];
}

const cardColors: CardColor[] = [
  { main: '#8A2BE2', grad: ['#8A2BE2', '#4B0082'] }, // Roxo
  { main: '#2196F3', grad: ['#2196F3', '#1565C0'] }, // Azul
  { main: '#FF9F0A', grad: ['#FF9F0A', '#FF8C00'] }, // Laranja
  { main: '#32D74B', grad: ['#32D74B', '#1DB954'] }, // Verde
  { main: '#FF453A', grad: ['#FF453A', '#C0392B'] }, // Vermelho
  { main: '#1C1C1E', grad: ['#2C2C2E', '#000000'] }, // Preto
];

const cardBrands = [
  { name: 'Visa', icon: 'credit-card-outline' },
  { name: 'Mastercard', icon: 'credit-card-chip-outline' },
  { name: 'Nubank', icon: 'card-account-details-outline' },
  { name: 'Outro', icon: 'card-outline' },
];

export default function NewCardScreen() {
  const params = useLocalSearchParams();
  const editId = params.id as string;
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);

  const [name, setName] = useState('');
  const [limit, setLimit] = useState(''); // Raw numbers string
  const [closingDay, setClosingDay] = useState('1');
  const [dueDay, setDueDay] = useState('10');
  const [selectedColor, setSelectedColor] = useState(cardColors[0]);
  const [selectedBrand, setSelectedBrand] = useState(cardBrands[0].name);
  const [loading, setLoading] = useState(false);

  const { cards, addCard, updateCard, deleteCard } = useCardStore();

  const displayLimit = useMemo(() => {
    if (!limit) return '0,00';
    const numberValue = Number(limit) / 100;
    return numberValue.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, [limit]);

  useEffect(() => {
    if (editId) {
      const card = cards.find(c => c.id === editId);
      if (card) {
        setName(card.name);
        setLimit((card.credit_limit * 100).toFixed(0));
        setClosingDay(card.closing_day.toString());
        setDueDay(card.due_day.toString());
        const colorObj = cardColors.find(c => c.main === card.color) || cardColors[0];
        setSelectedColor(colorObj);
        setSelectedBrand(card.brand);
      }
    }
  }, [editId, cards]);

  const handleSave = useCallback(async () => {
    const numericLimit = Number(limit) / 100;

    if (!name.trim()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Erro", "Por favor, insira o nome do cartão.");
      return;
    }

    if (isNaN(numericLimit) || numericLimit <= 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Erro", "Por favor, insira um limite válido.");
      return;
    }

    const cardData = {
      name,
      credit_limit: numericLimit,
      closing_day: parseInt(closingDay),
      due_day: parseInt(dueDay),
      color: selectedColor.main,
      brand: selectedBrand,
    };

    setLoading(true);
    try {
      if (editId) {
        await updateCard(editId, cardData);
      } else {
        await addCard(cardData);
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (err) {
      console.error("Erro ao salvar cartão:", err);
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      Alert.alert("Erro", `Ocorreu um erro ao salvar o cartão: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [name, limit, closingDay, dueDay, selectedColor, selectedBrand, editId, addCard, updateCard]);

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert("Excluir Cartão", "Deseja realmente excluir este cartão?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir", style: "destructive", onPress: async () => {
          setLoading(true);
          try {
            await deleteCard(editId);
            router.back();
          } catch (err) {
            console.error("Erro ao excluir cartão:", err);
            const errorMessage = err instanceof Error ? err.message : "Não foi possível excluir o cartão no momento.";
            Alert.alert("Erro ao Excluir", errorMessage);
          } finally {
            setLoading(false);
          }
        }
      }
    ]);
  };

  const formatLimit = (text: string) => {
    const cleanValue = text.replace(/\D/g, '');
    if (!cleanValue || cleanValue === '0') {
      setLimit('');
      return;
    }
    setLimit(cleanValue);
  };

  const onSelectColor = (color: CardColor) => {
    Haptics.selectionAsync();
    setSelectedColor(color);
  };

  const onSelectBrand = (brand: string) => {
    Haptics.selectionAsync();
    setSelectedBrand(brand);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
            <Ionicons name="close" size={24} color={theme.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{editId ? 'Editar Cartão' : 'Novo Cartão'}</Text>
          {editId ? (
            <TouchableOpacity onPress={handleDelete}>
              <Ionicons name="trash-outline" size={24} color={theme.danger} />
            </TouchableOpacity>
          ) : <View style={{ width: 40 }} />}
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* Card Preview Visual Avançado */}
          <LinearGradient
            colors={selectedColor.grad as [string, string, ...string[]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardPreview}
          >
            {/* Detalhes de textura do cartão */}
            <View style={styles.cardOverlay}>
              <View style={styles.cardPreviewTop}>
                <View style={styles.cardChip}>
                  <View style={styles.chipLine} />
                  <View style={styles.chipLine} />
                  <View style={styles.chipLine} />
                </View>
                <MaterialCommunityIcons
                  name={(cardBrands.find(b => b.name === selectedBrand)?.icon as keyof typeof MaterialCommunityIcons.glyphMap) || 'credit-card-outline'}
                  size={40}
                  color="#FFF"
                  style={{ opacity: 0.9 }}
                />
              </View>

              <View style={styles.cardPreviewMiddle}>
                <Text style={styles.cardPreviewLimitLabel}>LIMITE DISPONÍVEL</Text>
                <Text style={styles.cardPreviewLimitValue}>R$ {displayLimit}</Text>
              </View>

              <View style={styles.cardPreviewBottom}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardPreviewName}>{name.toUpperCase() || 'NOME NO CARTÃO'}</Text>
                </View>
                <View style={styles.cardPreviewDates}>
                  <View style={{ alignItems: 'flex-end', marginRight: 15 }}>
                    <Text style={styles.cardPreviewDayLabel}>FECHA</Text>
                    <Text style={styles.cardPreviewDayValue}>{closingDay.padStart(2, '0')}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.cardPreviewDayLabel}>VENCE</Text>
                    <Text style={styles.cardPreviewDayValue}>{dueDay.padStart(2, '0')}</Text>
                  </View>
                </View>
              </View>
            </View>
          </LinearGradient>

          {/* Nome do Cartão */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Apelido do Cartão</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="bookmark-outline" size={20} color={theme.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Ex: Meu Inter, Nubank Carol..."
                placeholderTextColor={theme.textMuted}
                value={name}
                onChangeText={setName}
                maxLength={20}
              />
            </View>
          </View>

          {/* Limite (Calculator Style) */}
          <TouchableOpacity
            style={styles.limitContainer}
            onPress={() => inputRef.current?.focus()}
            activeOpacity={1}
          >
            <Text style={styles.limitLabel}>Qual o limite total?</Text>
            <View style={styles.limitInputWrapper}>
              <Text style={[styles.currencySymbol, { color: selectedColor.main }]}>R$</Text>
              <Text style={[styles.displayLimitText, { color: selectedColor.main }]}>
                {displayLimit}
              </Text>
            </View>
            <View style={styles.hiddenInputWrapper}>
              <TextInput
                ref={inputRef}
                style={styles.hiddenInput}
                keyboardType="number-pad"
                value={limit}
                onChangeText={formatLimit}
                maxLength={11}
                autoFocus={!editId}
                placeholder="0"
                placeholderTextColor="transparent"
                caretHidden={true}
              />
              <Text style={styles.helperText}>Toque para editar o valor</Text>
            </View>
          </TouchableOpacity>

          {/* Datas */}
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
              <Text style={styles.label}>Fechamento</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="calendar-outline" size={20} color={theme.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Dia"
                  placeholderTextColor={theme.textMuted}
                  keyboardType="numeric"
                  value={closingDay}
                  onChangeText={(val) => setClosingDay(val.replace(/\D/g, ''))}
                  maxLength={2}
                />
              </View>
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Vencimento</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="calendar-outline" size={20} color={theme.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Dia"
                  placeholderTextColor={theme.textMuted}
                  keyboardType="numeric"
                  value={dueDay}
                  onChangeText={(val) => setDueDay(val.replace(/\D/g, ''))}
                  maxLength={2}
                />
              </View>
            </View>
          </View>

          {/* Bandeira / Tipo */}
          <View style={styles.section}>
            <Text style={styles.label}>Bandeira do Cartão</Text>
            <View style={styles.brandGrid}>
              {cardBrands.map((brand) => {
                const isSelected = selectedBrand === brand.name;
                return (
                  <TouchableOpacity
                    key={brand.name}
                    style={[
                      styles.brandCard,
                      isSelected && { backgroundColor: `${selectedColor.main}20`, borderColor: selectedColor.main }
                    ]}
                    onPress={() => onSelectBrand(brand.name)}
                  >
                    <MaterialCommunityIcons
                      name={brand.icon as any}
                      size={24}
                      color={isSelected ? selectedColor.main : theme.textMuted}
                    />
                    <Text style={[styles.brandText, isSelected && { color: selectedColor.main }]}>
                      {brand.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Cor do Cartão */}
          <View style={styles.section}>
            <Text style={styles.label}>Estilo e Cor</Text>
            <View style={styles.colorGrid}>
              {cardColors.map((color, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color.main },
                    selectedColor.main === color.main && styles.colorOptionSelected
                  ]}
                  onPress={() => onSelectColor(color)}
                >
                  {selectedColor.main === color.main && (
                    <Ionicons name="checkmark" size={24} color="#FFF" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: selectedColor.main }, loading && styles.buttonDisabled]}
            onPress={handleSave}
            activeOpacity={0.8}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.saveButtonText}>{editId ? 'Salvar Alterações' : 'Confirmar Cadastro'}</Text>
            )}
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.text,
    letterSpacing: -0.5,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  // Card Preview Estilizado
  cardPreview: {
    height: 210,
    borderRadius: 24,
    marginBottom: 32,
    overflow: 'hidden',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
  },
  cardOverlay: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  cardChip: {
    width: 45,
    height: 35,
    backgroundColor: 'rgba(255,215,0,0.6)',
    borderRadius: 6,
    padding: 5,
    justifyContent: 'space-around',
  },
  chipLine: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    width: '100%',
  },
  cardPreviewTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardPreviewMiddle: {
    marginTop: 10,
  },
  cardPreviewLimitLabel: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
    opacity: 0.7,
    letterSpacing: 1,
    marginBottom: 4,
  },
  cardPreviewLimitValue: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  cardPreviewBottom: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  cardPreviewName: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1.5,
    opacity: 0.9,
  },
  cardPreviewDates: {
    flexDirection: 'row',
  },
  cardPreviewDayLabel: {
    color: '#FFF',
    fontSize: 8,
    fontWeight: 'bold',
    opacity: 0.6,
    marginBottom: 2,
  },
  cardPreviewDayValue: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  // Inputs
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: theme.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 16,
    height: 60,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: theme.text,
    fontSize: 16,
    height: '100%',
  },
  row: {
    flexDirection: 'row',
  },
  // Limit Style
  limitContainer: {
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: theme.surface,
    paddingVertical: 32,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.border,
  },
  limitLabel: {
    color: theme.textMuted,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  limitInputWrapper: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 8,
    opacity: 0.8,
  },
  displayLimitText: {
    fontSize: 48,
    fontWeight: 'bold',
    letterSpacing: -1,
  },
  hiddenInputWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
  helperText: {
    color: theme.textMuted,
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  // Brands
  section: {
    marginBottom: 30,
  },
  brandGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  brandCard: {
    width: '48%',
    flexDirection: 'row',
    backgroundColor: theme.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  brandText: {
    color: theme.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  // Colors
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    justifyContent: 'center',
    paddingVertical: 10,
  },
  colorOption: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorOptionSelected: {
    borderColor: '#FFF',
    transform: [{ scale: 1.1 }],
  },
  // Footer
  footer: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    backgroundColor: theme.bg,
  },
  saveButton: {
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
