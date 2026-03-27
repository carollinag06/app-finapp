import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import {
  ContributionGraph,
  LineChart,
  PieChart,
  ProgressChart,
  StackedBarChart
} from 'react-native-chart-kit';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTransactionStore } from '../../store/transactionStore';

// --- CONFIGURAÇÕES E TEMA ---
const screenWidth = Dimensions.get('window').width;
const chartWidth = screenWidth - 48; // Padding horizontal total de 24*2

const theme = {
  bg: '#0F0F0F',
  surface: '#1A1A1A',
  surfaceLight: '#262626',
  text: '#FFFFFF',
  textMuted: '#999999',
  primary: '#8A2BE2', // Roxo
  primaryLight: '#A450FF',
  danger: '#FF5252',  // Vermelho
  success: '#00E676', // Verde vibrante
  blue: '#2196F3',
  yellow: '#FFD740',
  border: '#2A2A2A'
};

const monthNames = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const categoryColors: Record<string, string> = {
  'Alimentação': '#FF5252',
  'Transporte': '#FFD740',
  'Moradia': '#8A2BE2',
  'Saúde': '#00E676',
  'Lazer': '#FF4081',
  'Salário': '#00E676',
  'Freelance': '#2196F3',
  'Investimento': '#00BCD4',
  'Presente': '#FF9800',
  'Outros': '#9E9E9E',
};

// --- COMPONENTES ATÔMICOS ---

const ChartSection = ({ title, subtitle, children }: { title: string, subtitle?: string, children: React.ReactNode }) => (
  <View style={styles.chartSection}>
    <View style={styles.chartSectionHeader}>
      <Text style={styles.chartSectionTitle}>{title}</Text>
      {subtitle && <Text style={styles.chartSectionSubtitle}>{subtitle}</Text>}
    </View>
    <View style={styles.chartCard}>
      {children}
    </View>
  </View>
);

