import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ProgressBar } from '../../../components/ProgressBar';
import { colors, radius, spacing } from '../../../theme/tokens';
import { MyComic } from '../../../types/comic';
import { buildHomeCardSummary } from '../domain/homeCardSummary';
import { TRACKING_COVER_HEIGHT, TRACKING_COVER_WIDTH } from './homeCoverLayout';

type ComicTrackingCardProps = {
  comic: MyComic;
  progressLabelPrefix: string;
  onPress?: () => void;
};

export const ComicTrackingCard = ({ comic, onPress, progressLabelPrefix }: ComicTrackingCardProps) => {
  const statusStyle = comic.status === 'UPDATED' ? styles.updatedBadge : styles.syncedBadge;
  const summary = buildHomeCardSummary(comic.oneLineSummary);

  return (
    <Pressable onPress={onPress} style={styles.container}>
      <View style={[styles.cover, { backgroundColor: comic.coverColor }]}>
        <View style={[styles.coverAccent, { backgroundColor: comic.coverAccent }]} />
        <Text style={styles.coverText}>{comic.coverText}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.title}>{comic.title}</Text>
          <View style={[styles.badge, statusStyle]}>
            <Text style={styles.badgeText}>{comic.statusLabel ?? comic.status}</Text>
          </View>
        </View>

        <View style={styles.summarySlot}>
          {summary ? <Text numberOfLines={1} style={styles.summary}>{summary}</Text> : null}
        </View>

        <View style={styles.progressBlock}>
          <View style={styles.progressRow}>
            <Text style={styles.progressLabel}>{progressLabelPrefix}{comic.progressChapter}</Text>
            <Text style={styles.updatedAgo}>{comic.updatedAgoLabel}</Text>
          </View>
          <ProgressBar value={comic.progressRatio} />
        </View>
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
    flexDirection: 'row',
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  cover: {
    borderRadius: radius.sm,
    height: TRACKING_COVER_HEIGHT,
    justifyContent: 'flex-end',
    marginRight: spacing.md,
    overflow: 'hidden',
    width: TRACKING_COVER_WIDTH,
  },
  coverAccent: {
    height: 3,
    width: '100%',
  },
  coverText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    left: spacing.sm,
    position: 'absolute',
    top: spacing.sm,
  },
  content: {
    flex: 1,
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  title: {
    color: colors.textPrimary,
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    marginRight: spacing.sm,
  },
  badge: {
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
  },
  updatedBadge: {
    backgroundColor: colors.successBackground,
  },
  syncedBadge: {
    backgroundColor: colors.infoBackground,
  },
  badgeText: {
    color: '#35515F',
    fontSize: 12,
    fontWeight: '700',
  },
  summary: {
    color: '#4B5563',
    fontSize: 15,
    fontStyle: 'italic',
    lineHeight: 22,
  },
  summarySlot: {
    justifyContent: 'center',
    marginBottom: spacing.md,
    minHeight: 22,
  },
  progressBlock: {
    gap: spacing.sm,
  },
  progressRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    color: '#565A86',
    fontSize: 16,
    fontWeight: '700',
  },
  updatedAgo: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
});
