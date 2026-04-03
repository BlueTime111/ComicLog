import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '../../../theme/tokens';
import { RecentlyViewedComic } from '../../../types/comic';
import { RECENTLY_VIEWED_CARD_WIDTH, RECENTLY_VIEWED_COVER_ASPECT_RATIO } from './homeCoverLayout';

type RecentlyViewedCardProps = {
  comic: RecentlyViewedComic;
  onPress?: () => void;
};

export const RecentlyViewedCard = ({ comic, onPress }: RecentlyViewedCardProps) => {
  return (
    <Pressable onPress={onPress} style={styles.container}>
      <View style={[styles.cover, { backgroundColor: comic.coverColor }]}>
        <View style={[styles.coverAccent, { backgroundColor: comic.coverAccent }]} />
        <Text style={styles.coverText}>{comic.coverText}</Text>
      </View>
      <View style={styles.titleRow}>
        <Text numberOfLines={1} style={styles.title}>
          {comic.title}
        </Text>
      </View>
      <View style={styles.metaRow}>
        <Text style={styles.chapterLabel}>{comic.chapterLabel}</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    marginRight: spacing.md,
    padding: spacing.sm,
    width: RECENTLY_VIEWED_CARD_WIDTH,
  },
  cover: {
    aspectRatio: RECENTLY_VIEWED_COVER_ASPECT_RATIO,
    borderRadius: radius.md,
    justifyContent: 'flex-end',
    marginBottom: spacing.sm,
    overflow: 'hidden',
    width: '100%',
  },
  coverAccent: {
    height: 4,
    width: '100%',
  },
  coverText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    left: spacing.sm,
    letterSpacing: 1,
    position: 'absolute',
    top: spacing.sm,
  },
  titleRow: {
    marginBottom: spacing.xs,
  },
  metaRow: {
    alignItems: 'flex-start',
    minHeight: 20,
    marginBottom: spacing.xs,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  chapterLabel: {
    color: '#565A86',
    fontSize: 14,
    fontWeight: '600',
  },
});
