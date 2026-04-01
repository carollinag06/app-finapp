import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { parse, parseISO } from 'date-fns';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import Animated, { FadeIn, FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBudgetStore } from '../../store/budgetStore';
import { useCategoryStore } from '../../store/categoryStore';
import { useTransactionStore } from '../../store/transactionStore';

// --- DIMENSÕES E TEMA ---
const screenWidth = Dimensions.get('window').width;
const chartWidth = screenWidth - 40; // Mais largo para ocupar melhor o espaço

const theme = {
  bg: '#0F0F12', // Escuro mais profundo
  surface: '#1A1A1F', // Superfície mais rica
  surfaceLight: '#25252D', // Variação para destaque
  text: '#FFFFFF',
  textMuted: '#8E8E93', // Estilo Apple cinza
  primary: '#8A2BE2', // Roxo vívido
  primaryLight: 'rgba(138, 43, 226, 0.15)',
  danger: '#FF453A',  // Vermelho vibrante
  dangerLight: 'rgba(255, 69, 58, 0.15)',
  success: '#32D74B', // Verde vibrante
  successLight: 'rgba(50, 215, 75, 0.15)',
  warning: '#FFD60A', // Amarelo vívido
  info: '#64D2FF',    // Azul claro
  border: '#2C2C2E',
  shadow: '#000000',
};

const monthNames = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

// --- COMPONENTES MENORES ---

const Header = () => (
  <View style={styles.header}>
    <View>
      <Text style={styles.headerSubtitle}>Análise de</Text>
      <Text style={styles.headerTitle}>Finanças</Text>
    </View>
    <TouchableOpacity style={styles.headerIconButton}>
      <Feather name="calendar" size={22} color={theme.text} />
    </TouchableOpacity>
  </View>
);

interface MonthSelectorProps {
  currentMonth: number;
  currentYear: number;
  onPrev: () => void;
  onNext: () => void;
}

const MonthSelector = ({ currentMonth, currentYear, onPrev, onNext }: MonthSelectorProps) => (
  <View style={styles.monthSelectorContainer}>
    <View style={styles.monthSelector}>
      <TouchableOpacity style={styles.monthArrow} onPress={onPrev}>
        <Ionicons name="chevron-back" size={22} color={theme.text} />
      </TouchableOpacity>
      <View style={styles.monthInfo}>
        <Text style={styles.monthText}>{monthNames[currentMonth]}</Text>
        <Text style={styles.yearText}>{currentYear}</Text>
      </View>
      <TouchableOpacity style={styles.monthArrow} onPress={onNext}>
        <Ionicons name="chevron-forward" size={22} color={theme.text} />
      </TouchableOpacity>
    </View>
  </View>
);

const ChartCard = ({ title, children, subtitle }: { title: string, children: React.ReactNode, subtitle?: string }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <View>
        <Text style={styles.cardTitle}>{title}</Text>
        {subtitle && <Text style={styles.cardSubtitle}>{subtitle}</Text>}
      </View>
    </View>
    {children}
  </View>
);

interface DonutData {
  name: string;
  population: number;
  color: string;
  legendFontColor: string;
}

interface DonutChartProps {
  data: DonutData[];
  centerText: string;
  centerSubtext?: string;
}

