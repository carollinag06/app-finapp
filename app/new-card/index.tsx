import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCardStore } from '../../store/cardStore';
import { theme } from '../../src/constants/theme';
import { styles } from './styles';

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
      Alert.alert("Erro", "Por favor, insira o nome do cartão.");
      return;
    }

    if (isNaN(numericLimit) || numericLimit <= 0) {
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
    setSelectedColor(color);
  };

  const onSelectBrand = (brand: string) => {
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
