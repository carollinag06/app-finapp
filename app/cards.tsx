import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CreditCard, useCardStore } from '../store/cardStore';
import { useTransactionStore } from '../store/transactionStore';

const theme = {
  bg: '#0F0F12',
  surface: '#1A1A1F',
  surfaceLight: '#25252D',
  text: '#FFFFFF',
  textMuted: '#8E8E93',
  primary: '#8A2BE2',
  border: '#2C2C2E',
  danger: '#FF453A',
  warning: '#FFD740',
};

const CardItem = ({ card, onEdit, onDelete, closingAlert, dueAlert }: {
  card: CreditCard,
  onEdit: (id: string) => void,
  onDelete: (id: string) => void,
  closingAlert?: { days: number },
  dueAlert?: { days: number }
}) => {
  return (
    <View style={styles.cardWrapper}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => onEdit(card.id)}
      >
        <LinearGradient
          colors={[card.color, `${card.color}99`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          <View style={styles.cardContent}>
            <View style={styles.cardTop}>
              <View style={styles.cardChip}>
                <View style={styles.chipLine} />
                <View style={styles.chipLine} />
                <View style={styles.chipLine} />
              </View>
              <Text style={styles.cardBrand}>{card.brand}</Text>
            </View>

            <View style={styles.cardMiddle}>
              <Text style={styles.cardName}>{card.name.toUpperCase()}</Text>
              <Text style={styles.cardLimitLabel}>LIMITE TOTAL</Text>
              <Text style={styles.cardLimitValue}>
                R$ {card.credit_limit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </Text>
            </View>

            <View style={styles.cardBottom}>
              <View style={styles.cardDates}>
                <View style={styles.dateInfo}>
                  <Text style={styles.dateLabel}>FECHA</Text>
                  <Text style={styles.dateValue}>{card.closing_day.toString().padStart(2, '0')}</Text>
                </View>
                <View style={styles.dateInfo}>
                  <Text style={styles.dateLabel}>VENCE</Text>
                  <Text style={styles.dateValue}>{card.due_day.toString().padStart(2, '0')}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.deleteIconButton}
                onPress={() => onDelete(card.id)}
              >
                <Ionicons name="trash-outline" size={20} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {/* Alertas */}
      {(closingAlert || dueAlert) && (
        <View style={styles.alertsContainer}>
          {closingAlert && (
            <View style={[styles.cardAlert, { backgroundColor: 'rgba(255, 215, 64, 0.1)', borderColor: 'rgba(255, 215, 64, 0.3)' }]}>
              <MaterialCommunityIcons name="lock-open-outline" size={16} color={theme.warning} />
              <Text style={styles.cardAlertText}>
                Fatura fecha em {closingAlert.days === 0 ? 'HOJE' : closingAlert.days === 1 ? '1 dia' : `${closingAlert.days} dias`}
              </Text>
            </View>
          )}
          {dueAlert && (
            <View style={[styles.cardAlert, { backgroundColor: 'rgba(255, 69, 58, 0.1)', borderColor: 'rgba(255, 69, 58, 0.3)' }]}>
              <Ionicons name="warning-outline" size={16} color={theme.danger} />
              <Text style={styles.cardAlertText}>
                Fatura vence em {dueAlert.days === 0 ? 'HOJE' : dueAlert.days === 1 ? '1 dia' : `${dueAlert.days} dias`}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default function CardsScreen() {
  const insets = useSafeAreaInsets();
  const { cards, deleteCard, isInvoicePaid, paidInvoices } = useCardStore();
  const transactions = useTransactionStore(state => state.transactions);

  const handleEdit = (id: string) => {
    router.push({ pathname: '/new-card', params: { id } });
  };

  const handleDelete = (id: string) => {
    Alert.alert("Excluir Cartão", "Deseja realmente excluir este cartão?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Excluir", style: "destructive", onPress: () => deleteCard(id) }
    ]);
  };

  const cardAlerts = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const alerts: Record<string, { closing?: { days: number }, due?: { days: number } }> = {};

    cards.forEach(card => {
      // Valor da fatura (transações de crédito do cartão no mês atual)
      const invoiceValue = transactions
        .filter(t => t.cardId === card.id && t.paymentMethod === 'credit')
        .reduce((acc, t) => acc + t.value, 0);

      if (invoiceValue === 0) return;

      alerts[card.id] = {};

      // 1. Alerta de Fechamento
      const closingDate = new Date(currentYear, currentMonth, card.closing_day);
      if (closingDate < today && today.getDate() > card.closing_day) {
        closingDate.setMonth(closingDate.getMonth() + 1);
      }
      const diffDaysClosing = Math.ceil((closingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDaysClosing === 0) {
        alerts[card.id].closing = { days: diffDaysClosing };
      }

      // 2. Alerta de Vencimento
      if (!isInvoicePaid(card.id, currentMonth, currentYear)) {
        const dueDate = new Date(currentYear, currentMonth, card.due_day);
        if (dueDate < today && today.getDate() > card.due_day) {
          dueDate.setMonth(dueDate.getMonth() + 1);
        }
        const diffDaysDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDaysDue >= 0 && diffDaysDue <= 3) {
          alerts[card.id].due = { days: diffDaysDue };
        }
      }
    });

    return alerts;
  }, [cards, transactions, isInvoicePaid, paidInvoices]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meus Cartões</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/new-card')}
        >
          <Ionicons name="add" size={26} color={theme.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={cards}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="card-outline" size={64} color={theme.textMuted} />
            <Text style={styles.emptyText}>Nenhum cartão cadastrado</Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.push('/new-card')}
            >
              <Text style={styles.emptyButtonText}>Cadastrar Primeiro Cartão</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <CardItem
            card={item}
            onEdit={handleEdit}
            onDelete={handleDelete}
            closingAlert={cardAlerts[item.id]?.closing}
            dueAlert={cardAlerts[item.id]?.due}
          />
        )}
      />
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.text,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },
  cardWrapper: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: theme.surface,
  },
  cardGradient: {
    height: 180,
    padding: 20,
    borderRadius: 20,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardChip: {
    width: 35,
    height: 25,
    backgroundColor: 'rgba(255,215,0,0.6)',
    borderRadius: 4,
    padding: 4,
    justifyContent: 'space-around',
  },
  chipLine: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  cardBrand: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    opacity: 0.8,
  },
  cardMiddle: {
    marginTop: 5,
  },
  cardName: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 1,
    marginBottom: 8,
    opacity: 0.9,
  },
  cardLimitLabel: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: 'bold',
    opacity: 0.7,
    letterSpacing: 1,
  },
  cardLimitValue: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardDates: {
    flexDirection: 'row',
    gap: 15,
  },
  dateInfo: {
    alignItems: 'flex-start',
  },
  dateLabel: {
    color: '#FFF',
    fontSize: 7,
    fontWeight: 'bold',
    opacity: 0.6,
  },
  dateValue: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  deleteIconButton: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 10,
  },
  // Alerts
  alertsContainer: {
    padding: 12,
    gap: 8,
  },
  cardAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  cardAlertText: {
    color: theme.text,
    fontSize: 12,
    fontWeight: '500',
  },
  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    color: theme.textMuted,
    fontSize: 16,
    marginTop: 15,
    marginBottom: 25,
  },
  emptyButton: {
    backgroundColor: theme.primary,
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 15,
  },
  emptyButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
