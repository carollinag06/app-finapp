import React, { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { theme } from '../constants/theme';

interface PillButtonProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
}

/**
 * COMPONENTE: PillButton (Botão Estilo Pílula)
 * Utilizado para seletores horizontais de opções únicas (ex: Tipo de transação, Meio de pagamento).
 */
export const PillButton = memo(({ label, isActive, onPress }: PillButtonProps) => (
  <TouchableOpacity
    style={[styles.pill, isActive && styles.pillActive]}
    onPress={onPress}
  >
    <Text style={[styles.pillText, isActive && styles.pillTextActive]}>{label}</Text>
  </TouchableOpacity>
));

PillButton.displayName = 'PillButton';

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
  },
  pillActive: {
    backgroundColor: theme.primaryOpacity,
    borderColor: theme.primary,
  },
  pillText: {
    color: theme.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  pillTextActive: {
    color: theme.primary,
    fontWeight: 'bold',
  },
});
