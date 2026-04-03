import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing } from '../../../theme/tokens';
import { ReadRecap } from '../domain/recap';
import { toOptionalLayerSummary } from '../domain/chapterLayers';

type RecapCardProps = {
  recap: ReadRecap;
  title?: string;
  previousChapterPrefix?: string;
  recentThreeTitle?: string;
  sharedLayerLabel?: string;
  privateLayerLabel?: string;
};

export const RecapCard = ({
  recap,
  title = '读前回顾',
  previousChapterPrefix = '上一话',
  recentThreeTitle = '最近三话',
  sharedLayerLabel = '共享',
  privateLayerLabel = '我的',
}: RecapCardProps) => {
  if (recap.emptyHint) {
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.emptyHint}>{recap.emptyHint}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {recap.previousChapter ? (
        (() => {
          const sharedSummary = toOptionalLayerSummary(recap.previousChapter.oneLineSummary);
          const privateSummary = toOptionalLayerSummary(recap.previousChapter.privateNote);

          return (
            <View style={styles.previousBlock}>
              <Text style={styles.previousLabel}>{previousChapterPrefix}（{recap.previousChapter.number}）</Text>
              {sharedSummary ? (
                <View style={styles.layerBlock}>
                  <View style={[styles.layerBadge, styles.sharedLayerBadge]}>
                    <Text style={styles.layerBadgeText}>{sharedLayerLabel}</Text>
                  </View>
                  <Text style={styles.previousSummary}>{sharedSummary}</Text>
                </View>
              ) : null}

              {privateSummary ? (
                <View style={styles.layerBlock}>
                  <View style={[styles.layerBadge, styles.privateLayerBadge]}>
                    <Text style={styles.layerBadgeText}>{privateLayerLabel}</Text>
                  </View>
                  <Text style={styles.previousSummary}>{privateSummary}</Text>
                </View>
              ) : null}
            </View>
          );
        })()
      ) : null}

      {recap.recentThree.length > 0 ? (
        <>
          <Text style={styles.recentTitle}>{recentThreeTitle}</Text>
          <View style={styles.recentList}>
            {recap.recentThree.map((chapter) => (
              (() => {
                const sharedSummary = toOptionalLayerSummary(chapter.oneLineSummary);
                const privateSummary = toOptionalLayerSummary(chapter.privateNote);

                return (
                  <View key={chapter.id} style={styles.recentItem}>
                    <Text style={styles.recentNumber}>Ch. {chapter.number}</Text>
                    {sharedSummary ? (
                      <View style={styles.layerBlock}>
                        <View style={[styles.layerBadge, styles.sharedLayerBadge]}>
                          <Text style={styles.layerBadgeText}>{sharedLayerLabel}</Text>
                        </View>
                        <Text style={styles.recentSummary}>{sharedSummary}</Text>
                      </View>
                    ) : null}

                    {privateSummary ? (
                      <View style={styles.layerBlock}>
                        <View style={[styles.layerBadge, styles.privateLayerBadge]}>
                          <Text style={styles.layerBadgeText}>{privateLayerLabel}</Text>
                        </View>
                        <Text style={styles.recentSummary}>{privateSummary}</Text>
                      </View>
                    ) : null}
                  </View>
                );
              })()
            ))}
          </View>
        </>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  previousBlock: {
    backgroundColor: '#EEF2FF',
    borderRadius: radius.sm,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  previousLabel: {
    color: '#3C4272',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  previousSummary: {
    color: '#2D334F',
    fontSize: 15,
    lineHeight: 22,
  },
  recentTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  recentList: {
    gap: spacing.sm,
  },
  recentItem: {
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: 1,
    padding: spacing.sm,
  },
  recentNumber: {
    color: '#565A86',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  recentSummary: {
    color: '#4B5563',
    fontSize: 14,
    lineHeight: 20,
  },
  layerBlock: {
    backgroundColor: '#F8FAFC',
    borderColor: '#D9E2EF',
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
  emptyHint: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
});
