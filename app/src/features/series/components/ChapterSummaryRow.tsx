import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '../../../theme/tokens';
import { SeriesChapter } from '../domain/recap';
import { toOptionalLayerSummary } from '../domain/chapterLayers';

type ChapterSummaryRowProps = {
  chapter: SeriesChapter;
  onPress?: () => void;
  viewHint?: string;
  sharedLayerLabel?: string;
  privateLayerLabel?: string;
};

export const ChapterSummaryRow = ({
  chapter,
  onPress,
  viewHint = '查看',
  sharedLayerLabel = '共享',
  privateLayerLabel = '我的',
}: ChapterSummaryRowProps) => {
  const displayTitle =
    chapter.title === `Chapter ${chapter.number}` ? `Ch. ${chapter.number}` : `${chapter.number} · ${chapter.title}`;
  const sharedSummary = toOptionalLayerSummary(chapter.oneLineSummary);
  const privateSummary = toOptionalLayerSummary(chapter.privateNote);

  return (
    <Pressable onPress={onPress} style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.chapterMeta}>{displayTitle}</Text>
        <Text style={styles.linkHint}>{viewHint}</Text>
      </View>

      {sharedSummary ? (
        <View style={styles.layerBlock}>
          <View style={[styles.layerBadge, styles.sharedLayerBadge]}>
            <Text style={styles.layerBadgeText}>{sharedLayerLabel}</Text>
          </View>
          <Text style={styles.summary}>{sharedSummary}</Text>
        </View>
      ) : null}

      {privateSummary ? (
        <View style={styles.layerBlock}>
          <View style={[styles.layerBadge, styles.privateLayerBadge]}>
            <Text style={styles.layerBadgeText}>{privateLayerLabel}</Text>
          </View>
          <Text style={styles.summary}>{privateSummary}</Text>
        </View>
      ) : null}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chapterMeta: {
    color: '#4C5B74',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  linkHint: {
    color: '#5E6AD2',
    fontSize: 13,
    fontWeight: '700',
  },
  summary: {
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 22,
  },
  layerBlock: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    borderRadius: radius.sm,
    borderWidth: 1,
    marginTop: spacing.xs,
    padding: spacing.sm,
  },
  layerBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  sharedLayerBadge: {
    backgroundColor: '#E2E8F0',
  },
  privateLayerBadge: {
    backgroundColor: '#E0E7FF',
  },
  layerBadgeText: {
    color: '#334155',
    fontSize: 11,
    fontWeight: '700',
  },
});