const SummaryChip = ({ label, value, type }: { label: string, value: string, type: 'balance' | 'income' | 'expense' }) => {
  const color = type === 'income' ? theme.success : type === 'expense' ? theme.danger : theme.primary;
  const icon = type === 'income' ? 'arrow-up' : type === 'expense' ? 'arrow-down' : 'wallet-outline';

  return (
    <View style={styles.summaryChip}>
      <View style={[styles.summaryChipIcon, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon as any} size={16} color={color} />
      </View>
      <View>
        <Text style={styles.summaryChipLabel}>{label}</Text>
        <Text style={[styles.summaryChipValue, { color }]}>{value}</Text>
      </View>
    </View>
  );
};

const InsightItem = ({ title, desc, icon, color }: any) => (
  <View style={styles.insightItem}>
    <View style={[styles.insightIcon, { backgroundColor: `${color}15` }]}>
      <Ionicons name={icon} size={20} color={color} />
    </View>
    <View style={styles.insightContent}>
      <Text style={styles.insightTitle}>{title}</Text>
      <Text style={styles.insightDesc}>{desc}</Text>
    </View>
  </View>
);

// --- TELA PRINCIPAL ---

export default function AnalyticsScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'geral' | 'despesas' | 'receitas'>('geral');
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  const transactions = useTransactionStore((state) => state.transactions);

  // --- LÓGICA DE DADOS ---

  const monthlyTransactions = useMemo(() => {
    return transactions.filter(t => {
      const [day, month, year] = t.date.split('/').map(Number);
      return (month - 1) === currentMonth && year === currentYear;
    });
  }, [transactions, currentMonth, currentYear]);

  const stats = useMemo(() => {
    const income = monthlyTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.value, 0);
    const expense = monthlyTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.value, 0);
    return { income, expense, balance: income - expense };
  }, [monthlyTransactions]);

  const filteredTransactions = useMemo(() => {
    if (activeTab === 'geral') return monthlyTransactions;
    const targetType = activeTab === 'despesas' ? 'expense' : 'income';
    return monthlyTransactions.filter(t => t.type === targetType);
  }, [monthlyTransactions, activeTab]);

  // 1. Fluxo de Caixa (LineChart)
  const lineChartData = useMemo(() => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const labels = ["01", "07", "14", "21", "28"];
    const incomeData = new Array(31).fill(0);
    const expenseData = new Array(31).fill(0);

    monthlyTransactions.forEach(t => {
      const day = parseInt(t.date.split('/')[0]);
      if (t.type === 'income') incomeData[day - 1] += t.value;
      else expenseData[day - 1] += t.value;
    });

    // Agrupar por períodos para suavizar o gráfico
    const points = [0, 6, 13, 20, 27, daysInMonth - 1];
    const incomePoints = points.map(p => incomeData[p]);
    const expensePoints = points.map(p => expenseData[p]);

    return {
      labels,
      datasets: [
        { data: incomePoints, color: (opacity = 1) => `rgba(0, 230, 118, ${opacity})`, strokeWidth: 2 },
        { data: expensePoints, color: (opacity = 1) => `rgba(255, 82, 82, ${opacity})`, strokeWidth: 2 }
      ],
      legend: ["Entradas", "Saídas"]
    };
  }, [monthlyTransactions, currentMonth, currentYear]);

  // 2. Divisão por Categoria (Donut/Pie Chart)
  const pieData = useMemo(() => {
    const categories: Record<string, number> = {};
    filteredTransactions.forEach(t => {
      categories[t.category] = (categories[t.category] || 0) + t.value;
    });

    return Object.entries(categories)
      .map(([name, value]) => ({
        name,
        population: value,
        color: categoryColors[name] || theme.textMuted,
        legendFontColor: theme.textMuted,
        legendFontSize: 12
      }))
      .sort((a, b) => b.population - a.population)
      .slice(0, 5); // Top 5
  }, [filteredTransactions]);

  // 3. Comparativo Semanal (Stacked Bar)
  const weeklyData = useMemo(() => {
    const weeks = ["Sem 1", "Sem 2", "Sem 3", "Sem 4"];
    const data = [[0, 0], [0, 0], [0, 0], [0, 0]];

    monthlyTransactions.forEach(t => {
      const day = parseInt(t.date.split('/')[0]);
      const weekIdx = Math.min(Math.floor((day - 1) / 7), 3);
      if (t.type === 'income') data[weekIdx][0] += t.value;
      else data[weekIdx][1] += t.value;
    });

    return {
      labels: weeks,
      legend: ["Entradas", "Saídas"],
      data,
      barColors: [theme.success, theme.danger]
    };
  }, [monthlyTransactions]);

  // 4. Metas de Gastos (Progress Chart)
  const progressData = useMemo(() => {
    const goals = [
      { name: 'Alimentação', limit: 1200 },
      { name: 'Moradia', limit: 2500 },
      { name: 'Lazer', limit: 600 }
    ];

    const labels = goals.map(g => g.name);
    const data = goals.map(g => {
      const spent = monthlyTransactions
        .filter(t => t.category === g.name && t.type === 'expense')
        .reduce((acc, t) => acc + t.value, 0);
      return Math.min(spent / g.limit, 1);
    });

    return { labels, data };
  }, [monthlyTransactions]);

  // 5. Atividade (ContributionGraph)
  const heatmapData = useMemo(() => {
    const activity: Record<string, number> = {};
    monthlyTransactions.forEach(t => {
      const [d, m, y] = t.date.split('/').map(Number);
      const key = `${y}-${m.toString().padStart(2, '0')}-${d.toString().padStart(2, '0')}`;
      activity[key] = (activity[key] || 0) + 1;
    });
    return Object.entries(activity).map(([date, count]) => ({ date, count }));
  }, [monthlyTransactions]);

  // 6. Insights Dinâmicos
  const insights = useMemo(() => {
    const list = [];
    const topCategory = pieData[0];

    if (topCategory && activeTab !== 'receitas') {
      list.push({
        title: "Atenção ao Grupo",
        desc: `Seus maiores gastos foram com ${topCategory.name}. Que tal rever esses custos?`,
        icon: "alert-circle-outline",
        color: theme.danger
      });
    }

    if (stats.balance > 0) {
      list.push({
        title: "Balanço Positivo",
        desc: `Você economizou R$ ${stats.balance.toLocaleString('pt-BR')} este mês. Parabéns!`,
        icon: "trending-up-outline",
        color: theme.success
      });
    } else if (stats.balance < 0) {
      list.push({
        title: "Balanço Negativo",
        desc: `Suas saídas superaram as entradas em R$ ${Math.abs(stats.balance).toLocaleString('pt-BR')}.`,
        icon: "trending-down-outline",
        color: theme.danger
      });
    }

    if (monthlyTransactions.length > 20) {
      list.push({
        title: "Consistência",
        desc: "Você está mantendo um ótimo registro de todas as suas atividades financeiras.",
        icon: "checkmark-done-circle-outline",
        color: theme.primary
      });
    }

    return list;
  }, [pieData, stats, monthlyTransactions, activeTab]);

  // --- HANDLERS ---

  const handleMonthChange = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(v => v - 1);
      } else setCurrentMonth(v => v - 1);
    } else {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(v => v + 1);
      } else setCurrentMonth(v => v + 1);
    }
  };

  const chartConfig = {
    backgroundColor: theme.bg,
    backgroundGradientFrom: theme.surface,
    backgroundGradientTo: theme.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(153, 153, 153, ${opacity})`,
    style: { borderRadius: 16 },
    propsForDots: { r: "5", strokeWidth: "2", stroke: theme.primary },
    propsForLabels: { fontSize: 10, fontWeight: '600' }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* HEADER FIXO */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Análise Financeira</Text>
          <Text style={styles.headerSubtitle}>Visualize sua saúde financeira</Text>
        </View>
        <TouchableOpacity style={styles.shareBtn}>
          <Ionicons name="share-outline" size={22} color={theme.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
      >
        {/* SELETOR DE MÊS */}
        <View style={styles.monthPicker}>
          <TouchableOpacity onPress={() => handleMonthChange('prev')} style={styles.monthBtn}>
            <Ionicons name="chevron-back" size={20} color={theme.textMuted} />
          </TouchableOpacity>
          <View style={styles.monthLabel}>
            <Ionicons name="calendar-outline" size={18} color={theme.primary} />
            <Text style={styles.monthText}>{monthNames[currentMonth]} {currentYear}</Text>
          </View>
          <TouchableOpacity onPress={() => handleMonthChange('next')} style={styles.monthBtn}>
            <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
          </TouchableOpacity>
        </View>

        {/* RESUMO RÁPIDO */}
        <View style={styles.summaryContainer}>
          <SummaryChip label="Saldo" value={`R$ ${stats.balance.toLocaleString('pt-BR')}`} type="balance" />
          <View style={styles.summaryRow}>
            <SummaryChip label="Entradas" value={`+ R$ ${stats.income.toLocaleString('pt-BR')}`} type="income" />
            <SummaryChip label="Saídas" value={`- R$ ${stats.expense.toLocaleString('pt-BR')}`} type="expense" />
          </View>
        </View>

        {/* FILTROS (TABS) */}
        <View style={styles.tabBar}>
          {(['geral', 'despesas', 'receitas'] as const).map(tab => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
              {activeTab === tab && <View style={styles.tabIndicator} />}
            </TouchableOpacity>
          ))}
        </View>

        {/* GRÁFICO 1: EVOLUÇÃO (LINE) */}
        <ChartSection title="Fluxo de Caixa" subtitle="Entradas vs Saídas ao longo do mês">
          <LineChart
            data={lineChartData}
            width={chartWidth}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            withInnerLines={false}
          />
        </ChartSection>

        {/* GRÁFICO 2: CATEGORIAS (PIE) */}
        <ChartSection title="Distribuição" subtitle={`Onde seu dinheiro está ${activeTab === 'receitas' ? 'vindo' : 'indo'}`}>
          {pieData.length > 0 ? (
            <PieChart
              data={pieData}
              width={chartWidth}
              height={200}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="0"
              center={[10, 0]}
              absolute
            />
          ) : (
            <Text style={styles.emptyText}>Sem dados para este período</Text>
          )}
        </ChartSection>

        {/* GRÁFICO 3: SEMANAL (STACKED BAR) */}
        {activeTab === 'geral' && (
          <ChartSection title="Comparativo Semanal" subtitle="Balanço por semana">
            <StackedBarChart
              data={weeklyData}
              width={chartWidth}
              height={220}
              chartConfig={{
                ...chartConfig,
                barPercentage: 0.6
              }}
              style={styles.chart}
              hideLegend={false}
            />
          </ChartSection>
        )}

        {/* GRÁFICO 4: METAS (PROGRESS) */}
        <ChartSection title="Progresso de Orçamento" subtitle="Uso do limite planejado">
          <ProgressChart
            data={progressData}
            width={chartWidth}
            height={200}
            strokeWidth={12}
            radius={32}
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1) => `rgba(138, 43, 226, ${opacity})`,
            }}
            hideLegend={false}
            style={styles.chart}
          />
        </ChartSection>

        {/* GRÁFICO 5: ATIVIDADE (HEATMAP) */}
        <ChartSection title="Frequência de Uso" subtitle="Atividade diária de lançamentos">
          <ContributionGraph
            values={heatmapData}
            endDate={new Date(currentYear, currentMonth + 1, 0)}
            numDays={90}
            width={chartWidth}
            height={220}
            chartConfig={chartConfig}
            tooltipDataAttrs={() => ({})}
          />
        </ChartSection>

        {/* SEÇÃO DE INSIGHTS */}
        <View style={styles.insightsSection}>
          <Text style={styles.sectionHeaderTitle}>Análise do Gestor</Text>
          {insights.map((item, idx) => (
            <InsightItem key={idx} {...item} />
          ))}
          {insights.length === 0 && (
            <Text style={styles.emptyText}>Adicione mais transações para receber insights.</Text>
          )}
        </View>

      </ScrollView>
    </View>
  );
}

// --- ESTILOS ---

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
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.textMuted,
    marginTop: 2,
  },
  shareBtn: {
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
  monthPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.surface,
    padding: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.border,
    marginBottom: 24,
  },
  monthBtn: {
    padding: 8,
  },
  monthLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  monthText: {
    color: theme.text,
    fontSize: 16,
    fontWeight: '700',
  },
  summaryContainer: {
    gap: 12,
    marginBottom: 24,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryChip: {
    flex: 1,
    backgroundColor: theme.surface,
    padding: 16,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  summaryChipIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryChipLabel: {
    fontSize: 12,
    color: theme.textMuted,
    fontWeight: '600',
  },
  summaryChipValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  tabBar: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 16,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    position: 'relative',
  },
  tabItemActive: {},
  tabText: {
    color: theme.textMuted,
    fontSize: 14,
    fontWeight: '700',
  },
  tabTextActive: {
    color: theme.primary,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    width: 24,
    height: 3,
    backgroundColor: theme.primary,
    borderRadius: 2,
  },
  chartSection: {
    marginBottom: 32,
  },
  chartSectionHeader: {
    marginBottom: 16,
  },
  chartSectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: theme.text,
  },
  chartSectionSubtitle: {
    fontSize: 12,
    color: theme.textMuted,
    marginTop: 4,
  },
  chartCard: {
    backgroundColor: theme.surface,
    borderRadius: 28,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: 'center',
    overflow: 'hidden',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  emptyText: {
    color: theme.textMuted,
    fontSize: 14,
    paddingVertical: 40,
    textAlign: 'center',
  },
  insightsSection: {
    marginTop: 8,
    gap: 12,
  },
  sectionHeaderTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.text,
    marginBottom: 8,
  },
  insightItem: {
    flexDirection: 'row',
    backgroundColor: theme.surface,
    padding: 16,
    borderRadius: 24,
    alignItems: 'center',
    gap: 16,
    borderWidth: 1,
    borderColor: theme.border,
  },
  insightIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    color: theme.text,
    fontSize: 15,
    fontWeight: '700',
  },
  insightDesc: {
    color: theme.textMuted,
    fontSize: 13,
    marginTop: 2,
    lineHeight: 18,
  }
});
