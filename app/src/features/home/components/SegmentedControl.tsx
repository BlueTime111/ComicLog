import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '../../../theme/tokens';

export type SegmentOption<T extends string> = {
  key: T;
  label: string;
};

type SegmentedControlProps<T extends string> = {
  options: readonly SegmentOption<T>[];
  value: T;
  onChange: (nextValue: T) => void;
};

export const SegmentedControl = <T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) => {
  return (
    <View style={styles.container}>
      {options.map((option) => {
        const isActive = option.key === value;

        return (
          <Pressable key={option.key} onPress={() => onChange(option.key)} style={styles.optionButton}>
            <Text style={[styles.optionLabel, isActive && styles.activeOptionLabel]}>{option.label}</Text>
            <View style={[styles.indicator, isActive && styles.activeIndicator]} />
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  optionButton: {
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
  },
  optionLabel: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  activeOptionLabel: {
    color: colors.primary,
  },
  indicator: {
    backgroundColor: 'transparent',
    height: 2,
    width: '100%',
  },
  activeIndicator: {
    backgroundColor: colors.primary,
  },
});
