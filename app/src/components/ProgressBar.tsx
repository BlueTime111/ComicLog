import { StyleSheet, View } from 'react-native';

import { colors, radius } from '../theme/tokens';

type ProgressBarProps = {
  value: number;
};

export const ProgressBar = ({ value }: ProgressBarProps) => {
  const clampedValue = Math.max(0, Math.min(value, 1));

  return (
    <View style={styles.track}>
      <View style={[styles.fill, { width: `${clampedValue * 100}%` }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    backgroundColor: colors.primaryMuted,
    borderRadius: radius.sm,
    height: 4,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    backgroundColor: '#5B5D8C',
    height: '100%',
  },
});