// O NOVO COMPONENTE DONUT CHART (Centrado perfeitamente)
const DonutChart = ({ data, centerText, centerSubtext }: DonutChartProps) => {
  const chartSize = 180;

  return (
    <View style={styles.donutWrapper}>
      <View style={{ width: chartSize, height: chartSize, justifyContent: 'center', alignItems: 'center' }}>
        <PieChart
          data={data}
          width={chartSize}
          height={chartSize}
          chartConfig={{ color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})` }}
          accessor={"population"}
          backgroundColor={"transparent"}
          paddingLeft={"0"}
          center={[chartSize / 4, 0]}
          hasLegend={false}
          absolute
        />

        <View style={[StyleSheet.absoluteFill, styles.centerAll]}>
          <View style={styles.donutHole}>
            <Text style={styles.donutCenterText}>{centerText}</Text>
            {centerSubtext && <Text style={styles.donutCenterSubtext}>{centerSubtext}</Text>}
          </View>
        </View>
      </View>

      <View style={styles.customLegendContainer}>
        {data.map((item, index) => (
          <View key={index} style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: item.color }]} />
            <Text style={styles.legendText} numberOfLines={1}>
              {item.name} <Text style={styles.legendValue}>({item.population.toLocaleString('pt-BR', { maximumFractionDigits: 0 })})</Text>
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

interface RankingBarProps {
  label: string;
  value: string;
  percentage: number;
  color: string;
  icon?: string;
}

// Barra de progresso para o Ranking
const RankingBar = ({ label, value, percentage, color, icon }: RankingBarProps) => (
  <View style={styles.rankingItem}>
    <View style={styles.rankingIconContainer}>
      <View style={[styles.categoryIconBg, { backgroundColor: `${color}20` }]}>
        <Ionicons name={(icon as keyof typeof Ionicons.glyphMap) || 'ellipsis-horizontal-outline'} size={18} color={color} />
      </View>
    </View>
    <View style={{ flex: 1 }}>
      <View style={styles.rankingHeader}>
        <Text style={styles.rankingLabel}>{label}</Text>
        <Text style={styles.rankingValue}>R$ {value}</Text>
      </View>
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { backgroundColor: color, width: `${percentage}%` }]} />
      </View>
    </View>
  </View>
);

// --- TELA PRINCIPAL ---

export default function AnalyticsScreen() {
  const { tab } = useLocalSearchParams<{ tab: string }>();
  const [activeFilter, setActiveFilter] = useState('mensal');
  const [activeTab, setActiveTab] = useState('geral'); // 'geral' | 'despesas' | 'receitas' | 'cartao'
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (tab && (tab === 'geral' || tab === 'despesas' || tab === 'receitas' || tab === 'cartao')) {
      setActiveTab(tab);
    }
  }, [tab]);

  const transactions = useTransactionStore((state) => state.transactions);
  const budgets = useBudgetStore((state) => state.budgets);
  const categories = useCategoryStore((state) => state.categories);

  const categoryIcons = useMemo(() => {
    const icons: Record<string, string> = {};
    categories.forEach(c => {
      icons[c.name] = c.icon;
    });
    return icons;
  }, [categories]);

  const categoryColors = useMemo(() => {
    const colors: Record<string, string> = {};
    categories.forEach(c => {
      colors[c.name] = c.color;
    });
    return colors;
  }, [categories]);

  // Transações filtradas por mês/ano
  const monthlyTransactions = useMemo(() => {
    return transactions.filter(t => {
      const transactionDate = t.date.includes('/')
        ? parse(t.date, 'dd/MM/yyyy', new Date())
        : parseISO(t.date);

      return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
    });
  }, [transactions, currentMonth, currentYear]);

  // Transações do mês anterior para comparação
  const prevMonthTransactions = useMemo(() => {
    let pm = currentMonth - 1;
    let py = currentYear;
    if (pm < 0) {
      pm = 11;
      py = currentYear - 1;
    }
    return transactions.filter(t => {
      const transactionDate = t.date.includes('/')
        ? parse(t.date, 'dd/MM/yyyy', new Date())
        : parseISO(t.date);

      return transactionDate.getMonth() === pm && transactionDate.getFullYear() === py;
    });
  }, [transactions, currentMonth, currentYear]);

  const prevMonthStats = useMemo(() => {
    const income = prevMonthTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.value, 0);
    const expense = prevMonthTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.value, 0);
    return { income, expense, balance: income - expense };
  }, [prevMonthTransactions]);

  const currentMonthStats = useMemo(() => {
    const income = monthlyTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.value, 0);
    const expense = monthlyTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.value, 0);
    const pending = monthlyTransactions.filter(t => t.type === 'expense' && t.paymentMethod === 'credit').reduce((acc, t) => acc + t.value, 0);
    return { income, expense, pending, balance: income - expense };
  }, [monthlyTransactions]);

  const getComparison = (current: number, prev: number) => {
    if (prev === 0) return { percent: 0, improved: true };
    const diff = ((current - prev) / prev) * 100;
    return {
      percent: Math.abs(diff).toFixed(0),
      improved: diff > 0
    };
  };

  const incomeComparison = getComparison(currentMonthStats.income, prevMonthStats.income);
  const expenseComparison = getComparison(currentMonthStats.expense, prevMonthStats.expense);

  // Médias diárias para exibição no resumo
  const dailyAverages = useMemo(() => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const isCurrentMonth = currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear();
    const divisor = isCurrentMonth ? Math.max(new Date().getDate(), 1) : daysInMonth;

    return {
      income: currentMonthStats.income / divisor,
      expense: currentMonthStats.expense / divisor
    };
  }, [currentMonthStats.income, currentMonthStats.expense, currentMonth, currentYear]);

  // Transações específicas da aba ativa
  const filteredTransactions = useMemo(() => {
    if (activeTab === 'geral') return monthlyTransactions;
    if (activeTab === 'cartao') return monthlyTransactions.filter(t => t.paymentMethod === 'credit');
    const targetType = activeTab === 'despesas' ? 'expense' : 'income';
    return monthlyTransactions.filter(t => t.type === targetType);
  }, [monthlyTransactions, activeTab]);

  const totalValue = useMemo(() => {
    return filteredTransactions.reduce((acc, t) => acc + t.value, 0);
  }, [filteredTransactions]);

  const evolucaoData = useMemo(() => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const isDiaria = activeFilter === 'diaria';
    const dataPointsCount = isDiaria ? daysInMonth : 7;

    let labels: string[] = [];
    if (isDiaria) {
      for (let i = 1; i <= daysInMonth; i++) {
        if (i === 1 || i % 7 === 0 || i === daysInMonth) labels.push(i.toString());
        else labels.push("");
      }
    } else {
      labels = ["01", "05", "10", "15", "20", "25", "30"];
    }

    const getIdx = (day: number) => {
      if (isDiaria) return day - 1;
      if (day <= 1) return 0;
      if (day <= 5) return 1;
      if (day <= 10) return 2;
      if (day <= 15) return 3;
      if (day <= 20) return 4;
      if (day <= 25) return 5;
      return 6;
    };

    if (activeTab === 'geral') {
      const incomeData = new Array(dataPointsCount).fill(0);
      const expenseData = new Array(dataPointsCount).fill(0);
      const balanceData = new Array(dataPointsCount).fill(0);

      monthlyTransactions.forEach(t => {
        const transactionDate = t.date.includes('/')
          ? parse(t.date, 'dd/MM/yyyy', new Date())
          : parseISO(t.date);
        const day = transactionDate.getDate();
        const idx = getIdx(day);
        if (idx < dataPointsCount) {
          if (t.type === 'income') incomeData[idx] += t.value;
          else expenseData[idx] += t.value;
        }
      });

      let cumulativeBalance = 0;
      for (let i = 0; i < dataPointsCount; i++) {
        cumulativeBalance += (incomeData[i] - expenseData[i]);
        balanceData[i] = cumulativeBalance;
      }

      return {
        labels,
        datasets: [
          { data: incomeData, color: (opacity = 1) => theme.success, strokeWidth: 1.5 },
          { data: expenseData, color: (opacity = 1) => theme.danger, strokeWidth: 1.5 },
          { data: balanceData, color: (opacity = 1) => theme.primary, strokeWidth: 3 }
        ],
        legend: ["Receitas", "Despesas", "Saldo"]
      };
    }

    const data = new Array(dataPointsCount).fill(0);
    filteredTransactions.forEach(t => {
      const transactionDate = t.date.includes('/')
        ? parse(t.date, 'dd/MM/yyyy', new Date())
        : parseISO(t.date);
      const day = transactionDate.getDate();
      const idx = getIdx(day);
      if (idx < dataPointsCount) data[idx] += t.value;
    });

    return {
      labels,
      datasets: [{
        data: data.map(v => v || 0),
        color: (opacity = 1) => {
          if (activeTab === 'receitas') return theme.success;
          if (activeTab === 'cartao') return theme.warning;
          return theme.danger;
        },
        strokeWidth: 3
      }]
    };
  }, [filteredTransactions, monthlyTransactions, activeTab, activeFilter, currentMonth, currentYear]);

  const comparativoGeralData = useMemo(() => {
    return [
      { name: 'Receitas', population: currentMonthStats.income, color: theme.success, legendFontColor: theme.textMuted },
      { name: 'Despesas', population: currentMonthStats.expense, color: theme.danger, legendFontColor: theme.textMuted },
    ].filter(d => d.population > 0);
  }, [currentMonthStats]);

  const rankingData = useMemo(() => {
    const categories: Record<string, number> = {};
    // Se estiver na aba Geral ou Cartão, mostramos apenas despesas/gastos no ranking
    const transactionsForRanking = (activeTab === 'geral' || activeTab === 'cartao')
      ? monthlyTransactions.filter(t => t.type === 'expense')
      : filteredTransactions;

    // Se estiver na aba cartao, filtramos apenas os gastos de cartao
    const finalTransactions = activeTab === 'cartao'
      ? transactionsForRanking.filter(t => t.paymentMethod === 'credit')
      : transactionsForRanking;

    finalTransactions.forEach(t => {
      categories[t.category] = (categories[t.category] || 0) + t.value;
    });

    const totalRankingValue = Object.values(categories).reduce((acc, v) => acc + v, 0);

    return Object.entries(categories)
      .map(([name, value]) => ({
        name,
        value,
        percentage: totalRankingValue > 0 ? (value / totalRankingValue) * 100 : 0,
        color: categoryColors[name] || theme.textMuted,
        icon: categoryIcons[name]
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredTransactions, monthlyTransactions, activeTab, categoryColors, categoryIcons]);

  const donutCategoriaData = useMemo(() => {
    return rankingData.map(item => ({
      name: item.name,
      population: item.value,
      color: item.color,
      legendFontColor: theme.textMuted
    }));
  }, [rankingData]);

  // INSIGHTS ADICIONAIS
  const insights = useMemo(() => {
    // Definimos o que analisar baseado na aba ativa
    let targetTransactions = monthlyTransactions;

    if (activeTab === 'receitas') {
      targetTransactions = monthlyTransactions.filter(t => t.type === 'income');
    } else if (activeTab === 'cartao') {
      targetTransactions = monthlyTransactions.filter(t => t.paymentMethod === 'credit');
    } else if (activeTab === 'despesas') {
      targetTransactions = monthlyTransactions.filter(t => t.type === 'expense');
    } else {
      // Geral: focamos em despesas para os insights
      targetTransactions = monthlyTransactions.filter(t => t.type === 'expense');
    }

    if (targetTransactions.length === 0) return null;

    // Maior transação (Gasto ou Receita)
    const highest = [...targetTransactions].sort((a, b) => b.value - a.value)[0];

    // Cálculo da média diária
    const totalValueForAvg = targetTransactions.reduce((acc, t) => acc + t.value, 0);
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const isCurrentMonth = currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear();
    const divisor = isCurrentMonth ? Math.max(new Date().getDate(), 1) : daysInMonth;

    const dailyAvg = totalValueForAvg / divisor;

    return {
      highest,
      dailyAvg
    };
  }, [monthlyTransactions, activeTab, currentMonth, currentYear]);

  const recorrenciaData = useMemo(() => {
    const data: Record<string, number> = { 'Fixas': 0, 'Variáveis': 0, 'Parceladas': 0 };
    filteredTransactions.forEach(t => {
      const rec = t.recurrence || 'variable';
      if (rec === 'fixed') data['Fixas'] += t.value;
      else if (rec === 'installment') data['Parceladas'] += t.value;
      else data['Variáveis'] += t.value;
    });

    return [
      { name: 'Fixas', population: data['Fixas'], color: theme.info, legendFontColor: theme.textMuted },
      { name: 'Variáveis', population: data['Variáveis'], color: theme.warning, legendFontColor: theme.textMuted },
      { name: 'Parceladas', population: data['Parceladas'], color: theme.danger, legendFontColor: theme.textMuted },
    ].filter(d => d.population > 0);
  }, [filteredTransactions]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Animated.View entering={FadeInUp.duration(720)}>
        <Header />
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(720)}>
        <MonthSelector
          currentMonth={currentMonth}
          currentYear={currentYear}
          onPrev={handlePrevMonth}
          onNext={handleNextMonth}
        />
      </Animated.View>

      {/* NAVEGAÇÃO SUPERIOR (Sub-tabs) */}
      <Animated.View entering={FadeInDown.delay(400).duration(720)} style={styles.subTabsWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subTabsContainer}>
          <TouchableOpacity style={[styles.subTabItem, activeTab === 'geral' && styles.subTabItemActive]} onPress={() => setActiveTab('geral')}>
            <Text style={[styles.subTabText, activeTab === 'geral' && styles.subTabTextActive]}>Geral</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.subTabItem, activeTab === 'despesas' && styles.subTabItemActive]} onPress={() => setActiveTab('despesas')}>
            <Text style={[styles.subTabText, activeTab === 'despesas' && styles.subTabTextActive]}>Despesas</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.subTabItem, activeTab === 'receitas' && styles.subTabItemActive]} onPress={() => setActiveTab('receitas')}>
            <Text style={[styles.subTabText, activeTab === 'receitas' && styles.subTabTextActive]}>Receitas</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.subTabItem, activeTab === 'cartao' && styles.subTabItemActive]} onPress={() => setActiveTab('cartao')}>
            <Text style={[styles.subTabText, activeTab === 'cartao' && styles.subTabTextActive]}>Cartão</Text>
          </TouchableOpacity>
        </ScrollView>
      </Animated.View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Filtros em formato de Pill */}
        <Animated.View entering={FadeInDown.delay(600).duration(720)}>
          <View style={styles.filtersContainer}>
            <TouchableOpacity
              style={[styles.filterPill, activeFilter === 'mensal' && styles.filterPillActive]}
              onPress={() => setActiveFilter('mensal')}
            >
              <Ionicons name="calendar-outline" size={14} color={activeFilter === 'mensal' ? theme.primary : theme.textMuted} />
              <Text style={[styles.filterText, activeFilter === 'mensal' && styles.filterTextActive]}>Mês</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterPill, activeFilter === 'diaria' && styles.filterPillActive]}
              onPress={() => setActiveFilter('diaria')}
            >
              <Ionicons name="time-outline" size={14} color={activeFilter === 'diaria' ? theme.primary : theme.textMuted} />
              <Text style={[styles.filterText, activeFilter === 'diaria' && styles.filterTextActive]}>Dia a Dia</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {monthlyTransactions.length === 0 ? (
          <Animated.View entering={FadeIn.delay(800).duration(270)} style={styles.emptyStateContainer}>
            <View style={styles.emptyStateIconBg}>
              <MaterialCommunityIcons name="chart-bar" size={48} color={theme.textMuted} />
            </View>
            <Text style={styles.emptyStateTitle}>Nenhum dado este mês</Text>
            <Text style={styles.emptyStateSubtitle}>Adicione transações para ver suas estatísticas aqui.</Text>
          </Animated.View>
        ) : (
          <>
            {/* NOVO: Total da aba ativa (Receita ou Despesa ou Cartão) */}
            {activeTab !== 'geral' && (
              <Animated.View entering={FadeInDown.delay(800).duration(720)} style={[
                styles.totalTabCard,
                { borderColor: activeTab === 'receitas' ? `${theme.success}30` : activeTab === 'cartao' ? `${theme.warning}30` : `${theme.danger}30` }
              ]}>
                <View style={[
                  styles.totalTabIconBg,
                  { backgroundColor: activeTab === 'receitas' ? theme.successLight : activeTab === 'cartao' ? 'rgba(255, 214, 10, 0.15)' : theme.dangerLight }
                ]}>
                  <Ionicons
                    name={activeTab === 'receitas' ? "trending-up" : activeTab === 'cartao' ? "card-outline" : "trending-down"}
                    size={24}
                    color={activeTab === 'receitas' ? theme.success : activeTab === 'cartao' ? theme.warning : theme.danger}
                  />
                </View>
                <View>
                  <Text style={styles.totalTabLabel}>
                    Total de {activeTab === 'receitas' ? 'Receitas' : activeTab === 'cartao' ? 'Gastos no Cartão' : 'Despesas'}
                  </Text>
                  <Text style={[styles.totalTabValue, { color: activeTab === 'receitas' ? theme.success : activeTab === 'cartao' ? theme.warning : theme.danger }]}>
                    R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </Text>
                  <Text style={styles.totalTabSubValue}>
                    Média: R$ {(() => {
                      const avg = activeTab === 'receitas' ? dailyAverages.income : activeTab === 'cartao' ? (totalValue / Math.max(new Date().getDate(), 1)) : dailyAverages.expense;
                      return avg.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
                    })()} / dia
                  </Text>
                </View>
              </Animated.View>
            )}

            {/* CARD 1: Evolução (Linha) */}
            <Animated.View entering={FadeInDown.delay(1000).duration(720)}>
              <ChartCard
                title={activeTab === 'geral' ? "Fluxo de Caixa" : `Histórico de ${activeTab === 'receitas' ? 'Receitas' : 'Despesas'}`}
                subtitle={activeFilter === 'mensal' ? "Visão mensal agrupada" : "Detalhamento diário"}
              >
                <View style={styles.chartWrapper}>
                  <LineChart
                    data={evolucaoData}
                    width={chartWidth}
                    height={200}
                    yAxisLabel="R$"
                    yAxisSuffix=""
                    withInnerLines={true}
                    withOuterLines={false}
                    withVerticalLines={false}
                    chartConfig={{
                      backgroundColor: theme.surface,
                      backgroundGradientFrom: theme.surface,
                      backgroundGradientTo: theme.surface,
                      decimalPlaces: 0,
                      color: (opacity = 1) => `rgba(255, 255, 255, ${opacity * 0.1})`,
                      labelColor: (opacity = 1) => theme.textMuted,
                      style: { borderRadius: 16 },
                      propsForDots: { r: "4", strokeWidth: "2", stroke: theme.surface }
                    }}
                    bezier
                    style={styles.lineChart}
                  />
                </View>
              </ChartCard>
            </Animated.View>

            {activeTab === 'geral' ? (
              <>
                {/* CARD 2 GERAL: Resumo do Mês */}
                <Animated.View entering={FadeInDown.delay(1200).duration(720)} style={styles.summaryGrid}>
                  <View style={[styles.summarySmallCard, { borderColor: `${theme.success}30` }]}>
                    <View style={[styles.summaryIconBg, { backgroundColor: theme.successLight }]}>
                      <Ionicons name="trending-up" size={20} color={theme.success} />
                    </View>
                    <Text style={styles.summaryLabel}>Receitas</Text>
                    <Text style={[styles.summaryValue, { color: theme.success }]}>
                      R$ {currentMonthStats.income.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                    </Text>
                    <Text style={styles.summaryDailyAvg}>Média: R$ {dailyAverages.income.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}/dia</Text>
                    <View style={styles.comparisonRow}>
                      <Ionicons
                        name={incomeComparison.improved ? "arrow-up" : "arrow-down"}
                        size={12}
                        color={incomeComparison.improved ? theme.success : theme.danger}
                      />
                      <Text style={[styles.comparisonText, { color: incomeComparison.improved ? theme.success : theme.danger }]}>
                        {incomeComparison.percent}% vs mês ant.
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.summarySmallCard, { borderColor: `${theme.danger}30` }]}>
                    <View style={[styles.summaryIconBg, { backgroundColor: theme.dangerLight }]}>
                      <Ionicons name="trending-down" size={20} color={theme.danger} />
                    </View>
                    <Text style={styles.summaryLabel}>Despesas</Text>
                    <Text style={[styles.summaryValue, { color: theme.danger }]}>
                      R$ {currentMonthStats.expense.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                    </Text>
                    <Text style={styles.summaryDailyAvg}>Média: R$ {dailyAverages.expense.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}/dia</Text>
                    <View style={styles.comparisonRow}>
                      <Ionicons
                        name={expenseComparison.improved ? "arrow-up" : "arrow-down"}
                        size={12}
                        color={expenseComparison.improved ? theme.danger : theme.success}
                      />
                      <Text style={[styles.comparisonText, { color: expenseComparison.improved ? theme.danger : theme.success }]}>
                        {expenseComparison.percent}% vs mês ant.
                      </Text>
                    </View>
                  </View>
                </Animated.View>

                {/* NOVO: Card de Fatura Pendente se houver */}
                {currentMonthStats.pending > 0 && (
                  <View style={[styles.card, { paddingVertical: 16, backgroundColor: 'rgba(255, 214, 10, 0.05)', borderColor: 'rgba(255, 214, 10, 0.2)' }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <View style={[styles.summaryIconBg, { backgroundColor: 'rgba(255, 214, 10, 0.1)', marginBottom: 0 }]}>
                        <Ionicons name="card-outline" size={20} color={theme.warning} />
                      </View>
                      <View>
                        <Text style={[styles.summaryLabel, { marginBottom: 2 }]}>Fatura de Cartão (Pendente)</Text>
                        <Text style={[styles.summaryValue, { fontSize: 20, marginBottom: 0, color: theme.warning }]}>
                          R$ {currentMonthStats.pending.toLocaleString('pt-BR')}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* CARD 3 GERAL: Comparativo Donut */}
                <ChartCard title="Distribuição de Caixa" subtitle="Receitas vs Despesas">
                  <DonutChart
                    data={comparativoGeralData}
                    centerText={`R$ ${currentMonthStats.balance.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`}
                    centerSubtext="Saldo Líquido"
                  />
                </ChartCard>
              </>
            ) : (
              <>
                {/* CARD 2: Ranking de categorias (Barras horizontais) */}
                <ChartCard title="Ranking por Categoria" subtitle={`Maiores ${activeTab === 'receitas' ? 'entradas' : 'gastos'}`}>
                  {rankingData.map((item, index) => (
                    <RankingBar
                      key={index}
                      label={item.name}
                      value={item.value.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                      percentage={item.percentage}
                      color={item.color}
                      icon={item.icon}
                    />
                  ))}
                </ChartCard>

                {/* NOVO: Fatura Pendente na aba de despesas */}
                {activeTab === 'despesas' && currentMonthStats.pending > 0 && (
                  <View style={[styles.card, { paddingVertical: 16, backgroundColor: 'rgba(255, 214, 10, 0.05)', borderColor: 'rgba(255, 214, 10, 0.2)' }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <View style={[styles.summaryIconBg, { backgroundColor: 'rgba(255, 214, 10, 0.1)', marginBottom: 0 }]}>
                        <Ionicons name="card-outline" size={20} color={theme.warning} />
                      </View>
                      <View>
                        <Text style={[styles.summaryLabel, { marginBottom: 2 }]}>Deste total, pendente no Cartão</Text>
                        <Text style={[styles.summaryValue, { fontSize: 20, marginBottom: 0, color: theme.warning }]}>
                          R$ {currentMonthStats.pending.toLocaleString('pt-BR')}
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* CARD 3: Por categoria (Donut) */}
                <ChartCard title="Divisão Proporcional" subtitle="Participação de cada categoria">
                  <DonutChart
                    data={donutCategoriaData}
                    centerText={`R$ ${totalValue.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`}
                    centerSubtext="Total"
                  />
                </ChartCard>

                {/* CARD 4: Despesas por recorrência (Apenas Despesas) */}
                {activeTab === 'despesas' && (
                  <ChartCard title="Tipo de Gasto" subtitle="Fixo vs Variável">
                    <DonutChart
                      data={recorrenciaData}
                      centerText={`${recorrenciaData.length > 0 ? '100%' : '0%'}`}
                      centerSubtext="Total"
                    />
                  </ChartCard>
                )}

                {/* NOVO: Resumo de Metas/Budgets na aba de despesas */}
                {activeTab === 'despesas' && budgets.length > 0 && (
                  <ChartCard title="Controle de Metas" subtitle="Consumo do orçamento mensal">
                    {budgets.slice(0, 3).map((b, idx) => {
                      const spent = rankingData.find(r => r.name === b.category)?.value || 0;
                      const percent = Math.min((spent / b.amount) * 100, 100);
                      return (
                        <View key={idx} style={{ marginBottom: 16 }}>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                            <Text style={{ color: theme.text, fontSize: 13, fontWeight: '600' }}>{b.category}</Text>
                            <Text style={{ color: theme.textMuted, fontSize: 12 }}>R$ {spent.toLocaleString('pt-BR')} / {b.amount.toLocaleString('pt-BR')}</Text>
                          </View>
                          <View style={{ height: 6, backgroundColor: theme.border, borderRadius: 3, overflow: 'hidden' }}>
                            <View style={{ height: '100%', width: `${percent}%`, backgroundColor: percent > 90 ? theme.danger : b.color || theme.primary }} />
                          </View>
                        </View>
                      );
                    })}
                    <TouchableOpacity
                      style={{ marginTop: 8, alignItems: 'center' }}
                      onPress={() => router.push('/budget')}
                    >
                      <Text style={{ color: theme.primary, fontSize: 13, fontWeight: 'bold' }}>Ver todas as metas</Text>
                    </TouchableOpacity>
                  </ChartCard>
                )}
              </>
            )}

            {/* Insights Detalhados (Novo) */}
            {insights && (
              <View style={styles.insightsContainer}>
                <Text style={styles.insightsTitle}>Insights Detalhados</Text>
                <View style={styles.insightRow}>
                  <View style={styles.insightCard}>
                    <View style={[styles.insightIconBg, { backgroundColor: `${theme.primary}20` }]}>
                      <Ionicons name="star" size={16} color={theme.primary} />
                    </View>
                    <Text style={styles.insightLabel}>Maior {activeTab === 'receitas' ? 'Entrada' : activeTab === 'cartao' ? 'Gasto no Cartão' : 'Gasto'}</Text>
                    <Text style={styles.insightValue}>R$ {insights.highest.value.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</Text>
                    <Text style={styles.insightSubValue} numberOfLines={1}>{insights.highest.description}</Text>
                  </View>

                  <View style={styles.insightCard}>
                    <View style={[styles.insightIconBg, { backgroundColor: `${theme.info}20` }]}>
                      <Ionicons name="calculator" size={16} color={theme.info} />
                    </View>
                    <Text style={styles.insightLabel}>Média Diária</Text>
                    <Text style={styles.insightValue}>R$ {insights.dailyAvg.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}</Text>
                    <Text style={styles.insightSubValue}>Este mês</Text>
                  </View>
                </View>
              </View>
            )}

            {/* Dicas Financeiras (Novo) */}
            <View style={styles.tipsCard}>
              <View style={styles.tipsHeader}>
                <Ionicons name="bulb-outline" size={20} color={theme.warning} />
                <Text style={styles.tipsTitle}>Dica do Mês</Text>
              </View>
              <Text style={styles.tipsContent}>
                {(() => {
                  if (activeTab === 'cartao') {
                    return currentMonthStats.pending > 500
                      ? "Sua fatura de cartão está subindo. Tente antecipar pagamentos ou evitar novas compras parceladas."
                      : "Uso do cartão sob controle. Lembre-se de conferir se as parcelas cabem no orçamento futuro.";
                  }
                  if (activeTab === 'despesas' && currentMonthStats.expense > prevMonthStats.expense) {
                    return "Seus gastos aumentaram em relação ao mês passado. Tente revisar as categorias 'Variáveis' para economizar.";
                  }
                  return "Bom trabalho! Seu balanço financeiro está saudável. Considere investir o saldo restante para fazer seu dinheiro render.";
                })()}
              </Text>
            </View>
          </>
        )}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
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
    letterSpacing: -0.5,
  },
  headerIconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  monthSelectorContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  monthArrow: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: theme.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthInfo: {
    alignItems: 'center',
  },
  monthText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text,
  },
  yearText: {
    fontSize: 12,
    color: theme.textMuted,
    fontWeight: '500',
  },
  subTabsWrapper: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  subTabsContainer: {
    flexDirection: 'row',
    backgroundColor: theme.surface,
    borderRadius: 14,
    padding: 6,
    borderWidth: 1,
    borderColor: theme.border,
    minWidth: '100%',
  },
  subTabItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderRadius: 10,
    minWidth: 80,
  },
  subTabItemActive: {
    backgroundColor: theme.surfaceLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  subTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.textMuted,
  },
  subTabTextActive: {
    color: theme.text,
  },
  filtersContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 10,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    gap: 6,
  },
  filterPillActive: {
    backgroundColor: theme.primaryLight,
    borderColor: theme.primary,
  },
  filterText: {
    color: theme.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  filterTextActive: {
    color: theme.primary,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: theme.surface,
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.border,
    ...Platform.select({
      ios: {
        shadowColor: theme.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  cardTitle: {
    color: theme.text,
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    color: theme.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  chartWrapper: {
    alignItems: 'center',
    marginHorizontal: -10,
  },
  lineChart: {
    borderRadius: 16,
  },
  // Donut
  donutWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerAll: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutHole: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  donutCenterText: {
    color: theme.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  donutCenterSubtext: {
    color: theme.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
  customLegendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 24,
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    maxWidth: '45%',
  },
  legendColor: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  legendText: {
    color: theme.textMuted,
    fontSize: 11,
  },
  legendValue: {
    color: theme.text,
    fontWeight: 'bold',
  },
  // Ranking
  rankingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    gap: 12,
  },
  rankingIconContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  rankingLabel: {
    color: theme.text,
    fontSize: 14,
    fontWeight: '600',
  },
  rankingValue: {
    color: theme.text,
    fontSize: 13,
    fontWeight: '500',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: theme.border,
    borderRadius: 3,
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  // Summary Grid
  summaryGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  summarySmallCard: {
    flex: 1,
    backgroundColor: theme.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.border,
  },
  summaryIconBg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    color: theme.textMuted,
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  summaryDailyAvg: {
    fontSize: 11,
    color: theme.textMuted,
    marginBottom: 8,
  },
  comparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  comparisonText: {
    fontSize: 10,
    fontWeight: '600',
  },
  // Total Tab Card
  totalTabCard: {
    backgroundColor: theme.surface,
    borderRadius: 24,
    padding: 18,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
  totalTabIconBg: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  totalTabLabel: {
    color: theme.textMuted,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  totalTabValue: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  totalTabSubValue: {
    fontSize: 13,
    color: theme.textMuted,
  },
  // Empty State
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateIconBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.border,
  },
  emptyStateTitle: {
    color: theme.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    color: theme.textMuted,
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  // Insights
  insightsContainer: {
    marginBottom: 24,
  },
  insightsTitle: {
    color: theme.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  insightRow: {
    flexDirection: 'row',
    gap: 12,
  },
  insightCard: {
    flex: 1,
    backgroundColor: theme.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.border,
  },
  insightIconBg: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  insightLabel: {
    color: theme.textMuted,
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  insightValue: {
    color: theme.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  insightSubValue: {
    color: theme.textMuted,
    fontSize: 10,
  },
  // Tips
  tipsCard: {
    backgroundColor: theme.surfaceLight,
    borderRadius: 20,
    padding: 16,
    marginBottom: 30,
    borderLeftWidth: 4,
    borderLeftColor: theme.warning,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  tipsTitle: {
    color: theme.text,
    fontSize: 14,
    fontWeight: 'bold',
  },
  tipsContent: {
    color: theme.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
});
