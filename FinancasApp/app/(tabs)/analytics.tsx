import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar,
  Dimensions
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { LineChart, PieChart } from 'react-native-chart-kit';

// --- DIMENSÕES E TEMA ---
const screenWidth = Dimensions.get('window').width;
const chartWidth = screenWidth - 80; // Largura responsiva para o gráfico de linhas

const theme = {
  bg: '#121212',
  surface: '#1E1E1E',
  text: '#FFFFFF',
  textMuted: '#A0A0A0',
  primary: '#8A2BE2', // Roxo
  danger: '#F44336',  // Vermelho
  blue: '#2196F3',
  yellow: '#FFEB3B',
  green: '#4CAF50',
  border: '#333333',
};

// --- DADOS MOCKADOS ---
const despesasCategoriaData = [
  { name: 'Moradia', population: 1200, color: theme.primary, legendFontColor: theme.textMuted },
  { name: 'Alimentação', population: 800, color: theme.danger, legendFontColor: theme.textMuted },
  { name: 'Transporte', population: 400, color: theme.yellow, legendFontColor: theme.textMuted },
  { name: 'Saúde', population: 250, color: theme.green, legendFontColor: theme.textMuted },
];

const despesasRecorrenciaData = [
  { name: 'Fixas', population: 60, color: theme.blue, legendFontColor: theme.textMuted },
  { name: 'Variáveis', population: 25, color: theme.yellow, legendFontColor: theme.textMuted },
  { name: 'Parceladas', population: 15, color: theme.danger, legendFontColor: theme.textMuted },
];

const debitoCreditoData = [
  { name: 'Cartão de Crédito', population: 70, color: theme.primary, legendFontColor: theme.textMuted },
  { name: 'Débito / Pix', population: 30, color: theme.blue, legendFontColor: theme.textMuted },
];

const evolucaoDespesasData = {
  labels: ["01", "05", "10", "15", "20", "25", "30"],
  datasets: [{ data: [150, 400, 380, 900, 850, 1200, 1100] }]
};

// --- COMPONENTES MENORES ---

const Header = () => (
  <View style={styles.header}>
    <TouchableOpacity style={styles.iconButton}>
      <Feather name="menu" size={24} color={theme.text} />
    </TouchableOpacity>
    <Text style={styles.headerTitle}>Gráficos</Text>
    <View style={{ width: 24 }} /> {/* Espaçador para centrar o título */}
  </View>
);

