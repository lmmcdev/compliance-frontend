import { useState, useCallback, useMemo } from 'react';

export interface SelectionOptions<T> {
  getItemId?: (item: T) => string;
  isSelectable?: (item: T) => boolean;
  maxSelections?: number;
  onSelectionChange?: (selectedItems: T[], selectedIds: Set<string>) => void;
  onMaxSelectionsReached?: () => void;
}

export interface UseSelectionResult<T> {
  selectedIds: Set<string>;
  selectedItems: T[];
  isSelected: (item: T) => boolean;
  isAllSelected: (items: T[]) => boolean;
  isIndeterminate: (items: T[]) => boolean;
  selectItem: (item: T) => void;
  deselectItem: (item: T) => void;
  toggleItem: (item: T) => void;
  selectAll: (items: T[]) => void;
  deselectAll: () => void;
  toggleAll: (items: T[]) => void;
  selectRange: (items: T[], startIndex: number, endIndex: number) => void;
  getSelectionStats: (items: T[]) => {
    selected: number;
    total: number;
    selectable: number;
    percentage: number;
  };
  canSelectMore: boolean;
  remainingSelections: number;
  reset: () => void;
}

/**
 * Advanced selection hook with support for:
 * - Individual and bulk selection
 * - Range selection
 * - Maximum selection limits
 * - Selection filtering
 * - Performance optimization
 */
