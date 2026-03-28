import { Feather, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBudgetStore, BudgetGoal } from '../../store/budgetStore';
import { useTransactionStore } from '../../store/transactionStore';

const screenWidth = Dimensions.get('window').width;
const MAX_WIDTH = 600;

const theme = {
  bg: '#0F0F12',
  surface: '#1A1A1F',
  surfaceLight: '#25252D',
  text: '#FFFFFF',
  textMuted: '#8E8E93',
  primary: '#8A2BE2',
  primaryLight: 'rgba(138, 43, 226, 0.15)',
  success: '#32D74B',
  danger: '#FF453A',
  border: '#2C2C2E',
};

const Header = () => (
  <View style={styles.header}>
    <View>
      <Text style={styles.headerSubtitle}>Metas e</Text>
      <Text style={styles.headerTitle}>Orçamentos</Text>
    </View>
    <TouchableOpacity style={styles.addGoalButton} onPress={() => router.push('/new-budget')}>
      <Ionicons name="add" size={24} color="#FFF" />
    </TouchableOpacity>
  </View>
);

const BudgetCard = ({ goal, spent }: { goal: BudgetGoal; spent: number }) => {
  const percentage = Math.min((spent / goal.amount) * 100, 100);
  const isOverBudget = spent > goal.amount;
  const remaining = goal.amount - spent;

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={[styles.iconBg, { backgroundColor: `${goal.color}20` }]}>
          <Ionicons name={(goal.icon as any) || 'wallet-outline'} size={22} color={goal.color} />
        </View>
        <View style={styles.cardTitleContainer}>
          <Text style={styles.cardCategory}>{goal.category}</Text>
          <Text style={styles.cardAmount}>R$ {spent.toLocaleString('pt-BR')} / R$ {goal.amount.toLocaleString('pt-BR')}</Text>
        </View>
        <TouchableOpacity onPress={() => router.push({ pathname: '/new-budget', params: { id: goal.id } })}>
          <Feather name="edit-2" size={16} color={theme.textMuted} />
        </TouchableOpacity>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBarBg}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${percentage}%`, backgroundColor: isOverBudget ? theme.danger : goal.color }
            ]}
          />
        </View>
        <View style={styles.progressLabels}>
          <Text style={styles.progressPercent}>{percentage.toFixed(0)}% utilizado</Text>
          <Text style={[styles.remainingText, isOverBudget && { color: theme.danger }]}>
            {isOverBudget ? `Excedeu R$ ${Math.abs(remaining).toLocaleString('pt-BR')}` : `Resta R$ ${remaining.toLocaleString('pt-BR')}`}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default function BudgetScreen() {
  const insets = useSafeAreaInsets();
  const budgets = useBudgetStore((state) => state.budgets);
  const transactions = useTransactionStore((state) => state.transactions);

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  // Filtrar gastos do mês atual por categoria
  const monthlyExpenses = useMemo(() => {
    const expenses: Record<string, number> = {};
    transactions.forEach(t => {
      if (t.type === 'expense') {
        const transactionDate = t.date.includes('/')
          ? (() => { const [d, m, y] = t.date.split('/').map(Number); return new Date(y, m - 1, d); })()
          : new Date(t.date);

        if (transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear) {
          expenses[t.category] = (expenses[t.category] || 0) + t.value;
        }
      }
    });
    return expenses;
  }, [transactions, currentMonth, currentYear]);

  const totalBudgeted = budgets.reduce((acc, b) => acc + b.amount, 0);
  const totalSpentInBudgets = budgets.reduce((acc, b) => acc + (monthlyExpenses[b.category] || 0), 0);
  const overallPercentage = Math.min((totalSpentInBudgets / totalBudgeted) * 100, 100);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.centeredWrapper}>
        <Header />

        <FlatList
          data={budgets}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
          ListHeaderComponent={() => (
            <>
              {/* Resumo Geral */}
              <View style={styles.summaryCard}>
                <View style={styles.summaryInfo}>
                  <View>
                    <Text style={styles.summaryLabel}>Total Orçado</Text>
                    <Text style={styles.summaryValue}>R$ {totalBudgeted.toLocaleString('pt-BR')}</Text>
                  </View>
                  <View style={styles.summaryBadge}>
                    <Text style={styles.summaryBadgeText}>Mês Atual</Text>
                  </View>
                </View>

                <View style={styles.overallProgress}>
                  <View style={styles.progressBarBgLarge}>
                    <View
                      style={[
                        styles.progressBarFill,
                        { width: `${overallPercentage}%`, backgroundColor: theme.primary }
                      ]}
                    />
                  </View>
                  <View style={styles.summaryFooter}>
                    <Text style={styles.summarySpent}>Gasto R$ {totalSpentInBudgets.toLocaleString('pt-BR')}</Text>
                    <Text style={styles.summaryRemaining}>Resta R$ {(totalBudgeted - totalSpentInBudgets).toLocaleString('pt-BR')}</Text>
                  </View>
                </View>
              </View>

              <Text style={styles.sectionTitle}>Categorias</Text>
            </>
          )}
          renderItem={({ item }) => (
            <BudgetCard goal={item} spent={monthlyExpenses[item.category] || 0} />
          )}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <Ionicons name="flag-outline" size={48} color={theme.textMuted} />
              <Text style={styles.emptyTitle}>Nenhuma meta definida</Text>
              <Text style={styles.emptySubtitle}>Defina orçamentos para controlar seus gastos por categoria.</Text>
            </View>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  centeredWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: MAX_WIDTH,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
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
  addGoalButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  summaryCard: {
    backgroundColor: theme.surface,
    borderRadius: 24,
    padding: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: theme.border,
  },
  summaryInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  summaryLabel: {
    color: theme.textMuted,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  summaryValue: {
    color: theme.text,
    fontSize: 24,
    fontWeight: 'bold',
  },
  summaryBadge: {
    backgroundColor: theme.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  summaryBadgeText: {
    color: theme.primary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  overallProgress: {
    gap: 12,
  },
  progressBarBgLarge: {
    height: 12,
    backgroundColor: theme.surfaceLight,
    borderRadius: 6,
    width: '100%',
    overflow: 'hidden',
  },
  summaryFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summarySpent: {
    color: theme.textMuted,
    fontSize: 12,
  },
  summaryRemaining: {
    color: theme.success,
    fontSize: 12,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 16,
    marginLeft: 4,
  },
  card: {
    backgroundColor: theme.surface,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.border,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconBg: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  cardCategory: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.text,
  },
  cardAmount: {
    fontSize: 13,
    color: theme.textMuted,
    marginTop: 2,
  },
  progressContainer: {
    gap: 8,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: theme.surfaceLight,
    borderRadius: 4,
    width: '100%',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressPercent: {
    fontSize: 11,
    color: theme.textMuted,
    fontWeight: '500',
  },
  remainingText: {
    fontSize: 11,
    color: theme.success,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: theme.textMuted,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 40,
  },
});
