import React, { useState, ComponentProps } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar 
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';

// --- TIPAGEM ---
// Captura os nomes válidos do Ionicons para usarmos na nossa interface
type IoniconsName = ComponentProps<typeof Ionicons>['name'];

interface Conta {
  id: string;
  nome: string;
  saldo: number;
  icone: IoniconsName;
}

interface MockData {
  saldo: number;
  receitas: number;
  despesas: number;
  pendencias: { valor: number; qtd: number };
  contas: Conta[];
  categoriaDestaque: { nome: string; valor: number; cor: string };
}

// Resolve o Erro 7031 (Implicit any)
interface CardSaldoProps {
  mostrarSaldo: boolean;
  toggleSaldo: () => void;
}

// --- MOCK DATA ---
const mockData: MockData = {
  saldo: -351.91,
  receitas: 2450.00,
  despesas: 2801.91,
  pendencias: { valor: 450.00, qtd: 2 },
  contas: [
    { id: '1', nome: 'Carteira', saldo: 50.00, icone: 'wallet-outline' },
    { id: '2', nome: 'Conta Corrente', saldo: -401.91, icone: 'card-outline' }
  ],
  categoriaDestaque: { nome: 'Educação', valor: 850.00, cor: '#8A2BE2' }
};

// --- CORES DO TEMA DARK ---
const theme = {
  bg: '#121212',
  surface: '#1E1E1E',
  text: '#FFFFFF',
  textMuted: '#A0A0A0',
  primary: '#8A2BE2', // Roxo
  success: '#4CAF50', // Verde
  danger: '#F44336',  // Vermelho
  border: '#333333'
};

// --- COMPONENTES ---

const Header = () => (
  <View style={styles.header}>
    <TouchableOpacity style={styles.iconButton}>
      <Ionicons name="person-circle-outline" size={32} color={theme.text} />
    </TouchableOpacity>
    
    <TouchableOpacity style={styles.monthSelector}>
      <Text style={styles.monthText}>Março</Text>
      <Ionicons name="chevron-down" size={16} color={theme.text} style={{ marginLeft: 4 }} />
    </TouchableOpacity>
    
    <TouchableOpacity style={styles.iconButton}>
      <Ionicons name="notifications-outline" size={28} color={theme.text} />
    </TouchableOpacity>
  </View>
);

const CardSaldo = ({ mostrarSaldo, toggleSaldo }: CardSaldoProps) => (
  <View style={styles.card}>
    <View style={styles.saldoHeader}>
      <Text style={styles.cardTitle}>Saldo em contas</Text>
      <TouchableOpacity onPress={toggleSaldo}>
        <Ionicons name={mostrarSaldo ? "eye-outline" : "eye-off-outline"} size={22} color={theme.textMuted} />
      </TouchableOpacity>
    </View>
    <Text style={styles.saldoValue}>
      {mostrarSaldo ? `R$ ${mockData.saldo.toFixed(2).replace('.', ',')}` : 'R$ •••••'}
    </Text>

    <View style={styles.indicadoresRow}>
      <View style={styles.indicador}>
        <View style={[styles.iconCircle, { backgroundColor: 'rgba(76, 175, 80, 0.15)' }]}>
          <Ionicons name="arrow-up" size={16} color={theme.success} />
        </View>
        <View>
          <Text style={styles.indicadorLabel}>Receitas</Text>
          <Text style={[styles.indicadorValue, { color: theme.success }]}>
            {mostrarSaldo ? `R$ ${mockData.receitas.toFixed(2).replace('.', ',')}` : 'R$ •••••'}
          </Text>
        </View>
      </View>

      <View style={styles.indicador}>
        <View style={[styles.iconCircle, { backgroundColor: 'rgba(244, 67, 54, 0.15)' }]}>
          <Ionicons name="arrow-down" size={16} color={theme.danger} />
        </View>
        <View>
          <Text style={styles.indicadorLabel}>Despesas</Text>
          <Text style={[styles.indicadorValue, { color: theme.danger }]}>
            {mostrarSaldo ? `R$ ${mockData.despesas.toFixed(2).replace('.', ',')}` : 'R$ •••••'}
          </Text>
        </View>
      </View>
    </View>
  </View>
);

const SecaoPendencias = () => (
  <TouchableOpacity style={[styles.card, styles.rowBetween]}>
    <View style={styles.row}>
      <View style={[styles.iconCircle, { backgroundColor: 'rgba(255, 152, 0, 0.15)' }]}>
        <Feather name="clock" size={20} color="#FF9800" />
      </View>
      <View style={{ marginLeft: 12 }}>
        <Text style={styles.cardTitle}>Despesas pendentes</Text>
        <Text style={styles.saldoValueSmall}>R$ {mockData.pendencias.valor.toFixed(2).replace('.', ',')}</Text>
      </View>
    </View>
    <View style={styles.badge}>
      <Text style={styles.badgeText}>+{mockData.pendencias.qtd}</Text>
    </View>
  </TouchableOpacity>
);