const MonthSelector = () => (
  <View style={styles.monthSelector}>
    <TouchableOpacity style={styles.monthArrow}>
      <Ionicons name="chevron-back" size={20} color={theme.textMuted} />
    </TouchableOpacity>
    <Text style={styles.monthText}>Março</Text>
    <TouchableOpacity style={styles.monthArrow}>
      <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
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
  const chartSize = 200; // Tamanho fixo para garantir o alinhamento perfeito

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
          center={[chartSize / 4, 0]} // Truque para centrar o gráfico sem a legenda
          hasLegend={false} // Removemos a legenda nativa
          absolute
        />
        
        {/* O "Furo" da Rosca posicionado com Flexbox no centro absoluto */}
        <View style={[StyleSheet.absoluteFill, styles.centerAll]}>
          <View style={styles.donutHole}>
            <Text style={styles.donutCenterText}>{centerText}</Text>
            {centerSubtext && <Text style={styles.donutCenterSubtext}>{centerSubtext}</Text>}
          </View>
        </View>
      </View>

      {/* A Legenda Customizada (Substitui a legenda padrão) */}
      <View style={styles.customLegendContainer}>
        {data.map((item: any, index: number) => (
          <View key={index} style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: item.color }]} />
            <Text style={styles.legendText}>
              {item.name} <Text style={styles.legendValue}>({item.population})</Text>
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

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
  const [activeTab, setActiveTab] = useState('graficos');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.bg} />
      
      <Header />
      <MonthSelector />

      {/* Filtros em formato de Pill */}
      <View style={styles.filtersContainer}>
        <TouchableOpacity 
          style={[styles.filterPill, activeFilter === 'mensal' && styles.filterPillActive]}
          onPress={() => setActiveFilter('mensal')}
        >
          <Text style={[styles.filterText, activeFilter === 'mensal' && styles.filterTextActive]}>Evolução mensal</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.filterPill, activeFilter === 'diaria' && styles.filterPillActive]}
          onPress={() => setActiveFilter('diaria')}
        >
          <Text style={[styles.filterText, activeFilter === 'diaria' && styles.filterTextActive]}>Evolução diária</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* CARD 1: Evolução das despesas (Linha) */}
        <ChartCard title="Evolução das despesas">
          <View style={styles.chartWrapper}>
            <LineChart
              data={evolucaoDespesasData}
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
                color: (opacity = 1) => `rgba(244, 67, 54, ${opacity})`, // Linha vermelha
                labelColor: (opacity = 1) => theme.textMuted,
                style: { borderRadius: 16 },
                propsForDots: { r: "4", strokeWidth: "2", stroke: theme.danger }
              }}
              bezier // Deixa a linha com curva suave
              style={styles.lineChart}
            />
          </View>
        </ChartCard>

        {/* CARD 2: Ranking de categorias (Barras horizontais) */}
        <ChartCard title="Ranking de categorias">
          <RankingBar label="Moradia" value="1.200,00" percentage={80} color={theme.primary} />
          <RankingBar label="Alimentação" value="800,00" percentage={55} color={theme.danger} />
          <RankingBar label="Transporte" value="400,00" percentage={30} color={theme.yellow} />
          <RankingBar label="Saúde" value="250,00" percentage={15} color={theme.green} />
        </ChartCard>

        {/* CARD 3: Despesas por categoria (Donut) */}
        <ChartCard title="Despesas por categoria">
          <DonutChart 
            data={despesasCategoriaData} 
            centerText="R$ 2.650" 
            centerSubtext="Total" 
          />
        </ChartCard>

        {/* CARD 4: Despesas por recorrência */}
        <ChartCard title="Despesas por recorrência">
          <DonutChart 
            data={despesasRecorrenciaData} 
            centerText="100%" 
            centerSubtext="Despesas" 
          />
        </ChartCard>

        {/* CARD 5: Débito vs Crédito */}
        <ChartCard title="Débito vs Crédito">
          <DonutChart 
            data={debitoCreditoData} 
            centerText="Crédito" 
            centerSubtext="Maioria" 
          />
        </ChartCard>

        {/* Espaço no final */}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* NAVEGAÇÃO INFERIOR CUSTOMIZADA (Sub-tabs) */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('despesas')}>
          <Text style={[styles.navText, activeTab === 'despesas' && styles.navTextActive]}>Despesas</Text>
          {activeTab === 'despesas' && <View style={[styles.navIndicator, { backgroundColor: theme.danger }]} />}
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('receitas')}>
          <Text style={[styles.navText, activeTab === 'receitas' && styles.navTextActive]}>Receitas</Text>
          {activeTab === 'receitas' && <View style={[styles.navIndicator, { backgroundColor: theme.green }]} />}
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('graficos')}>
          <Text style={[styles.navText, activeTab === 'graficos' && styles.navTextActive]}>Gráficos</Text>
          {activeTab === 'graficos' && <View style={[styles.navIndicator, { backgroundColor: theme.primary }]} />}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.text,
  },
  iconButton: {
    padding: 4,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  monthArrow: {
    padding: 8,
  },
  monthText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginHorizontal: 16,
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
    gap: 16,
  },
  card: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.border,
    elevation: 3, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
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
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
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
  // Navegação Inferior Customizada (Sub-tabs)
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: theme.surface,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    paddingBottom: 20, // Área segura para iPhones
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    position: 'relative',
  },
  navText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textMuted,
  },
  navTextActive: {
    color: theme.text,
  },
  navIndicator: {
    position: 'absolute',
    bottom: 0,
    width: '40%',
    height: 3,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  }
});