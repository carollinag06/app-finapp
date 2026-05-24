import { StyleSheet } from 'react-native';
import { theme, MAX_WIDTH } from '../../../src/constants/theme';

export const styles = StyleSheet.create({
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
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: theme.text,
  },
  headerSubtitle: {
    fontSize: 13,
    color: theme.textMuted,
    marginTop: 2,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircleHeader: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  // Search
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 50,
    borderWidth: 1,
    borderColor: theme.border,
  },
  searchInput: {
    flex: 1,
    color: theme.text,
    fontSize: 15,
    marginLeft: 8,
  },
  backSearch: {
    marginRight: 4,
  },
  // Month Selector
  monthSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 6,
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.border,
  },
  monthArrowBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  monthText: {
    color: theme.text,
    fontSize: 15,
    fontWeight: '600',
  },
  // List Content
  listContent: {
    paddingHorizontal: 20,
  },
  // Summary Card
  summaryCard: {
    backgroundColor: theme.surface,
    borderRadius: 24,
    flexDirection: 'row',
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: theme.border,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: 1,
    height: 30,
    backgroundColor: theme.border,
    alignSelf: 'center',
  },
  summaryLabel: {
    fontSize: 11,
    color: theme.textMuted,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  // Section Title
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: theme.textMuted,
    marginTop: 20,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginLeft: 4,
  },
  // Transaction Item
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    padding: 14,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionName: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 2,
  },
  transactionSubtitle: {
    fontSize: 12,
    color: theme.textMuted,
  },
  transactionTrailing: {
    alignItems: 'flex-end',
  },
  transactionValue: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  // Modal & Filters
  filterBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.primary,
    borderWidth: 1.5,
    borderColor: theme.surface,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.bg,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: theme.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.text,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginTop: 16,
    marginBottom: 12,
  },
  filterOptionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
  },
  filterChipActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  filterChipText: {
    color: theme.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: theme.text,
    fontWeight: 'bold',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
    paddingBottom: 8,
  },
  resetButton: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  resetButtonText: {
    color: theme.textMuted,
    fontSize: 15,
    fontWeight: '600',
  },
  applyButton: {
    flex: 2,
    height: 52,
    borderRadius: 16,
    backgroundColor: theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyButtonText: {
    color: theme.text,
    fontSize: 15,
    fontWeight: 'bold',
  },
});
