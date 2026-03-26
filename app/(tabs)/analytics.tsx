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
import { LineChart, PieChart } from 'react-native-chart-kit';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTransactionStore } from '../../store/transactionStore';

// --- DIMENSÕES E TEMA ---
const screenWidth = Dimensions.get('window').width;
const chartWidth = screenWidth - 80; // Largura responsiva para o gráfico de linhas

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

// --- COMPONENTES MENORES ---

const Header = () => (
  <View style={styles.header}>
    <View>
      <Text style={styles.headerTitle}>Análise</Text>
      <Text style={styles.headerSubtitle}>Insights do seu orçamento</Text>
    </View>
    <TouchableOpacity
      style={styles.iconCircleHeader}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Ionicons name="share-social-outline" size={20} color={theme.text} />
    </TouchableOpacity>
  </View>
);

const MonthSelector = ({ currentMonth, currentYear, onPrev, onNext }: any) => (
  <View style={styles.monthSelectorRow}>
    <TouchableOpacity
      style={styles.monthArrowBtn}
      onPress={onPrev}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Ionicons name="chevron-back" size={18} color={theme.textMuted} />
    </TouchableOpacity>

    <View style={styles.monthDisplay}>
      <Ionicons name="calendar-outline" size={16} color={theme.primary} style={{ marginRight: 8 }} />
      <Text style={styles.monthText}>{monthNames[currentMonth]} {currentYear}</Text>
    </View>

    <TouchableOpacity
      style={styles.monthArrowBtn}
      onPress={onNext}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
    </TouchableOpacity>
  </View>
);

const ChartCard = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>{title}</Text>
    {children}
  </View>
);

