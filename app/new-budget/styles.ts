import { StyleSheet, Platform } from 'react-native';
import { theme } from '../../src/constants/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.text,
    letterSpacing: -0.5,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  valueContainer: {
    alignItems: 'center',
    marginBottom: 32,
    backgroundColor: theme.surface,
    paddingVertical: 32,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.border,
  },
  valueLabel: {
    color: theme.textMuted,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  valueInputWrapper: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 8,
    opacity: 0.8,
  },
  displayValueText: {
    fontSize: 54,
    fontWeight: 'bold',
    letterSpacing: -1,
  },
  hiddenInputWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
  helperText: {
    color: theme.textMuted,
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  label: {
    color: theme.text,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: '31%',
    aspectRatio: 1,
    backgroundColor: theme.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  categoryText: {
    color: theme.textMuted,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 8,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  saveButton: {
    height: 60,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  danger: {
    color: '#FF453A',
  }
});
