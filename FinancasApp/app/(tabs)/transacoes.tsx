import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  SafeAreaView, 
  StatusBar, 
  TouchableOpacity, 
  SectionList 
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// --- TIPAGEM (TypeScript) ---
type TransactionType = 'entrada' | 'saida';
type StatusType = 'confirmado' | 'erro';

interface Transaction {
  id: string;
  nome: string;
  categoria: string;
  conta: string;
  valor: number;
  tipo: TransactionType;
  status: StatusType;
  icone: keyof typeof Ionicons.glyphMap;
}

interface Section {
  title: string;
  data: Transaction[];
}

// --- CORES DO TEMA E CATEGORIAS ---
const theme = {
  bg: '#121212',
  surface: '#1E1E1E',
  text: '#FFFFFF',
  textMuted: '#A0A0A0',
  primary: '#8A2BE2', // Roxo
  danger: '#F44336',  // Vermelho
  success: '#4CAF50', // Verde
  border: '#333333',
};

const categoryColors: Record<string, string> = {
  'Compras': '#8A2BE2',      // Roxo
  'Transporte': '#9E9E9E',   // Cinza
  'Educação': '#FFEB3B',     // Amarelo
  'Saúde': '#4CAF50',        // Verde
  'Alimentação': '#F44336',  // Vermelho
  'Casa': '#2196F3',         // Azul
  'Serviços': '#388E3C',     // Verde escuro
  'Renda extra': '#8A2BE2',  // Roxo
};

// --- DADOS MOCKADOS ---
const mockSections: Section[] = [
  {
    title: 'Quarta, 11',
    data: [
      { id: '1', nome: 'Mercado', categoria: 'Alimentação', conta: 'Cartão de Crédito', valor: 150.45, tipo: 'saida', status: 'confirmado', icone: 'cart-outline' },
      { id: '2', nome: 'Uber', categoria: 'Transporte', conta: 'Conta Corrente', valor: 25.00, tipo: 'saida', status: 'confirmado', icone: 'car-outline' },
    ]
  },
  {
    title: 'Domingo, 08',
    data: [
      { id: '3', nome: 'Freelance Design', categoria: 'Renda extra', conta: 'Conta Corrente', valor: 850.00, tipo: 'entrada', status: 'confirmado', icone: 'cash-outline' },
      { id: '4', nome: 'Farmácia', categoria: 'Saúde', conta: 'Carteira', valor: 89.90, tipo: 'saida', status: 'erro', icone: 'medical-outline' },
      { id: '5', nome: 'Mensalidade Faculdade', categoria: 'Educação', conta: 'Conta Corrente', valor: 650.00, tipo: 'saida', status: 'confirmado', icone: 'school-outline' },
    ]
  },
  {
    title: 'Sexta, 06',
    data: [
      { id: '6', nome: 'Conta de Luz', categoria: 'Casa', conta: 'Conta Corrente', valor: 120.00, tipo: 'saida', status: 'confirmado', icone: 'home-outline' },
      { id: '7', nome: 'Assinatura Streaming', categoria: 'Serviços', conta: 'Cartão de Crédito', valor: 39.90, tipo: 'saida', status: 'confirmado', icone: 'tv-outline' },
    ]
  }
];

// --- COMPONENTES ---

const Header = () => (
  <View style={styles.header}>
    <Text style={styles.headerTitle}>Transações</Text>
    <View style={styles.headerIcons}>
      <TouchableOpacity style={styles.iconButton}>
        <Ionicons name="calendar-outline" size={24} color={theme.text} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.iconButton}>
        <Ionicons name="search-outline" size={24} color={theme.text} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.iconButton}>
        <Ionicons name="filter-outline" size={24} color={theme.text} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.iconButton}>
        <MaterialCommunityIcons name="dots-vertical" size={26} color={theme.text} />
      </TouchableOpacity>
    </View>
  </View>
);

