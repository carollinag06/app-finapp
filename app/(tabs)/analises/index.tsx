import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { parse, parseISO } from 'date-fns';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View
} from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Importação das stores para obter transações e categorias
import { useCategoryStore } from '../../../store/categoryStore';
import { useTransactionStore } from '../../../store/transactionStore';
import { theme } from '../../../src/constants/theme';
import { formatCurrency, getMonthName } from '../../../src/utils/format';
import { styles } from './styles';

// --- COMPONENTES MENORES ---

/**
 * Cabeçalho da tela de Análise
 */
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

/**
 * Seletor de Mês e Ano
 * Permite navegar entre os períodos para visualizar dados históricos.
 */
const MonthSelector = ({ currentMonth, currentYear, onPrev, onNext }: MonthSelectorProps) => (
  <View style={styles.monthSelectorContainer}>
    <View style={styles.monthSelector}>
      <TouchableOpacity style={styles.monthArrow} onPress={onPrev}>
        <Ionicons name="chevron-back" size={22} color={theme.text} />
      </TouchableOpacity>
      <View style={styles.monthInfo}>
        <Text style={styles.monthText}>{getMonthName(currentMonth)}</Text>
        <Text style={styles.yearText}>{currentYear}</Text>
      </View>
      <TouchableOpacity style={styles.monthArrow} onPress={onNext}>
        <Ionicons name="chevron-forward" size={22} color={theme.text} />
      </TouchableOpacity>
    </View>
  </View>
);

/**
 * Container padrão para os cards de gráfico
 */
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

/**
 * Gráfico de Donut Personalizado
 * Exibe a distribuição proporcional com um texto centralizado no "furo" do donut.
 */