const ListaContas = () => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>Minhas Contas</Text>
      <TouchableOpacity>
        <Ionicons name="add-circle-outline" size={24} color={theme.primary} />
      </TouchableOpacity>
    </View>
    
    <View style={styles.card}>
      {mockData.contas.map((conta, index) => (
        <View key={conta.id}>
          <View style={styles.contaItem}>
            <View style={styles.row}>
              {/* O erro 2322 sumiu pois o TS agora sabe que 'conta.icone' é um IoniconsName válido */}
              <Ionicons name={conta.icone} size={24} color={theme.textMuted} />
              <Text style={styles.contaNome}>{conta.nome}</Text>
            </View>
            <Text style={styles.contaSaldo}>
              R$ {conta.saldo.toFixed(2).replace('.', ',')}
            </Text>
          </View>
          {index < mockData.contas.length - 1 && <View style={styles.divider} />}
        </View>
      ))}
    </View>
  </View>
);

const CartoesCredito = () => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Cartões de Crédito</Text>
    <View style={[styles.card, styles.emptyStateCard]}>
      <Ionicons name="card-outline" size={40} color={theme.textMuted} style={{ marginBottom: 12 }} />
      <Text style={styles.emptyStateText}>
        Você ainda não tem nenhum cartão de crédito cadastrado
      </Text>
      <TouchableOpacity style={styles.primaryButton}>
        <Text style={styles.primaryButtonText}>Adicionar novo cartão</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const DespesasCategoria = () => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Despesas por Categoria</Text>
    <View style={styles.card}>
      <View style={styles.row}>
        {/* Placeholder para gráfico de rosca (Simulado com CSS) */}
        <View style={styles.fakeDonutChart}>
          <Text style={styles.fakeDonutText}>Edu.</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 16 }}>
          <Text style={styles.cardTitle}>{mockData.categoriaDestaque.nome}</Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { backgroundColor: theme.primary, width: '70%' }]} />
          </View>
          <Text style={styles.contaSaldo}>R$ {mockData.categoriaDestaque.valor.toFixed(2).replace('.', ',')}</Text>
        </View>
      </View>
    </View>
  </View>
);

const PlanejamentoMensal = () => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Planejamento Mensal</Text>
    <View style={[styles.card, styles.centerAll]}>
      <MaterialCommunityIcons name="finance" size={32} color={theme.textMuted} />
      <Text style={[styles.emptyStateText, { marginTop: 8 }]}>
        Criar meu planejamento (Em breve)
      </Text>
    </View>
  </View>
);

// --- TELA PRINCIPAL ---

export default function Dashboard() {
  const [mostrarSaldo, setMostrarSaldo] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.bg} />
      <Header />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <CardSaldo 
          mostrarSaldo={mostrarSaldo} 
          toggleSaldo={() => setMostrarSaldo(!mostrarSaldo)} 
        />
        
        <SecaoPendencias />
        
        <ListaContas />
        
        <CartoesCredito />
        
        <DespesasCategoria />
        
        <PlanejamentoMensal />

        
        
      </ScrollView>
    </SafeAreaView>
  );
}

// --- ESTILOS ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
    gap: 16, 
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  iconButton: {
    padding: 4,
  },
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  monthText: {
    color: theme.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Utilitários Layout
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  centerAll: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  // Cards Comuns
  card: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.border,
  },
  cardTitle: {
    color: theme.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  // Card de Saldo
  saldoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  saldoValue: {
    color: theme.text,
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  saldoValueSmall: {
    color: theme.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
  indicadoresRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  indicador: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  indicadorLabel: {
    color: theme.textMuted,
    fontSize: 12,
  },
  indicadorValue: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 2,
  },
  // Pendências
  badge: {
    backgroundColor: theme.danger,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  // Seções (Contas, Cartões, etc)
  section: {
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: theme.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  contaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  contaNome: {
    color: theme.text,
    fontSize: 16,
    marginLeft: 12,
  },
  contaSaldo: {
    color: theme.text,
    fontSize: 16,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: theme.border,
    marginVertical: 8,
  },
  // Cartões de Crédito (Empty State)
  emptyStateCard: {
    alignItems: 'center',
    paddingVertical: 32,
    borderStyle: 'dashed',
  },
  emptyStateText: {
    color: theme.textMuted,
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: 'rgba(138, 43, 226, 0.15)', // Roxo com opacidade
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.primary,
  },
  primaryButtonText: {
    color: theme.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  // Gráfico Fake
  fakeDonutChart: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 8,
    borderColor: theme.primary,
    borderTopColor: theme.border, // Simulando o pedaço da pizza
    alignItems: 'center',
    justifyContent: 'center',
  },
  fakeDonutText: {
    color: theme.text,
    fontSize: 10,
    fontWeight: 'bold',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: theme.border,
    borderRadius: 3,
    marginVertical: 8,
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  // Botão Gerenciar Tela Inicial
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginTop: 10,
  },
  manageButtonText: {
    color: theme.primary,
    fontSize: 16,
    fontWeight: 'bold',
  }
});