const MonthSelector = () => (
  <View style={styles.monthSelector}>
    <TouchableOpacity style={styles.monthArrow}>
      <Ionicons name="chevron-back" size={20} color={theme.textMuted} />
    </TouchableOpacity>
    <Text style={styles.monthText}>Fevereiro</Text>
    <TouchableOpacity style={styles.monthArrow}>
      <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
    </TouchableOpacity>
  </View>
);

const SummaryCard = () => (
  <View style={styles.summaryCard}>
    <View style={styles.summaryItem}>
      <Text style={styles.summaryLabel}>Final do mês</Text>
      <Text style={[styles.summaryValue, { color: theme.danger }]}>- R$ 1.250,00</Text>
    </View>
    <View style={styles.summaryDivider} />
    <View style={styles.summaryItem}>
      <Text style={styles.summaryLabel}>Balanço mensal</Text>
      <Text style={[styles.summaryValue, { color: theme.danger }]}>- R$ 450,25</Text>
    </View>
  </View>
);

const TransactionItem = ({ item }: { item: Transaction }) => {
  const color = categoryColors[item.categoria] || theme.textMuted;
  const isEntrada = item.tipo === 'entrada';
  
  return (
    <TouchableOpacity style={styles.transactionItem}>
      {/* Ícone com fundo transparente da mesma cor */}
      <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
        <Ionicons name={item.icone} size={22} color={color} />
      </View>

      {/* Textos: Nome e Subtítulo */}
      <View style={styles.transactionDetails}>
        <Text style={styles.transactionName}>{item.nome}</Text>
        <Text style={styles.transactionSubtitle}>
          {item.categoria} • {item.conta}
        </Text>
      </View>

      {/* Valores e Status */}
      <View style={styles.transactionTrailing}>
        <Text style={[
          styles.transactionValue, 
          { color: isEntrada ? theme.success : theme.danger }
        ]}>
          {isEntrada ? '+' : '-'} R$ {item.valor.toFixed(2).replace('.', ',')}
        </Text>
        <View style={[
          styles.statusDot, 
          { backgroundColor: item.status === 'confirmado' ? theme.success : theme.danger }
        ]} />
      </View>
    </TouchableOpacity>
  );
};

// --- TELA PRINCIPAL ---

export default function TransactionsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.bg} />
      
      <Header />
      <MonthSelector />
      
      <SectionList
        sections={mockSections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        
        // Componente do Resumo Financeiro no topo da lista
        ListHeaderComponent={<SummaryCard />}
        
        // Cabeçalho da Data (ex: "Quarta, 11")
        renderSectionHeader={({ section: { title } }) => (
          <Text style={styles.sectionTitle}>{title}</Text>
        )}
        
        // Item da Transação
        renderItem={({ item }) => <TransactionItem item={item} />}
        
        // Espaçamento no final para o FAB não cobrir os itens
        ListFooterComponent={<View style={{ height: 80 }} />}
      />

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} activeOpacity={0.8}>
        <Ionicons name="add" size={32} color="#FFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// --- ESTILOS ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.text,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: 16,
  },
  // Month Selector
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
  // List Content
  listContent: {
    paddingHorizontal: 20,
  },
  // Summary Card
  summaryCard: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    flexDirection: 'row',
    padding: 20,
    marginBottom: 24,
    marginTop: 8,
    // Sombra leve para destacar no tema escuro
    elevation: 4, 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    backgroundColor: theme.border,
    marginHorizontal: 16,
  },
  summaryLabel: {
    fontSize: 12,
    color: theme.textMuted,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  // Section Title
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.textMuted,
    marginTop: 16,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  // Transaction Item
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  transactionDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  transactionName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 4,
  },
  transactionSubtitle: {
    fontSize: 12,
    color: theme.textMuted,
  },
  transactionTrailing: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  transactionValue: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  // FAB (Floating Action Button)
  fab: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    backgroundColor: theme.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
});