const DonutChart = ({ data, centerText, centerSubtext }: DonutChartProps) => {
  const chartSize = 180;

  if (!data || data.length === 0) {
    return (
      <View style={[styles.donutWrapper, { height: chartSize, justifyContent: 'center' }]}>
        <Text style={{ color: theme.textMuted }}>Sem dados para exibir</Text>
      </View>
    );
  }

  return (
    <View style={styles.donutWrapper}>
      <View style={{ width: chartSize, height: chartSize, justifyContent: 'center', alignItems: 'center' }}>
        {/* Gráfico de Pizza configurado para parecer um Donut */}
        <PieChart
          data={data}
          width={chartSize}
          height={chartSize}
          chartConfig={{ color: (_opacity = 1) => `rgba(255, 255, 255, ${_opacity})` }}
          accessor={"population"}
          backgroundColor={"transparent"}
          paddingLeft={"0"}
          center={[chartSize / 4, 0]}
          hasLegend={false} // Legenda customizada abaixo
          absolute
        />

        {/* Texto no centro do gráfico */}
        <View style={[StyleSheet.absoluteFill, styles.centerAll]}>
          <View style={styles.donutHole}>
            <Text style={styles.donutCenterText}>{centerText}</Text>
            {centerSubtext && <Text style={styles.donutCenterSubtext}>{centerSubtext}</Text>}
          </View>
        </View>
      </View>

      {/* Legenda customizada à direita ou abaixo do gráfico */}
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

/**
 * Barra de Ranking
 * Exibe uma categoria com barra de progresso horizontal para comparar volumes de gastos/ganhos.
 */
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
        <Text style={styles.rankingValue}>{value}</Text>
      </View>
      <View style={styles.progressBarBg}>
        <View style={[styles.progressBarFill, { backgroundColor: color, width: `${percentage}%` }]} />
      </View>
    </View>
  </View>
);

// --- TELA PRINCIPAL DE ANALYTICS ---

export default function AnalyticsScreen() {
  const { tab } = useLocalSearchParams<{ tab: string }>(); // Recebe parâmetros de navegação (ex: qual aba abrir primeiro)
  const { width: screenWidth } = useWindowDimensions();
  const chartWidth = screenWidth - 40;
  const [activeFilter, setActiveFilter] = useState('mensal'); // 'mensal' ou 'diaria'
  const [activeTab, setActiveTab] = useState('geral'); // 'geral' | 'despesas' | 'receitas' | 'cartao'
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const insets = useSafeAreaInsets();

  // EFEITO: Sincroniza a aba ativa se vier um parâmetro pela URL/Navegação
  useEffect(() => {
    if (tab && (tab === 'geral' || tab === 'despesas' || tab === 'receitas' || tab === 'cartao')) {
      setActiveTab(tab);
    }
  }, [tab]);

  const transactions = useTransactionStore((state) => state.transactions);
  const categories = useCategoryStore((state) => state.categories);

  // Mapeamento de ícones e cores das categorias para uso nos gráficos
  const categoryIcons = useMemo(() => {
    const icons: Record<string, string> = {};
    categories.forEach(c => { icons[c.name] = c.icon; });
    return icons;
  }, [categories]);

  const categoryColors = useMemo(() => {
    const colors: Record<string, string> = {};
    categories.forEach(c => { colors[c.name] = c.color; });
    return colors;
  }, [categories]);

  // FILTRO: Transações do período selecionado (mês/ano)
  const monthlyTransactions = useMemo(() => {
    return transactions.filter(t => {
      const transactionDate = t.date.includes('/')
        ? parse(t.date, 'dd/MM/yyyy', new Date())
        : parseISO(t.date);

      return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
    });
  }, [transactions, currentMonth, currentYear]);

  // COMPARAÇÃO: Transações do mês anterior para gerar estatísticas de crescimento/queda
  const prevMonthTransactions = useMemo(() => {
    let pm = currentMonth - 1;
    let py = currentYear;
    if (pm < 0) { pm = 11; py = currentYear - 1; }
    return transactions.filter(t => {
      const transactionDate = t.date.includes('/')
        ? parse(t.date, 'dd/MM/yyyy', new Date())
        : parseISO(t.date);

      return transactionDate.getMonth() === pm && transactionDate.getFullYear() === py;
    });
  }, [transactions, currentMonth, currentYear]);

  // CÁLCULO: Estatísticas básicas do mês atual e anterior
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

  // Helper para calcular a variação percentual entre meses
  const getComparison = (current: number, prev: number) => {
    if (prev === 0) return { percent: 0, improved: true };
    const diff = ((current - prev) / prev) * 100;
    return { percent: Math.abs(diff).toFixed(0), improved: diff > 0 };
  };

  const incomeComparison = getComparison(currentMonthStats.income, prevMonthStats.income);
  const expenseComparison = getComparison(currentMonthStats.expense, prevMonthStats.expense);

  // CÁLCULO: Médias diárias baseadas no número de dias passados no mês
  const dailyAverages = useMemo(() => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const isCurrentMonth = currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear();
    const divisor = isCurrentMonth ? Math.max(new Date().getDate(), 1) : daysInMonth;

    return {
      income: currentMonthStats.income / divisor,
      expense: currentMonthStats.expense / divisor
    };
  }, [currentMonthStats.income, currentMonthStats.expense, currentMonth, currentYear]);

  // FILTRO: Transações específicas baseadas na aba selecionada (Geral, Receitas, Despesas, Cartão)
  const filteredTransactions = useMemo(() => {
    if (activeTab === 'geral') return monthlyTransactions;
    if (activeTab === 'cartao') return monthlyTransactions.filter(t => t.paymentMethod === 'credit');
    const targetType = activeTab === 'despesas' ? 'expense' : 'income';
    return monthlyTransactions.filter(t => t.type === targetType);
  }, [monthlyTransactions, activeTab]);

  const totalValue = useMemo(() => {
    return filteredTransactions.reduce((acc, t) => acc + t.value, 0);
  }, [filteredTransactions]);

  // GRÁFICO DE LINHA: Prepara os dados para o gráfico de evolução temporal
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

    // Caso Geral: Exibe 3 linhas (Receitas, Despesas e Saldo Acumulado)
    if (activeTab === 'geral') {
      const incomeData = new Array(dataPointsCount).fill(0);
      const expenseData = new Array(dataPointsCount).fill(0);
      const balanceData = new Array(dataPointsCount).fill(0);

      monthlyTransactions.forEach(t => {
        const transactionDate = t.date.includes('/') ? parse(t.date, 'dd/MM/yyyy', new Date()) : parseISO(t.date);
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
          { data: incomeData, color: (_opacity = 1) => theme.success, strokeWidth: 1.5 },
          { data: expenseData, color: (_opacity = 1) => theme.danger, strokeWidth: 1.5 },
          { data: balanceData, color: (_opacity = 1) => theme.primary, strokeWidth: 3 }
        ],
        legend: ["Receitas", "Despesas", "Saldo"]
      };
    }

    // Caso Específico (Receitas/Despesas/Cartão): Exibe apenas uma linha temática
    const data = new Array(dataPointsCount).fill(0);
    filteredTransactions.forEach(t => {
      const transactionDate = t.date.includes('/') ? parse(t.date, 'dd/MM/yyyy', new Date()) : parseISO(t.date);
      const day = transactionDate.getDate();
      const idx = getIdx(day);
      if (idx < dataPointsCount) data[idx] += t.value;
    });

    return {
      labels,
      datasets: [{
        data: data.map(v => v || 0),
        color: (_opacity = 1) => {
          if (activeTab === 'receitas') return theme.success;
          if (activeTab === 'cartao') return theme.warning;
          return theme.danger;
        },
        strokeWidth: 3
      }]
    };
  }, [filteredTransactions, monthlyTransactions, activeTab, activeFilter, currentMonth, currentYear]);

  // GRÁFICO DE DONUT (Geral): Comparativo Receitas vs Despesas
  const comparativoGeralData = useMemo(() => {
    return [
      { name: 'Receitas', population: currentMonthStats.income, color: theme.success, legendFontColor: theme.textMuted },
      { name: 'Despesas', population: currentMonthStats.expense, color: theme.danger, legendFontColor: theme.textMuted },
    ].filter(d => d.population > 0);
  }, [currentMonthStats]);

  // RANKING: Agrupa transações por categoria e ordena do maior para o menor
  const rankingData = useMemo(() => {
    const categoriesMap: Record<string, number> = {};
    const transactionsForRanking = (activeTab === 'geral' || activeTab === 'cartao')
      ? monthlyTransactions.filter(t => t.type === 'expense')
      : filteredTransactions;

    const finalTransactions = activeTab === 'cartao'
      ? transactionsForRanking.filter(t => t.paymentMethod === 'credit')
      : transactionsForRanking;

    finalTransactions.forEach(t => {
      categoriesMap[t.category] = (categoriesMap[t.category] || 0) + t.value;
    });

    const totalRankingValue = Object.values(categoriesMap).reduce((acc, v) => acc + v, 0);

    return Object.entries(categoriesMap)
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
      name: item.name, population: item.value, color: item.color, legendFontColor: theme.textMuted
    }));
  }, [rankingData]);

  // INSIGHTS: Extrai a maior transação e calcula a média diária para exibir dicas
  const insights = useMemo(() => {
    let targetTransactions = monthlyTransactions;

    if (activeTab === 'receitas') targetTransactions = monthlyTransactions.filter(t => t.type === 'income');
    else if (activeTab === 'cartao') targetTransactions = monthlyTransactions.filter(t => t.paymentMethod === 'credit');
    else if (activeTab === 'despesas') targetTransactions = monthlyTransactions.filter(t => t.type === 'expense');
    else targetTransactions = monthlyTransactions.filter(t => t.type === 'expense');

    if (targetTransactions.length === 0) return null;

    const highest = [...targetTransactions].sort((a, b) => b.value - a.value)[0];
    const totalValueForAvg = targetTransactions.reduce((acc, t) => acc + t.value, 0);
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const isCurrentMonth = currentMonth === new Date().getMonth() && currentYear === new Date().getFullYear();
    const divisor = isCurrentMonth ? Math.max(new Date().getDate(), 1) : daysInMonth;

    return { highest, dailyAvg: totalValueForAvg / divisor };
  }, [monthlyTransactions, activeTab, currentMonth, currentYear]);

  // RECORRÊNCIA: Agrupa despesas em Fixas, Variáveis e Parceladas
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
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
    else { setCurrentMonth(currentMonth - 1); }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
    else { setCurrentMonth(currentMonth + 1); }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View>
        <Header />
      </View>

      {/* Seletor de Mês */}
      <View>
        <MonthSelector
          currentMonth={currentMonth}
          currentYear={currentYear}
          onPrev={handlePrevMonth}
          onNext={handleNextMonth}
        />
      </View>

      {/* SUB-TABS (Navegação interna: Geral, Despesas, Receitas, Cartão) */}
      <View style={styles.subTabsWrapper}>
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
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Filtros de Visualização (Mês vs Dia a Dia) */}
        <View>
          <View style={styles.filtersContainer}>
            <TouchableOpacity style={[styles.filterPill, activeFilter === 'mensal' && styles.filterPillActive]} onPress={() => setActiveFilter('mensal')}>
              <Ionicons name="calendar-outline" size={14} color={activeFilter === 'mensal' ? theme.primary : theme.textMuted} />
              <Text style={[styles.filterText, activeFilter === 'mensal' && styles.filterTextActive]}>Mês</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.filterPill, activeFilter === 'diaria' && styles.filterPillActive]} onPress={() => setActiveFilter('diaria')}>
              <Ionicons name="time-outline" size={14} color={activeFilter === 'diaria' ? theme.primary : theme.textMuted} />
              <Text style={[styles.filterText, activeFilter === 'diaria' && styles.filterTextActive]}>Dia a Dia</Text>
            </TouchableOpacity>
          </View>
        </View>

        {monthlyTransactions.length === 0 ? (
          // Estado Vazio: Quando não há transações no mês selecionado
          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyStateIconBg}>
              <MaterialCommunityIcons name="chart-bar" size={48} color={theme.textMuted} />
            </View>
            <Text style={styles.emptyStateTitle}>Nenhum dado este mês</Text>
            <Text style={styles.emptyStateSubtitle}>Adicione transações para ver suas estatísticas aqui.</Text>
          </View>
        ) : (
          <>
            {/* Card de Resumo do Valor Total da Aba Selecionada */}
            {activeTab !== 'geral' && (
              <View style={[
                styles.totalTabCard,
                { borderColor: activeTab === 'receitas' ? `${theme.success}30` : activeTab === 'cartao' ? `${theme.warning}30` : `${theme.danger}30` }
              ]}>
                <View style={[
                  styles.totalTabIconBg,
                  { 
                    backgroundColor: activeTab === 'receitas' 
                      ? theme.successLight 
                      : activeTab === 'cartao' 
                        ? theme.warningLight 
                        : theme.dangerLight 
                  }
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
                    {formatCurrency(totalValue)}
                  </Text>
                  <Text style={styles.totalTabSubValue}>
                    Média: {(() => {
                      const avg = activeTab === 'receitas' ? dailyAverages.income : activeTab === 'cartao' ? (totalValue / Math.max(new Date().getDate(), 1)) : dailyAverages.expense;
                      return formatCurrency(avg);
                    })()} / dia
                  </Text>
                </View>
              </View>
            )}

            {/* GRÁFICO 1: Evolução Temporal (LineChart) */}
            <View>
              <ChartCard
                title={activeTab === 'geral' ? "Fluxo de Caixa" : `Histórico de ${activeTab === 'receitas' ? 'Receitas' : 'Despesas'}`}
                subtitle={activeFilter === 'mensal' ? "Visão mensal agrupada" : "Detalhamento diário"}
              >
                <View style={styles.chartWrapper}>
                  {evolucaoData.datasets[0].data.length > 0 ? (
                    <LineChart
                      data={evolucaoData}
                      width={chartWidth}
                      height={200}
                      yAxisLabel="R$"
                      chartConfig={{
                        backgroundColor: theme.surface,
                        backgroundGradientFrom: theme.surface,
                        backgroundGradientTo: theme.surface,
                        decimalPlaces: 0,
                        color: (_opacity = 1) => `rgba(255, 255, 255, ${_opacity * 0.1})`,
                        labelColor: (_opacity = 1) => theme.textMuted,
                        style: { borderRadius: 16 },
                        propsForDots: { r: "4", strokeWidth: "2", stroke: theme.surface }
                      }}
                      bezier
                      style={styles.lineChart}
                    />
                  ) : (
                    <View style={{ height: 200, justifyContent: 'center', alignItems: 'center' }}>
                      <Text style={{ color: theme.textMuted }}>Dados insuficientes para o gráfico</Text>
                    </View>
                  )}
                </View>
              </ChartCard>
            </View>

            {activeTab === 'geral' ? (
              <>
                {/* Resumo Geral: Receitas vs Despesas com indicadores de comparação */}
                <View style={styles.summaryGrid}>
                  <View style={[styles.summarySmallCard, { borderColor: `${theme.success}30` }]}>
                    <View style={[styles.summaryIconBg, { backgroundColor: theme.successLight }]}>
                      <Ionicons name="trending-up" size={20} color={theme.success} />
                    </View>
                    <Text style={styles.summaryLabel}>Receitas</Text>
                    <Text style={[styles.summaryValue, { color: theme.success }]}>{formatCurrency(currentMonthStats.income)}</Text>
                    <Text style={styles.summaryDailyAvg}>Média: {formatCurrency(dailyAverages.income)}/dia</Text>
                    <View style={styles.comparisonRow}>
                      <Ionicons name={incomeComparison.improved ? "arrow-up" : "arrow-down"} size={12} color={incomeComparison.improved ? theme.success : theme.danger} />
                      <Text style={[styles.comparisonText, { color: incomeComparison.improved ? theme.success : theme.danger }]}>{incomeComparison.percent}% vs mês ant.</Text>
                    </View>
                  </View>

                  <View style={[styles.summarySmallCard, { borderColor: `${theme.danger}30` }]}>
                    <View style={[styles.summaryIconBg, { backgroundColor: theme.dangerLight }]}>
                      <Ionicons name="trending-down" size={20} color={theme.danger} />
                    </View>
                    <Text style={styles.summaryLabel}>Despesas</Text>
                    <Text style={[styles.summaryValue, { color: theme.danger }]}>{formatCurrency(currentMonthStats.expense)}</Text>
                    <Text style={styles.summaryDailyAvg}>Média: {formatCurrency(dailyAverages.expense)}/dia</Text>
                    <View style={styles.comparisonRow}>
                      <Ionicons name={expenseComparison.improved ? "arrow-up" : "arrow-down"} size={12} color={expenseComparison.improved ? theme.danger : theme.success} />
                      <Text style={[styles.comparisonText, { color: expenseComparison.improved ? theme.danger : theme.success }]}>{expenseComparison.percent}% vs mês ant.</Text>
                    </View>
                  </View>
                </View>

                <ChartCard title="Distribuição de Caixa" subtitle="Receitas vs Despesas">
                  <DonutChart data={comparativoGeralData} centerText={formatCurrency(currentMonthStats.balance)} centerSubtext="Saldo Líquido" />
                </ChartCard>
              </>
            ) : (
              <>
                {/* RANKING: Lista de categorias mais impactantes */}
                <ChartCard title="Ranking por Categoria" subtitle={`Maiores ${activeTab === 'receitas' ? 'entradas' : 'gastos'}`}>
                  {rankingData.map((item, index) => (
                    <RankingBar key={index} label={item.name} value={formatCurrency(item.value)} percentage={item.percentage} color={item.color} icon={item.icon} />
                  ))}
                </ChartCard>

                {/* GRÁFICO 3: Divisão Proporcional por Categoria (DonutChart) */}
                <ChartCard title="Divisão Proporcional" subtitle="Participação de cada categoria">
                  <DonutChart data={donutCategoriaData} centerText={formatCurrency(totalValue)} centerSubtext="Total" />
                </ChartCard>

                {/* GRÁFICO 4: Recorrência de Gastos (Fixo vs Variável) */}
                {activeTab === 'despesas' && (
                  <ChartCard title="Tipo de Gasto" subtitle="Fixo vs Variável">
                    <DonutChart data={recorrenciaData} centerText={`${recorrenciaData.length > 0 ? '100%' : '0%'}`} centerSubtext="Total" />
                  </ChartCard>
                )}
              </>
            )}

            {/* SEÇÃO DE INSIGHTS: Informações extras e curiosidades sobre o mês */}
            {insights && (
              <View style={styles.insightsContainer}>
                <Text style={styles.insightsTitle}>Insights Detalhados</Text>
                <View style={styles.insightRow}>
                  <View style={styles.insightCard}>
                    <View style={[styles.insightIconBg, { backgroundColor: `${theme.primary}20` }]}><Ionicons name="star" size={16} color={theme.primary} /></View>
                    <Text style={styles.insightLabel}>Maior {activeTab === 'receitas' ? 'Entrada' : activeTab === 'cartao' ? 'Gasto no Cartão' : 'Gasto'}</Text>
                    <Text style={styles.insightValue}>{formatCurrency(insights.highest.value)}</Text>
                    <Text style={styles.insightSubValue} numberOfLines={1}>{insights.highest.description}</Text>
                  </View>
                  <View style={styles.insightCard}>
                    <View style={[styles.insightIconBg, { backgroundColor: `${theme.info}20` }]}><Ionicons name="calculator" size={16} color={theme.info} /></View>
                    <Text style={styles.insightLabel}>Média Diária</Text>
                    <Text style={styles.insightValue}>{formatCurrency(insights.dailyAvg)}</Text>
                    <Text style={styles.insightSubValue}>Este mês</Text>
                  </View>
                </View>
              </View>
            )}

            {/* CARD DE DICAS: Sugestões financeiras baseadas nos dados reais */}
            <View style={styles.tipsCard}>
              <View style={styles.tipsHeader}>
                <Ionicons name="bulb-outline" size={20} color={theme.warning} />
                <Text style={styles.tipsTitle}>Dica do Mês</Text>
              </View>
              <Text style={styles.tipsContent}>
                {(() => {
                  if (activeTab === 'cartao') return currentMonthStats.pending > 500 ? "Sua fatura de cartão está subindo. Tente antecipar pagamentos ou evitar novas compras parceladas." : "Uso do cartão sob controle. Lembre-se de conferir se as parcelas cabem no orçamento futuro.";
                  if (activeTab === 'despesas' && currentMonthStats.expense > prevMonthStats.expense) return "Seus gastos aumentaram em relação ao mês passado. Tente revisar as categorias 'Variáveis' para economizar.";
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
