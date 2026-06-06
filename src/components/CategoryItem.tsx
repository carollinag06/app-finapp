import { Ionicons } from '@expo/vector-icons';
import React, { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { theme } from '../constants/theme';
import { Category } from '../../store/categoryStore';

interface CategoryItemProps {
  cat: Category;
  isSelected: boolean;
  onPress: (id: string) => void;
}

/**
 * COMPONENTE: CategoryItem
 * Renderiza um botão quadrado para seleção de categoria.
 * Utiliza 'memo' para evitar re-renderizações desnecessárias durante a digitação de valores.
 */
export const CategoryItem = memo(({ cat, isSelected, onPress }: CategoryItemProps) => {
  const catColor = cat.color || theme.textMuted;
  return (
    <TouchableOpacity
      style={[
        styles.categoryCard,
        // Aplica destaque visual (cor de fundo e borda) quando selecionado
        isSelected && { backgroundColor: `${catColor}20`, borderColor: catColor }
      ]}
      onPress={() => onPress(cat.id)}
    >
      <Ionicons
        name={cat.icon as any}
        size={28}
        color={isSelected ? catColor : theme.textMuted}
        style={styles.categoryIcon}
      />
      <Text style={[styles.categoryText, isSelected && { color: catColor }]}>
        {cat.name}
      </Text>
    </TouchableOpacity>
  );
});

CategoryItem.displayName = 'CategoryItem';

const styles = StyleSheet.create({
  categoryCard: {
    width: '23%', // Ajuste para caber aproximadamente 4 itens por linha
    aspectRatio: 1, // Mantém o formato quadrado
    backgroundColor: theme.surface,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  categoryIcon: {
    marginBottom: 6,
  },
  categoryText: {
    color: theme.textMuted,
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },
});
