import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import {
  Alert,
  FlatList,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Importação das stores e interfaces para gerenciar os cartões
import { CreditCard, useCardStore } from '../../store/cardStore';
import { useTransactionStore } from '../../store/transactionStore';
import { theme } from '../../src/constants/theme';
import { styles } from './styles';

/**
 * COMPONENTE: CardItem
 * Renderiza a representação visual de um cartão de crédito.
 */
const CardItem = ({ card, onEdit, onDelete }: {
  card: CreditCard,
  onEdit: (id: string) => void,
  onDelete: (id: string) => void
}) => {
  return (
    <View style={styles.cardWrapper}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => onEdit(card.id)} // Clique no cartão abre a edição
      >
        {/* Gradiente baseado na cor escolhida para o cartão */}
        <LinearGradient
          colors={[card.color, `${card.color}99`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          <View style={styles.cardContent}>
            {/* Topo: Chip simulado e Bandeira */}
            <View style={styles.cardTop}>
              <View style={styles.cardChip}>
                <View style={styles.chipLine} />
                <View style={styles.chipLine} />
                <View style={styles.chipLine} />
              </View>
              <Text style={styles.cardBrand}>{card.brand}</Text>
            </View>

            {/* Meio: Nome e Limite */}
            <View style={styles.cardMiddle}>
              <Text style={styles.cardName}>{card.name.toUpperCase()}</Text>
              <Text style={styles.cardLimitLabel}>LIMITE TOTAL</Text>
              <Text style={styles.cardLimitValue}>
                R$ {card.credit_limit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </Text>
            </View>

            {/* Rodapé: Botão de Excluir */}
            <View style={styles.cardBottom}>
              <View style={styles.cardDates}>
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
    </View>
  );
};

/**
 * TELA: Meus Cartões (CardsScreen)
 * Lista todos os cartões cadastrados e permite adicionar novos ou gerenciar os existentes.
 */
export default function CardsScreen() {
  const insets = useSafeAreaInsets();
  const { cards, deleteCard } = useCardStore(); // Estado global dos cartões
  const transactions = useTransactionStore(state => state.transactions);

  // Navega para a tela de cadastro em modo edição
  const handleEdit = (id: string) => {
    router.push({ pathname: '/novo-cartao/index' as any, params: { id } });
  };

  // Lógica de confirmação antes de excluir o cartão
  const handleDelete = (id: string) => {
    Alert.alert("Excluir Cartão", "Deseja realmente excluir este cartão?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Excluir", style: "destructive", onPress: () => deleteCard(id) }
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* HEADER DA TELA */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meus Cartões</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/novo-cartao/index' as any)}
        >
          <Ionicons name="add" size={26} color={theme.primary} />
        </TouchableOpacity>
      </View>

      {/* LISTA DE CARTÕES (FlatList para melhor performance) */}
      <FlatList
        data={cards}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        
        // Exibido quando a lista está vazia
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="card-outline" size={64} color={theme.textMuted} />
            <Text style={styles.emptyText}>Nenhum cartão cadastrado</Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.push('/novo-cartao/index' as any)}
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
