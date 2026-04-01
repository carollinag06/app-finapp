import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useMemo } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { calculateLiveBalance, Investment, useInvestmentStore } from '../../store/investmentStore';

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

export default function InvestmentsScreen() {
  const insets = useSafeAreaInsets();
  const { investments, fetchInvestments } = useInvestmentStore();

  useEffect(() => {
    fetchInvestments();
  }, [fetchInvestments]);

  const stats = useMemo(() => {
    const totalInvested = investments.reduce((acc, i) => acc + i.amount, 0);
    const currentTotal = investments.reduce((acc, i) => acc + calculateLiveBalance(i), 0);
    const profit = currentTotal - totalInvested;
    const profitability = totalInvested > 0 ? (profit / totalInvested) * 100 : 0;

    // Cálculo mais preciso usando taxa CDI anual de 11.25% (SELIC atual estimada)
    // Baseado em 252 dias úteis por ano (padrão de mercado financeiro no Brasil)
    const ANNUAL_CDI = 0.1125;
    const DAILY_RATE = Math.pow(1 + ANNUAL_CDI, 1 / 252) - 1;

    const dailyYield = investments.reduce((acc, inv) => {
      if (inv.cdi_percentage) {
        const saldoParaCalculo = calculateLiveBalance(inv);
        const cdiFactor = inv.cdi_percentage / 100;
        const rendimentoDiario = saldoParaCalculo * DAILY_RATE * cdiFactor;
        return acc + rendimentoDiario;
      }
      return acc;
    }, 0);

    return { totalInvested, currentTotal, profit, profitability, dailyYield };
  }, [investments]);

  const distributionData = useMemo(() => {
    const counts: Record<string, number> = {};
    investments.forEach(i => {
      const typeStr = i.type || 'Outros';
      counts[typeStr] = (counts[typeStr] || 0) + calculateLiveBalance(i);
    });

    return Object.entries(counts).map(([name, value]) => ({
      name,
      population: value,
      color: typeColors[name] || theme.textMuted,
      legendFontColor: theme.textMuted,
      legendFontSize: 12,
    })).sort((a, b) => b.population - a.population);
  }, [investments]);

  const renderInvestmentItem = ({ item }: { item: Investment }) => {
    const currentAmount = calculateLiveBalance(item);
    const profit = currentAmount - item.amount;
    const isProfit = profit >= 0;

    return (
      <TouchableOpacity
        style={styles.investmentCard}
        onPress={() => router.push({ pathname: '/investment-details', params: { id: item.id } })}
      >
        <View style={[styles.iconBg, { backgroundColor: `${typeColors[item.type || 'Outros']}20` }]}>
          <MaterialCommunityIcons name={typeIcons[item.type || 'Outros']} size={24} color={typeColors[item.type || 'Outros']} />
        </View>
        <View style={styles.investmentInfo}>
          <Text style={styles.investmentName}>{item.name}</Text>
          <View style={styles.typeRow}>
            <Text style={styles.investmentType}>{item.type}</Text>
            {item.type === 'Renda fixa' && item.cdi_percentage && (
              <View style={styles.cdiBadge}>
                <Text style={styles.cdiBadgeText}>{item.cdi_percentage}% CDI</Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.investmentValues}>
          <Text style={styles.currentValue}>R$ {currentAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
          <Text style={[styles.profitText, { color: isProfit ? theme.success : theme.danger }]}>
            {isProfit ? '+' : ''}R$ {profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Animated.View entering={FadeInUp.duration(720)} style={styles.header}>
        <View>
          <Text style={styles.headerSubtitle}>Meus</Text>
          <Text style={styles.headerTitle}>Investimentos</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/new-investment' as any)}
        >
          <Ionicons name="add" size={24} color={theme.text} />
        </TouchableOpacity>
      </Animated.View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Resumo Geral */}
        <Animated.View entering={FadeInDown.delay(200).duration(720)} style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Patrimônio Total</Text>
          <Text style={styles.summaryValue}>R$ {stats.currentTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>

          {stats.dailyYield > 0 && (
            <View style={styles.dailyYieldContainer}>
              <MaterialCommunityIcons name="lightning-bolt" size={14} color="#FFFFFF" />
              <Text style={styles.dailyYieldText}>
                Rendendo aprox. <Text style={{ fontWeight: 'bold' }}>R$ {stats.dailyYield.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text> por dia
              </Text>
            </View>
          )}

          <View style={styles.summaryStatsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total Rendido</Text>
              <Text style={[styles.statValue, { color: stats.profit >= 0 ? theme.success : theme.danger }]}>
                {stats.profit >= 0 ? '+' : ''}R$ {stats.profit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Rentabilidade</Text>
              <Text style={[styles.statValue, { color: stats.profit >= 0 ? theme.success : theme.danger }]}>
                {stats.profit >= 0 ? '+' : ''}{stats.profitability.toFixed(2)}%
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Gráfico de Distribuição */}
        {investments.length > 0 && (
          <Animated.View entering={FadeInDown.delay(400).duration(720)} style={styles.section}>
            <Text style={styles.sectionTitle}>Distribuição da Carteira</Text>
            <View style={styles.chartCard}>
              <PieChart
                data={distributionData}
                width={chartWidth}
                height={180}
                chartConfig={{
                  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                }}
                accessor={"population"}
                backgroundColor={"transparent"}
                paddingLeft={"0"}
                center={[10, 0]}
                absolute
              />
            </View>
          </Animated.View>
        )}

        {/* Lista de Investimentos */}
        <Animated.View entering={FadeInDown.delay(600).duration(720)} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Ativos</Text>
            <Text style={styles.assetsCount}>{investments.length} ativos</Text>
          </View>

          {investments.length > 0 ? (
            investments.map((item, index) => (
              <Animated.View key={item.id} entering={FadeInDown.delay(800 + index * 100).duration(720)}>
                {renderInvestmentItem({ item })}
              </Animated.View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="chart-line-variant" size={48} color={theme.border} />
              <Text style={styles.emptyStateText}>Nenhum investimento cadastrado.</Text>
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={() => router.push('/new-investment' as any)}
              >
                <Text style={styles.emptyStateButtonText}>Começar a investir</Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.textMuted,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.text,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  scrollContent: {
    paddingHorizontal: 24,
  },
  summaryCard: {
    backgroundColor: theme.primary,
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    elevation: 8,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  summaryLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  summaryValue: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  dailyYieldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginBottom: 20,
    alignSelf: 'flex-start',
    gap: 6,
  },
  dailyYieldText: {
    color: '#FFFFFF',
    fontSize: 12,
    opacity: 0.9,
  },
  summaryStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
    borderRadius: 16,
    padding: 16,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 11,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 16,
  },
  assetsCount: {
    fontSize: 13,
    color: theme.textMuted,
  },
  chartCard: {
    backgroundColor: theme.surface,
    borderRadius: 24,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  investmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  iconBg: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  investmentInfo: {
    flex: 1,
  },
  investmentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 4,
  },
  investmentType: {
    fontSize: 12,
    color: theme.textMuted,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cdiBadge: {
    backgroundColor: 'rgba(100, 210, 255, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  cdiBadgeText: {
    color: theme.info,
    fontSize: 10,
    fontWeight: 'bold',
  },
  investmentValues: {
    alignItems: 'flex-end',
  },
  currentValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 4,
  },
  profitText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: theme.surface,
    borderRadius: 24,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: theme.border,
  },
  emptyStateText: {
    color: theme.textMuted,
    marginTop: 12,
    marginBottom: 20,
  },
  emptyStateButton: {
    backgroundColor: theme.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  emptyStateButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  }
});
