import React, { memo } from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { theme } from '../constants/theme';

interface PillButtonProps {
  label: string;
  isActive: boolean;
  onPress: () => void;
}

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
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.surfaceLight,
    marginRight: 8,
    borderWidth: 1,
    borderColor: theme.border,
  },
  pillActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  pillText: {
    color: theme.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
  pillTextActive: {
    color: theme.text,
    fontWeight: 'bold',
  },
});