export function useSelection<T = any>(
  items: T[] = [],
  options: SelectionOptions<T> = {}
): UseSelectionResult<T> {
  const {
    getItemId = (item: any) => item.id || item.toString(),
    isSelectable = () => true,
    maxSelections,
    onSelectionChange,
    onMaxSelectionsReached,
  } = options;

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Memoized calculations
  const selectedItems = useMemo(() => {
    return items.filter(item => selectedIds.has(getItemId(item)));
  }, [items, selectedIds, getItemId]);

  // Commented out unused variable to fix TS error
  // const selectableItems = useMemo(() => {
  //   return items.filter(isSelectable);
  // }, [items, isSelectable]);

  const canSelectMore = useMemo(() => {
    if (!maxSelections) return true;
    return selectedIds.size < maxSelections;
  }, [selectedIds.size, maxSelections]);

  const remainingSelections = useMemo(() => {
    if (!maxSelections) return Infinity;
    return maxSelections - selectedIds.size;
  }, [selectedIds.size, maxSelections]);

  // Selection predicates
  const isSelected = useCallback((item: T): boolean => {
    return selectedIds.has(getItemId(item));
  }, [selectedIds, getItemId]);

  const isAllSelected = useCallback((itemsToCheck: T[]): boolean => {
    const selectableInList = itemsToCheck.filter(isSelectable);
    return selectableInList.length > 0 &&
           selectableInList.every(item => selectedIds.has(getItemId(item)));
  }, [selectedIds, getItemId, isSelectable]);

  const isIndeterminate = useCallback((itemsToCheck: T[]): boolean => {
    const selectableInList = itemsToCheck.filter(isSelectable);
    const selectedInList = selectableInList.filter(item => selectedIds.has(getItemId(item)));
    return selectedInList.length > 0 && selectedInList.length < selectableInList.length;
  }, [selectedIds, getItemId, isSelectable]);

  // Selection actions
  const selectItem = useCallback((item: T) => {
    if (!isSelectable(item)) return;

    const itemId = getItemId(item);
    if (selectedIds.has(itemId)) return;

    if (maxSelections && selectedIds.size >= maxSelections) {
      onMaxSelectionsReached?.();
      return;
    }

    setSelectedIds(prev => {
      const newSelection = new Set(prev);
      newSelection.add(itemId);

      // Trigger callback with updated selection
      const newSelectedItems = items.filter(i => newSelection.has(getItemId(i)));
      onSelectionChange?.(newSelectedItems, newSelection);

      return newSelection;
    });
  }, [items, selectedIds, getItemId, isSelectable, maxSelections, onSelectionChange, onMaxSelectionsReached]);

  const deselectItem = useCallback((item: T) => {
    const itemId = getItemId(item);
    if (!selectedIds.has(itemId)) return;

    setSelectedIds(prev => {
      const newSelection = new Set(prev);
      newSelection.delete(itemId);

      // Trigger callback with updated selection
      const newSelectedItems = items.filter(i => newSelection.has(getItemId(i)));
      onSelectionChange?.(newSelectedItems, newSelection);

      return newSelection;
    });
  }, [items, selectedIds, getItemId, onSelectionChange]);

  const toggleItem = useCallback((item: T) => {
    if (isSelected(item)) {
      deselectItem(item);
    } else {
      selectItem(item);
    }
  }, [isSelected, selectItem, deselectItem]);

  const selectAll = useCallback((itemsToSelect: T[]) => {
    const selectableInList = itemsToSelect.filter(isSelectable);

    if (maxSelections) {
      const availableSlots = maxSelections - selectedIds.size;
      if (availableSlots <= 0) {
        onMaxSelectionsReached?.();
        return;
      }
      // Take only what we can fit
      selectableInList.splice(availableSlots);
    }

    setSelectedIds(prev => {
      const newSelection = new Set(prev);
      selectableInList.forEach(item => {
        newSelection.add(getItemId(item));
      });

      // Trigger callback with updated selection
      const newSelectedItems = items.filter(i => newSelection.has(getItemId(i)));
      onSelectionChange?.(newSelectedItems, newSelection);

      return newSelection;
    });
  }, [items, selectedIds, getItemId, isSelectable, maxSelections, onSelectionChange, onMaxSelectionsReached]);

  const deselectAll = useCallback(() => {
    if (selectedIds.size === 0) return;

    setSelectedIds(new Set());
    onSelectionChange?.([], new Set());
  }, [selectedIds.size, onSelectionChange]);

  const toggleAll = useCallback((itemsToToggle: T[]) => {
    if (isAllSelected(itemsToToggle)) {
      // Deselect all items in the list
      const idsToRemove = itemsToToggle
        .filter(isSelectable)
        .map(getItemId);

      setSelectedIds(prev => {
        const newSelection = new Set(prev);
        idsToRemove.forEach(id => newSelection.delete(id));

        // Trigger callback with updated selection
        const newSelectedItems = items.filter(i => newSelection.has(getItemId(i)));
        onSelectionChange?.(newSelectedItems, newSelection);

        return newSelection;
      });
    } else {
      selectAll(itemsToToggle);
    }
  }, [items, isAllSelected, selectAll, getItemId, isSelectable, onSelectionChange]);

  const selectRange = useCallback((itemsInRange: T[], startIndex: number, endIndex: number) => {
    const start = Math.min(startIndex, endIndex);
    const end = Math.max(startIndex, endIndex);
    const rangeItems = itemsInRange.slice(start, end + 1);

    selectAll(rangeItems);
  }, [selectAll]);

  const getSelectionStats = useCallback((itemsToAnalyze: T[]) => {
    const selectableInList = itemsToAnalyze.filter(isSelectable);
    const selectedInList = selectableInList.filter(item => selectedIds.has(getItemId(item)));

    return {
      selected: selectedInList.length,
      total: itemsToAnalyze.length,
      selectable: selectableInList.length,
      percentage: selectableInList.length > 0
        ? (selectedInList.length / selectableInList.length) * 100
        : 0,
    };
  }, [selectedIds, getItemId, isSelectable]);

  const reset = useCallback(() => {
    setSelectedIds(new Set());
    onSelectionChange?.([], new Set());
  }, [onSelectionChange]);

  return {
    selectedIds,
    selectedItems,
    isSelected,
    isAllSelected,
    isIndeterminate,
    selectItem,
    deselectItem,
    toggleItem,
    selectAll,
    deselectAll,
    toggleAll,
    selectRange,
    getSelectionStats,
    canSelectMore,
    remainingSelections,
    reset,
  };
}

export default useSelection;