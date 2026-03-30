import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React from 'react';
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

const theme = {
  bg: '#0F0F12',
  surface: '#1A1A1F',
  surfaceLight: '#25252D',
  text: '#FFFFFF',
  textMuted: '#8E8E93',
  primary: '#8A2BE2',
  border: '#2C2C2E',
  danger: '#FF453A',
};

const CardItem = ({ card, onEdit, onDelete }: { card: CreditCard, onEdit: (id: string) => void, onDelete: (id: string) => void }) => {
  // Encontra o gradiente correspondente (ou usa um padrão)
  const cardGrad = ['#2C2C2E', '#000000']; // Default preto se não achar

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => onEdit(card.id)}
      style={styles.cardWrapper}
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
  );
};

export default function CardsScreen() {
  const insets = useSafeAreaInsets();
  const { cards, deleteCard } = useCardStore();

  const handleEdit = (id: string) => {
    router.push({ pathname: '/new-card', params: { id } });
  };

  const handleDelete = (id: string) => {
    Alert.alert("Excluir Cartão", "Deseja realmente excluir este cartão?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Excluir", style: "destructive", onPress: () => deleteCard(id) }
    ]);
  };

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
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  cardGradient: {
    height: 180,
    padding: 20,
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