// O NOVO COMPONENTE DONUT CHART (Centrado perfeitamente)
const DonutChart = ({ data, centerText, centerSubtext }: any) => {
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
        {data.map((item: any, index: number) => (
          <View key={index} style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: item.color }]} />
            <Text style={styles.legendText}>
              {item.name} <Text style={styles.legendValue}>R$ {item.population.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</Text>
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const InsightCard = ({ title, desc, icon, color }: any) => (
  <View style={styles.insightCard}>
    <View style={[styles.insightIconCircle, { backgroundColor: `${color}15` }]}>
      <Ionicons name={icon} size={20} color={color} />
    </View>
    <View style={{ flex: 1, marginLeft: 12 }}>
      <Text style={styles.insightTitle}>{title}</Text>
      <Text style={styles.insightDesc}>{desc}</Text>
    </View>
  </View>
);

// Barra de progresso para o Ranking
const RankingBar = ({ label, value, percentage, color }: any) => (
  <View style={styles.rankingItem}>
    <View style={styles.rankingHeader}>
      <Text style={styles.rankingLabel}>{label}</Text>
      <Text style={styles.rankingValue}>R$ {value}</Text>
    </View>
    <View style={styles.progressBarBg}>
      <View style={[styles.progressBarFill, { backgroundColor: color, width: `${percentage}%` }]} />
    </View>
  </View>
);

// --- TELA PRINCIPAL ---

export default function AnalyticsScreen() {
  const [activeFilter, setActiveFilter] = useState('mensal');
  const [activeTab, setActiveTab] = useState('geral'); // 'geral' | 'despesas' | 'receitas'
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const insets = useSafeAreaInsets();

  const transactions = useTransactionStore((state) => state.transactions);

  // Transações filtradas por mês/ano
  const monthlyTransactions = useMemo(() => {
    return transactions.filter(t => {
      const [day, month, year] = t.date.split('/').map(Number);
      return (month - 1) === currentMonth && year === currentYear;
    });
  }, [transactions, currentMonth, currentYear]);

  // Transações específicas da aba ativa
  const filteredTransactions = useMemo(() => {
    if (activeTab === 'geral') return monthlyTransactions;
    const targetType = activeTab === 'despesas' ? 'expense' : 'income';
    return monthlyTransactions.filter(t => t.type === targetType);
  }, [monthlyTransactions, activeTab]);

  const totalValue = useMemo(() => {
    return filteredTransactions.reduce((acc, t) => acc + t.value, 0);
  }, [filteredTransactions]);

  const evolucaoData = useMemo(() => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Para visualização mensal, vamos usar 6 pontos fixos (01, 05, 10, 15, 20, 25, 30)
    // Para visualização diária, todos os dias do mês.
    const isDiaria = activeFilter === 'diaria';
    const dataPointsCount = isDiaria ? daysInMonth : 7;

    let labels: string[] = [];
    if (isDiaria) {
      for (let i = 1; i <= daysInMonth; i++) {
        // Mostra label apenas a cada 5 dias para não poluir
        if (i === 1 || i % 5 === 0 || i === daysInMonth) labels.push(i.toString().padStart(2, '0'));
        else labels.push("");
      }
    } else {
      labels = ["01", "05", "10", "15", "20", "25", "30"];
    }

    const getIdx = (day: number) => {
      if (isDiaria) return day - 1;
      // Mapeamento para os 7 pontos da visão mensal
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
        const [day] = t.date.split('/').map(Number);
        const idx = getIdx(day);
        if (idx < dataPointsCount) {
          if (t.type === 'income') incomeData[idx] += t.value;
          else expenseData[idx] += t.value;
        }
      });

      // Calcula o saldo acumulado
      let cumulativeBalance = 0;
      for (let i = 0; i < dataPointsCount; i++) {
        cumulativeBalance += (incomeData[i] - expenseData[i]);
        balanceData[i] = cumulativeBalance;
      }

      return {
        labels,
        datasets: [
          { data: incomeData, color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`, strokeWidth: 1 },
          { data: expenseData, color: (opacity = 1) => `rgba(244, 67, 54, ${opacity})`, strokeWidth: 1 },
          { data: balanceData, color: (opacity = 1) => `rgba(138, 43, 226, ${opacity})`, strokeWidth: 3 } // Linha de saldo mais grossa
        ],
        legend: ["Receitas", "Despesas", "Saldo"]
      };
    }

    const data = new Array(dataPointsCount).fill(0);
    filteredTransactions.forEach(t => {
      const [day] = t.date.split('/').map(Number);
      const idx = getIdx(day);
      if (idx < dataPointsCount) data[idx] += t.value;
    });

    return {
      labels,
      datasets: [{
        data: data.map(v => v || 0),
        color: (opacity = 1) => activeTab === 'receitas' ? `rgba(76, 175, 80, ${opacity})` : `rgba(244, 67, 54, ${opacity})`,
        strokeWidth: 2
      }]
    };
  }, [filteredTransactions, monthlyTransactions, activeTab, activeFilter, currentMonth, currentYear]);

  const comparativoGeralData = useMemo(() => {
    const receitas = monthlyTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.value, 0);
    const despesas = monthlyTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.value, 0);

    return [
      { name: 'Receitas', population: receitas, color: theme.success, legendFontColor: theme.textMuted },
      { name: 'Despesas', population: despesas, color: theme.danger, legendFontColor: theme.textMuted },
    ].filter(d => d.population > 0);
  }, [monthlyTransactions]);

  const rankingData = useMemo(() => {
    const categories: Record<string, number> = {};
    filteredTransactions.forEach(t => {
      categories[t.category] = (categories[t.category] || 0) + t.value;
    });

    return Object.entries(categories)
      .map(([name, value]) => ({
        name,
        value,
        percentage: totalValue > 0 ? (value / totalValue) * 100 : 0,
        color: categoryColors[name] || theme.textMuted
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredTransactions, totalValue]);

  const donutCategoriaData = useMemo(() => {
    return rankingData.map(item => ({
      name: item.name,
      population: item.value,
      color: item.color,
      legendFontColor: theme.textMuted
    }));
  }, [rankingData]);

  const recorrenciaData = useMemo(() => {
    const data: Record<string, number> = { 'Fixas': 0, 'Variáveis': 0, 'Parceladas': 0 };
    filteredTransactions.forEach(t => {
      const rec = t.recurrence || 'variable';
      if (rec === 'fixed') data['Fixas'] += t.value;
      else if (rec === 'installment') data['Parceladas'] += t.value;
      else data['Variáveis'] += t.value;
    });

    return [
      { name: 'Fixas', population: data['Fixas'], color: theme.blue, legendFontColor: theme.textMuted },
      { name: 'Variáveis', population: data['Variáveis'], color: theme.yellow, legendFontColor: theme.textMuted },
      { name: 'Parceladas', population: data['Parceladas'], color: theme.danger, legendFontColor: theme.textMuted },
    ].filter(d => d.population > 0);
  }, [filteredTransactions]);

  const debitoCreditoData = useMemo(() => {
    const data: Record<string, number> = { 'Crédito': 0, 'Débito/Pix': 0 };
    filteredTransactions.forEach(t => {
      const method = t.paymentMethod || 'debit';
      if (method === 'credit') data['Crédito'] += t.value;
      else data['Débito/Pix'] += t.value;
    });

    return [
      { name: 'Crédito', population: data['Crédito'], color: theme.primary, legendFontColor: theme.textMuted },
      { name: 'Débito / Pix', population: data['Débito/Pix'], color: theme.blue, legendFontColor: theme.textMuted },
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
      <Header />
      <MonthSelector
        currentMonth={currentMonth}
        currentYear={currentYear}
        onPrev={handlePrevMonth}
        onNext={handleNextMonth}
      />

      {/* NAVEGAÇÃO SUPERIOR (Sub-tabs) */}
      <View style={styles.subTabsContainer}>
        <TouchableOpacity style={styles.subTabItem} onPress={() => setActiveTab('geral')}>
          <Text style={[styles.subTabText, activeTab === 'geral' && styles.subTabTextActive]}>Geral</Text>
          {activeTab === 'geral' && <View style={[styles.subTabIndicator, { backgroundColor: theme.primary }]} />}
        </TouchableOpacity>

        <TouchableOpacity style={styles.subTabItem} onPress={() => setActiveTab('despesas')}>
          <Text style={[styles.subTabText, activeTab === 'despesas' && styles.subTabTextActive]}>Saídas</Text>
          {activeTab === 'despesas' && <View style={[styles.subTabIndicator, { backgroundColor: theme.danger }]} />}
        </TouchableOpacity>

        <TouchableOpacity style={styles.subTabItem} onPress={() => setActiveTab('receitas')}>
          <Text style={[styles.subTabText, activeTab === 'receitas' && styles.subTabTextActive]}>Entradas</Text>
          {activeTab === 'receitas' && <View style={[styles.subTabIndicator, { backgroundColor: theme.success }]} />}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]} showsVerticalScrollIndicator={false}>

        {/* Filtros em formato de Pill */}
        <View style={styles.filtersContainer}>
          <TouchableOpacity
            style={[styles.filterPill, activeFilter === 'mensal' && styles.filterPillActive]}
            onPress={() => setActiveFilter('mensal')}
          >
            <Text style={[styles.filterText, activeFilter === 'mensal' && styles.filterTextActive]}>Visão Mensal</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterPill, activeFilter === 'diaria' && styles.filterPillActive]}
            onPress={() => setActiveFilter('diaria')}
          >
            <Text style={[styles.filterText, activeFilter === 'diaria' && styles.filterTextActive]}>Visão Diária</Text>
          </TouchableOpacity>
        </View>

        {/* CARD 1: Evolução (Linha) */}
        <ChartCard title={activeTab === 'geral' ? "Balanço do Período" : `Evolução das ${activeTab === 'receitas' ? 'entradas' : 'saídas'}`}>
          <View style={styles.chartWrapper}>
            <LineChart
              data={evolucaoData}
              width={chartWidth}
              height={220}
              yAxisLabel="R$ "
              yAxisSuffix=""
              withInnerLines={false}
              withOuterLines={false}
              chartConfig={{
                backgroundColor: theme.surface,
                backgroundGradientFrom: theme.surface,
                backgroundGradientTo: theme.surface,
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(138, 43, 226, ${opacity * 0.4})`,
                labelColor: (opacity = 1) => theme.textMuted,
                style: { borderRadius: 16 },
                propsForDots: { r: "4", strokeWidth: "2", stroke: theme.primary }
              }}
              bezier
              style={styles.lineChart}
            />
          </View>
        </ChartCard>

        {activeTab === 'geral' ? (
          <>
            <ChartCard title="Distribuição de Fluxo">
              {comparativoGeralData.length > 0 ? (
                <DonutChart
                  data={comparativoGeralData}
                  centerText={`R$ ${(comparativoGeralData.reduce((acc, d) => acc + d.population, 0)).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`}
                  centerSubtext="Movimentado"
                />
              ) : (
                <Text style={{ color: theme.textMuted, textAlign: 'center' }}>Sem dados este mês</Text>
              )}
            </ChartCard>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Resumo do Período</Text>
              <View style={styles.card}>
                <View style={{ gap: 12 }}>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Total Entradas</Text>
                    <Text style={[styles.summaryValue, { color: theme.success }]}>
                      + R$ {monthlyTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.value, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Total Saídas</Text>
                    <Text style={[styles.summaryValue, { color: theme.danger }]}>
                      - R$ {monthlyTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.value, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </Text>
                  </View>
                  <View style={[styles.summaryRow, { borderTopWidth: 1, borderTopColor: theme.border, paddingTop: 12 }]}>
                    <Text style={[styles.summaryLabel, { fontWeight: 'bold', color: theme.text }]}>Balanço Final</Text>
                    <Text style={[styles.summaryValue, { fontWeight: 'bold', color: (monthlyTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.value, 0) - monthlyTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.value, 0)) >= 0 ? theme.success : theme.danger }]}>
                      R$ {(monthlyTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.value, 0) - monthlyTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.value, 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </>
        ) : (
          <>
            <ChartCard title={`Maiores ${activeTab === 'receitas' ? 'Entradas' : 'Saídas'}`}>
              {rankingData.length > 0 ? rankingData.map((item, index) => (
                <RankingBar
                  key={index}
                  label={item.name}
                  value={item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  percentage={item.percentage}
                  color={item.color}
                />
              )) : (
                <Text style={{ color: theme.textMuted, textAlign: 'center' }}>Nenhuma transação encontrada</Text>
              )}
            </ChartCard>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Insights de Gestão</Text>
              {activeTab === 'despesas' && rankingData.length > 0 && (
                <InsightCard
                  title="Maior Categoria"
                  desc={`Você gastou mais com ${rankingData[0].name} este mês, representando ${Math.round(rankingData[0].percentage)}% das suas saídas.`}
                  icon="alert-circle-outline"
                  color={theme.primary}
                />
              )}
              <InsightCard
                title="Saúde do Orçamento"
                desc={totalValue > 0 ? "Seus lançamentos estão bem categorizados. Isso ajuda muito na sua análise!" : "Comece a lançar suas movimentações para gerar insights automáticos."}
                icon="shield-checkmark-outline"
                color={theme.success}
              />
            </View>

            <ChartCard title={`Divisão por categoria`}>
              {donutCategoriaData.length > 0 ? (
                <DonutChart
                  data={donutCategoriaData}
                  centerText={`R$ ${totalValue.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`}
                  centerSubtext="Total"
                />
              ) : (
                <Text style={{ color: theme.textMuted, textAlign: 'center' }}>Sem dados</Text>
              )}
            </ChartCard>
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
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: theme.text,
  },
  headerSubtitle: {
    fontSize: 13,
    color: theme.textMuted,
    marginTop: 2,
  },
  iconCircleHeader: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  monthSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 6,
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.border,
  },
  monthArrowBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  monthText: {
    color: theme.text,
    fontSize: 15,
    fontWeight: '600',
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  filterPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
  },
  filterPillActive: {
    backgroundColor: 'rgba(138, 43, 226, 0.15)', // Roxo transparente
    borderColor: theme.primary,
  },
  filterText: {
    color: theme.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  filterTextActive: {
    color: theme.primary,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100, // Aumentado para não cortar com a TabBar
    gap: 16,
  },
  card: {
    backgroundColor: theme.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.border,
  },
  cardTitle: {
    color: theme.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  // Gráfico de Linha
  chartWrapper: {
    alignItems: 'center',
    marginLeft: -15, // Ajuste fino para o react-native-chart-kit não cortar a esquerda
  },
  lineChart: {
    borderRadius: 16,
  },

  // --- NOVOS ESTILOS DO DONUT CHART ---
  donutWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  centerAll: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutHole: {
    width: 110, // Tamanho do furo central
    height: 110,
    borderRadius: 55, // Metade da width para ser um círculo perfeito
    backgroundColor: theme.surface, // Mesma cor do card para "furar" a pizza
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutCenterText: {
    color: theme.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  donutCenterSubtext: {
    color: theme.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  // Estilos da Legenda Customizada
  customLegendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 20,
    paddingHorizontal: 10,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    color: theme.textMuted,
    fontSize: 13,
  },
  legendValue: {
    color: theme.text,
    fontWeight: 'bold',
  },

  // Ranking Bars
  rankingItem: {
    marginBottom: 16,
  },
  rankingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  rankingLabel: {
    color: theme.text,
    fontSize: 14,
    fontWeight: '500',
  },
  rankingValue: {
    color: theme.textMuted,
    fontSize: 14,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: theme.border,
    borderRadius: 4,
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  // Resumo Geral
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    color: theme.textMuted,
    fontSize: 14,
  },
  summaryValue: {
    color: theme.text,
    fontSize: 16,
    fontWeight: '600',
  },
  // Insights
  insightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.border,
    marginBottom: 12,
  },
  insightIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightTitle: {
    color: theme.text,
    fontSize: 14,
    fontWeight: 'bold',
  },
  insightDesc: {
    color: theme.textMuted,
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  // Navegação Superior (Sub-tabs)
  subTabsContainer: {
    flexDirection: 'row',
    backgroundColor: theme.surface,
    paddingHorizontal: 20,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  subTabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  subTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textMuted,
  },
  subTabTextActive: {
    color: theme.text,
  },
  subTabIndicator: {
    position: 'absolute',
    bottom: 0,
    width: '60%',
    height: 3,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  }
});