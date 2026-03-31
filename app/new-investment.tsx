import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
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
import { InvestmentType, useInvestmentStore } from '../store/investmentStore';

const theme = {
  bg: '#0F0F12',
  surface: '#1A1A1F',
  surfaceLight: '#25252D',
  text: '#FFFFFF',
  textMuted: '#8E8E93',
  primary: '#8A2BE2',
  primaryLight: 'rgba(138, 43, 226, 0.15)',
  border: '#2C2C2E',
  success: '#32D74B',
  danger: '#FF453A',
};

const MAX_WIDTH = 600;

const investmentTypes: InvestmentType[] = [
  'Renda fixa',
  'Ações',
  'Fundos imobiliários',
  'Criptomoedas',
  'Outros'
];

const typeIcons: Record<string, any> = {
  'Renda fixa': 'account-balance',
  'Ações': 'trending-up',
  'Fundos imobiliários': 'domain',
  'Criptomoedas': 'currency-bitcoin',
  'Outros': 'more-horiz',
};

export default function NewInvestmentScreen() {
  const params = useLocalSearchParams();
  const editId = params.id as string;
  const insets = useSafeAreaInsets();
  const investedInputRef = useRef<TextInput>(null);

  const [name, setName] = useState('');
  const [type, setType] = useState<InvestmentType>('Renda fixa');
  const [investedAmount, setInvestedAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [cdiPercentage, setCdiPercentage] = useState('');
  const [date, setDate] = useState(new Date().toISOString());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const { investments, addInvestment, updateInvestment, deleteInvestment } = useInvestmentStore();

  useEffect(() => {
    if (editId) {
      const inv = investments.find(i => i.id === editId);
      if (inv) {
        setName(inv.name);
        setType(inv.type);
        setInvestedAmount((inv.investedAmount * 100).toFixed(0));
        setCurrentAmount((inv.currentAmount * 100).toFixed(0));
        setCdiPercentage(inv.cdiPercentage ? inv.cdiPercentage.toString() : '');
        setDate(inv.date);
      }
    }
  }, [editId, investments]);

  const formatValue = (text: string, setter: (val: string) => void) => {
    const cleanText = text.replace(/\D/g, '');
    setter(cleanText);
  };

  const getDisplayValue = (val: string) => {
    if (!val) return '0,00';
    return (Number(val) / 100).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const onDateChange = (_event: unknown, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate.toISOString());
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Aviso", "Por favor, preencha o nome do investimento.");
      return;
    }
    if (!investedAmount) {
      Alert.alert("Aviso", "Por favor, preencha o valor investido.");
      return;
    }

    const numericInvested = Number(investedAmount) / 100;
    const numericCurrent = currentAmount ? Number(currentAmount) / 100 : numericInvested;

    const data = {
      name: name.trim(),
      type,
      investedAmount: numericInvested,
      currentAmount: numericCurrent,
      date,
      cdiPercentage: type === 'Renda fixa' && cdiPercentage ? Number(cdiPercentage) : undefined,
    };

    setLoading(true);
    try {
      if (editId) {
        await updateInvestment(editId, data);
      } else {
        await addInvestment(data);
      }
      router.back();
    } catch {
      Alert.alert("Erro", "Não foi possível salvar o investimento.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert("Excluir", "Deseja excluir este investimento?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir", style: "destructive", onPress: async () => {
          try {
            await deleteInvestment(editId);
            router.back();
          } catch {
            Alert.alert("Erro", "Não foi possível excluir.");
          }
        }
      }
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.centeredWrapper}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
              <Ionicons name="close" size={24} color={theme.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{editId ? 'Editar Investimento' : 'Novo Investimento'}</Text>
            {editId ? (
              <TouchableOpacity onPress={handleDelete}>
                <Ionicons name="trash-outline" size={24} color={theme.danger} />
              </TouchableOpacity>
            ) : (
              <View style={{ width: 44 }} />
            )}
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <View style={styles.formSection}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nome do Investimento</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Ex: Tesouro Direto 2029"
                    placeholderTextColor={theme.textMuted}
                    value={name}
                    onChangeText={setName}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Tipo de Investimento</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.typeScroll}>
                  {investmentTypes.map((t) => (
                    <TouchableOpacity
                      key={t}
                      style={[styles.typeCard, type === t && styles.typeCardActive]}
                      onPress={() => setType(t)}
                    >
                      <MaterialCommunityIcons
                        name={typeIcons[t]}
                        size={24}
                        color={type === t ? theme.primary : theme.textMuted}
                      />
                      <Text style={[styles.typeText, type === t && styles.typeTextActive]}>{t}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Valor Investido</Text>
                  <TouchableOpacity
                    style={styles.amountContainer}
                    onPress={() => investedInputRef.current?.focus()}
                  >
                    <Text style={styles.amountLabel}>R$</Text>
                    <Text style={styles.amountValue}>{getDisplayValue(investedAmount)}</Text>
                    <TextInput
                      ref={investedInputRef}
                      style={styles.hiddenInput}
                      keyboardType="number-pad"
                      value={investedAmount}
                      onChangeText={(t) => formatValue(t, setInvestedAmount)}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Valor Atual (Opcional)</Text>
                  <View style={styles.amountContainer}>
                    <Text style={styles.amountLabel}>R$</Text>
                    <Text style={styles.amountValue}>{getDisplayValue(currentAmount)}</Text>
                    <TextInput
                      style={styles.hiddenInput}
                      keyboardType="number-pad"
                      value={currentAmount}
                      onChangeText={(t) => formatValue(t, setCurrentAmount)}
                    />
                  </View>
                </View>
              </View>

              {type === 'Renda fixa' && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Rendimento (% do CDI)</Text>
                  <View style={styles.inputContainer}>
                    <MaterialCommunityIcons name="percent" size={20} color={theme.textMuted} style={{ marginRight: 12 }} />
                    <TextInput
                      style={styles.input}
                      placeholder="Ex: 100"
                      placeholderTextColor={theme.textMuted}
                      keyboardType="numeric"
                      value={cdiPercentage}
                      onChangeText={setCdiPercentage}
                    />
                  </View>
                  <Text style={styles.helperText}>Informe quanto do CDI este investimento rende (ex: 100, 110, 120)</Text>
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Data do Investimento</Text>
                <TouchableOpacity style={styles.inputContainer} onPress={() => setShowDatePicker(true)}>
                  <Ionicons name="calendar-outline" size={20} color={theme.textMuted} style={{ marginRight: 12 }} />
                  <Text style={styles.inputText}>{new Date(date).toLocaleDateString('pt-BR')}</Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={new Date(date)}
                    mode="date"
                    display="default"
                    onChange={onDateChange}
                    maximumDate={new Date()}
                  />
                )}
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.saveButton, loading && { opacity: 0.7 }]}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveButtonText}>Salvar Investimento</Text>}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  centeredWrapper: { flex: 1, width: '100%', maxWidth: MAX_WIDTH, alignSelf: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  closeButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: theme.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.border },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: theme.text },
  scrollContent: { paddingBottom: 40 },
  formSection: { paddingHorizontal: 20, gap: 20 },
  inputGroup: { marginBottom: 4 },
  label: { color: theme.text, fontSize: 14, fontWeight: '600', marginBottom: 10 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, borderRadius: 16, height: 56, paddingHorizontal: 16 },
  input: { flex: 1, color: theme.text, fontSize: 16 },
  inputText: { color: theme.text, fontSize: 16 },
  helperText: { fontSize: 12, color: theme.textMuted, marginTop: 4, marginLeft: 4 },
  typeScroll: { gap: 12, paddingVertical: 4 },
  typeCard: { width: 110, height: 100, backgroundColor: theme.surface, borderRadius: 20, borderWidth: 1, borderColor: theme.border, alignItems: 'center', justifyContent: 'center', padding: 10 },
  typeCardActive: { borderColor: theme.primary, backgroundColor: `${theme.primary}10` },
  typeText: { color: theme.textMuted, fontSize: 11, fontWeight: '600', marginTop: 8, textAlign: 'center' },
  typeTextActive: { color: theme.primary },
  row: { flexDirection: 'row', gap: 16 },
  amountContainer: { backgroundColor: theme.surface, borderRadius: 16, borderWidth: 1, borderColor: theme.border, padding: 16, alignItems: 'center' },
  amountLabel: { color: theme.textMuted, fontSize: 14, marginBottom: 4 },
  amountValue: { color: theme.text, fontSize: 24, fontWeight: 'bold' },
  hiddenInput: { position: 'absolute', opacity: 0, width: '100%', height: '100%' },
  footer: { padding: 24, borderTopWidth: 1, borderTopColor: theme.border },
  saveButton: { height: 56, backgroundColor: theme.primary, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  saveButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});
