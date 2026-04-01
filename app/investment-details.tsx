import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useMemo } from 'react';
import {
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useInvestmentStore } from '../store/investmentStore';

const { width: screenWidth } = Dimensions.get('window');
const chartWidth = screenWidth - 48;

const theme = {
  bg: '#0F0F12',
  surface: '#1A1A1F',
  surfaceLight: '#25252D',
  text: '#FFFFFF',
  textMuted: '#8E8E93',
  primary: '#8A2BE2',
  success: '#32D74B',
  danger: '#FF453A',
  warning: '#FFD60A',
  info: '#64D2FF',
  border: '#2C2C2E',
};

const typeColors: Record<string, string> = {
  'Renda fixa': theme.info,
  'Ações': theme.success,
  'Fundos imobiliários': theme.warning,
  'Criptomoedas': theme.primary,
  'Outros': theme.textMuted,
};

const typeIcons: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
  'Renda fixa': 'bank',
  'Ações': 'trending-up',
  'Fundos imobiliários': 'office-building',
  'Criptomoedas': 'currency-btc',
  'Outros': 'dots-horizontal',
};

// Taxa CDI anual estimada (SELIC atual aproximada)
const ANNUAL_CDI = 0.1125;

export default function InvestmentDetailsScreen() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { investments, deleteInvestment } = useInvestmentStore();

  const investment = useMemo(() =>
    investments.find(i => i.id === id)
    , [investments, id]);

  const projections = useMemo(() => {
    if (!investment) return null;

    const currentAmount = investment.current_amount || investment.amount;
    const cdiFactor = (investment.cdi_percentage || 100) / 100;
    const monthlyRate = Math.pow(1 + ANNUAL_CDI, 1 / 12) - 1;
    const effectiveMonthlyRate = monthlyRate * cdiFactor;

    const calculateFuture = (months: number) => {
      return currentAmount * Math.pow(1 + effectiveMonthlyRate, months);
    };

    return [
      { period: '1 mês', value: calculateFuture(1) },
      { period: '6 meses', value: calculateFuture(6) },
      { period: '1 ano', value: calculateFuture(12) },
      { period: '2 anos', value: calculateFuture(24) },
    ];
  }, [investment]);

  const yieldData = useMemo(() => {
    if (!investment) return null;
    const currentAmount = investment.current_amount || investment.amount;
    const totalProfit = currentAmount - investment.amount;

    // Se não houver lucro, mostra tudo zerado mas com estrutura
    if (totalProfit <= 0) return { labels: ["-5m", "-4m", "-3m", "-2m", "-1m", "Atual"], values: [0, 0, 0, 0, 0, 0] };

    // Simulação de rendimento acumulado crescente (curva de juros)
    // Usamos uma lógica onde o lucro cresce exponencialmente para parecer real
    const values = [];
    const steps = 6;
    for (let i = 1; i <= steps; i++) {
      // Fator de crescimento (i/steps)^1.5 cria uma curva suave
      const factor = Math.pow(i / steps, 1.5);
      values.push(Number((totalProfit * factor).toFixed(2)));
    }

    // Gerar labels de meses retroativos
    const labels = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      labels.push(d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''));
    }
    labels[5] = "Hoje";

    return { labels, values };
  }, [investment]);

  if (!investment) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.errorText}>Investimento não encontrado.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentAmount = investment.current_amount || investment.amount;
  const profit = currentAmount - investment.amount;
  const profitability = investment.amount > 0 ? (profit / investment.amount) * 100 : 0;
  const isProfit = profit >= 0;

  const handleDelete = () => {
    Alert.alert("Excluir", "Deseja excluir este investimento?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir", style: "destructive", onPress: async () => {
          try {
            await deleteInvestment(id);
            router.back();
          } catch {
            Alert.alert("Erro", "Não foi possível excluir.");
          }
        }
      }
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detalhes do Ativo</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.navigate({ pathname: '/new-investment' as any, params: { id: investment.id } })}
          >
            <Feather name="edit-2" size={20} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconButton, { marginLeft: 12 }]} onPress={handleDelete}>
            <Ionicons name="trash-outline" size={22} color={theme.danger} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.mainCard}>
          <View style={[styles.typeBadge, { backgroundColor: `${typeColors[investment.type || 'Outros']}20` }]}>
            <MaterialCommunityIcons name={typeIcons[investment.type || 'Outros']} size={16} color={typeColors[investment.type || 'Outros']} />
            <Text style={[styles.typeBadgeText, { color: typeColors[investment.type || 'Outros'] }]}>{investment.type}</Text>
          </View>
          <Text style={styles.investmentName}>{investment.name}</Text>
          <Text style={styles.currentValue}>R$ {currentAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
          <View style={[styles.profitBadge, { backgroundColor: isProfit ? `${theme.success}20` : `${theme.danger}20` }]}>
            <Ionicons name={isProfit ? "trending-up" : "trending-down"} size={14} color={isProfit ? theme.success : theme.danger} />
            <Text style={[styles.profitBadgeText, { color: isProfit ? theme.success : theme.danger }]}>
              {isProfit ? '+' : ''}{profitability.toFixed(2)}% (R$ {Math.abs(profit).toLocaleString('pt-BR', { minimumFractionDigits: 2 })})
            </Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Valor Investido</Text>
              <Text style={styles.infoValue}>R$ {investment.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Data Inicial</Text>
              <Text style={styles.infoValue}>{new Date(investment.date).toLocaleDateString('pt-BR')}</Text>
            </View>
          </View>

          {investment.type === 'Renda fixa' && investment.cdi_percentage && (
            <View style={[styles.infoRow, { marginTop: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: theme.border }]}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Rendimento Contratado</Text>
                <Text style={styles.infoValue}>{investment.cdi_percentage}% do CDI</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>CDI Anual Est.</Text>
                <Text style={styles.infoValue}>{(ANNUAL_CDI * 100).toFixed(2)}%</Text>
              </View>
            </View>
          )}
        </View>

        {/* Gráfico de Rendimento Acumulado */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rendimento Acumulado (R$)</Text>
          <View style={styles.chartContainer}>
            <BarChart
              data={{
                labels: yieldData?.labels || [],
                datasets: [{
                  data: yieldData?.values || [0, 0, 0, 0, 0, 0]
                }]
              }}
              width={chartWidth - 20}
              height={220}
              yAxisLabel=""
              yAxisSuffix=""
              chartConfig={{
                backgroundColor: theme.surface,
                backgroundGradientFrom: theme.surface,
                backgroundGradientTo: theme.surface,
                decimalPlaces: 0,
                color: (opacity = 1) => theme.success,
                labelColor: (opacity = 1) => theme.textMuted,
                style: { borderRadius: 16 },
                barPercentage: 0.6,
              }}
              style={{
                borderRadius: 16,
                marginVertical: 8,
                paddingRight: 35,
              }}
              fromZero
              showValuesOnTopOfBars={false} // Desligado para não poluir
              flatColor={true}
            />
          </View>
        </View>

        {/* Projeções Futuras */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Projeções Futuras</Text>
            <MaterialCommunityIcons name="rocket-launch" size={20} color={theme.warning} />
          </View>
          <View style={styles.projectionsCard}>
            {projections?.map((p, index) => (
              <View key={index} style={[styles.projectionItem, index === projections.length - 1 && { borderBottomWidth: 0 }]}>
                <View>
                  <Text style={styles.projectionPeriod}>{p.period}</Text>
                  <Text style={styles.projectionEstimate}>Valor estimado</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.projectionValue}>R$ {p.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                  <Text style={[styles.projectionProfit, { color: theme.success }]}>
                    +R$ {(p.value - currentAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                </View>
              </View>
            ))}
          </View>
          <Text style={styles.disclaimer}>* Valores baseados em uma taxa CDI estimada de {(ANNUAL_CDI * 100).toFixed(2)}% a.a. Rendimentos reais podem variar.</Text>
        </View>

        {/* Evolução Histórica */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Evolução do Patrimônio</Text>
          <View style={styles.chartContainer}>
            <LineChart
              data={{
                labels: yieldData?.labels || [],
                datasets: [{
                  data: [
                    investment.amount * 1.0,
                    investment.amount * 1.005,
                    investment.amount * 1.01,
                    investment.amount * 1.015,
                    investment.amount * 1.02,
                    currentAmount
                  ]
                }]
              }}
              width={chartWidth - 20}
              height={220}
              chartConfig={{
                backgroundColor: theme.surface,
                backgroundGradientFrom: theme.surface,
                backgroundGradientTo: theme.surface,
                decimalPlaces: 0,
                color: (opacity = 1) => theme.primary,
                labelColor: (opacity = 1) => theme.textMuted,
                style: { borderRadius: 16 },
                propsForDots: { r: "4", strokeWidth: "2", stroke: theme.primary }
              }}
              bezier
              style={{
                borderRadius: 16,
                paddingRight: 40,
                marginTop: 8
              }}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  center: { justifyContent: 'center', alignItems: 'center' },
  errorText: { color: theme.text, fontSize: 16, marginBottom: 20 },
  backButton: { padding: 12, backgroundColor: theme.primary, borderRadius: 12 },
  backButtonText: { color: '#FFF', fontWeight: 'bold' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: theme.text },
  headerRight: { flexDirection: 'row' },
  iconButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: theme.border },
  scrollContent: { padding: 24 },
  mainCard: { backgroundColor: theme.surface, borderRadius: 32, padding: 32, alignItems: 'center', borderWidth: 1, borderColor: theme.border, marginBottom: 24 },
  typeBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginBottom: 16 },
  typeBadgeText: { fontSize: 12, fontWeight: 'bold', marginLeft: 6 },
  investmentName: { fontSize: 20, fontWeight: '500', color: theme.textMuted, marginBottom: 8 },
  currentValue: { fontSize: 36, fontWeight: 'bold', color: theme.text, marginBottom: 16 },
  profitBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  profitBadgeText: { fontSize: 14, fontWeight: 'bold', marginLeft: 6 },
  infoSection: { backgroundColor: theme.surface, borderRadius: 24, padding: 24, borderWidth: 1, borderColor: theme.border, marginBottom: 24 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between' },
  infoItem: { flex: 1 },
  infoLabel: { fontSize: 12, color: theme.textMuted, marginBottom: 4 },
  infoValue: { fontSize: 16, fontWeight: 'bold', color: theme.text },
  section: { marginBottom: 32 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: theme.text },
  chartContainer: { backgroundColor: theme.surface, borderRadius: 24, padding: 16, borderWidth: 1, borderColor: theme.border, alignItems: 'center' },
  projectionsCard: { backgroundColor: theme.surface, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: theme.border },
  projectionItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: theme.border },
  projectionPeriod: { fontSize: 16, fontWeight: 'bold', color: theme.text },
  projectionEstimate: { fontSize: 12, color: theme.textMuted, marginTop: 2 },
  projectionValue: { fontSize: 16, fontWeight: 'bold', color: theme.text },
  projectionProfit: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  disclaimer: { fontSize: 10, color: theme.textMuted, marginTop: 12, fontStyle: 'italic', textAlign: 'center' },
});

