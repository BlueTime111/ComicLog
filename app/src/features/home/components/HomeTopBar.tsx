import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { colors, spacing } from '../../../theme/tokens';
import { createTopBarButtonStyle, createTopBarButtonTextStyle } from './homeTopBarButtons';

type HomeTopBarProps = {
  showActionButtons?: boolean;
  isSearchExpanded?: boolean;
  searchValue?: string;
  searchPlaceholder?: string;
  searchCancelLabel?: string;
  onSearchPress?: () => void;
  onSearchChange?: (value: string) => void;
  onSearchCancel?: () => void;
  onSearchSubmit?: (value: string) => void;
  onImportPress?: () => void;
  onCreatePress?: () => void;
  importLabel?: string;
  createLabel?: string;
};

export const HomeTopBar = ({
  showActionButtons = true,
  isSearchExpanded = false,
  searchValue = '',
  searchPlaceholder = 'Search',
  searchCancelLabel = 'Cancel',
  onSearchPress,
  onSearchChange,
  onSearchCancel,
  onSearchSubmit,
  onImportPress,
  onCreatePress,
  importLabel = 'IMPORT',
  createLabel = 'NEW',
}: HomeTopBarProps) => {
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!isSearchExpanded) {
      return;
    }

    const id = setTimeout(() => {
      inputRef.current?.focus();
    }, 0);

    return () => clearTimeout(id);
  }, [isSearchExpanded]);

  return (
    <View style={styles.container}>
      <View style={styles.leftGroup}>
        {isSearchExpanded ? (
          <View style={styles.searchInputWrapper}>
            <Ionicons color={colors.primary} name="search-outline" size={20} />
            <TextInput
              onChangeText={onSearchChange}
              onSubmitEditing={() => onSearchSubmit?.(searchValue)}
              placeholder={searchPlaceholder}
              placeholderTextColor="#94A3B8"
              ref={inputRef}
              returnKeyType="search"
              style={styles.searchInput}
              value={searchValue}
            />
            {searchValue.trim() ? (
              <TouchableOpacity onPress={() => onSearchChange?.('')} style={styles.clearButton}>
                <Ionicons color="#94A3B8" name="close-circle" size={18} />
              </TouchableOpacity>
            ) : null}
          </View>
        ) : (
          <TouchableOpacity onPress={onSearchPress} style={styles.searchButton}>
            <Ionicons color={colors.primary} name="search-outline" size={30} />
          </TouchableOpacity>
        )}
      </View>
      {isSearchExpanded ? (
        <TouchableOpacity onPress={onSearchCancel} style={styles.cancelButton}>
          <Text style={styles.cancelText}>{searchCancelLabel}</Text>
        </TouchableOpacity>
      ) : showActionButtons ? (
        <View style={styles.rightGroup}>
          <TouchableOpacity onPress={onCreatePress} style={[styles.createButton, styles.buttonSpacing]}>
            <Text style={styles.createText}>{createLabel}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onImportPress} style={styles.importButton}>
            <Text style={styles.importText}>{importLabel}</Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xxl,
  },
  leftGroup: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
    gap: spacing.sm,
    marginRight: spacing.sm,
  },
  searchButton: {
    padding: spacing.xs,
  },
  searchInputWrapper: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    minHeight: 40,
    paddingHorizontal: spacing.sm,
  },
  searchInput: {
    color: colors.textPrimary,
    flex: 1,
    fontSize: 14,
    marginLeft: spacing.xs,
    paddingVertical: spacing.xs,
  },
  clearButton: {
    paddingHorizontal: 2,
    paddingVertical: 2,
  },
  rightGroup: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  cancelButton: {
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  cancelText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  brand: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  buttonSpacing: {
    marginRight: spacing.sm,
  },
  createButton: {
    ...createTopBarButtonStyle('secondary'),
  },
  createText: {
    ...createTopBarButtonTextStyle('secondary'),
  },
  importButton: {
    ...createTopBarButtonStyle('primary'),
  },
  importText: {
    ...createTopBarButtonTextStyle('primary'),
  },
});
