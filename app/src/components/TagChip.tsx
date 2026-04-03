import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '../theme/tokens';

type TagChipProps = {
  label: string;
};

export const TagChip = ({ label }: TagChipProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.tagBackground,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  label: {
    color: '#374151',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
  },
});
