import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { createTopBarButtonStyle, createTopBarButtonTextStyle } from '../features/home/components/homeTopBarButtons';
import { formatLibraryOpenedAt } from '../features/library/domain/formatLibraryOpenedAt';
import {
  getLibraryCreateRoute,
  getLibraryImportRoute,
  getLibrarySeriesDetailRoute,
} from '../features/library/domain/libraryNavigationRoutes';
import { LibrarySortOrder, sortLibrarySeriesByOpenedAt } from '../features/library/domain/librarySeriesSort';
import { useLibraryScreenData } from '../features/library/hooks/useLibraryScreenData';
import { resolveAppLocale } from '../i18n/locale';
import { getLibraryScreenText } from '../i18n/screenText';
import { LibraryStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme/tokens';

const appLocale = resolveAppLocale(process.env.EXPO_PUBLIC_UI_LOCALE);
const text = getLibraryScreenText(appLocale);

export const LibraryScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<LibraryStackParamList>>();
  const [sortOrder, setSortOrder] = useState<LibrarySortOrder>('recent_first');
  const { isLoading, seriesList, openedAtBySeriesId } = useLibraryScreenData();

  const sortedSeriesList = useMemo(() => {
    return sortLibrarySeriesByOpenedAt(seriesList, openedAtBySeriesId, sortOrder);
  }, [seriesList, openedAtBySeriesId, sortOrder]);

  const sortLabel = sortOrder === 'recent_first' ? text.sortRecentFirst : text.sortOldestFirst;

  const handleCreatePress = () => {
    const route = getLibraryCreateRoute();
    navigation.navigate(route.name, route.params);
  };

  const handleImportPress = () => {
    const route = getLibraryImportRoute();
    navigation.navigate(route.name, route.params);
  };

  const handleSeriesPress = (seriesId: string) => {
    const route = getLibrarySeriesDetailRoute(seriesId);
    navigation.navigate(route.name, route.params);
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{text.title}</Text>
          <View style={styles.actionsRow}>
            <Pressable onPress={handleCreatePress} style={[styles.createButton, styles.actionSpacing]}>
              <Text style={styles.createText}>{text.createButton}</Text>
            </Pressable>
            <Pressable onPress={handleImportPress} style={styles.importButton}>
              <Text style={styles.importText}>{text.importButton}</Text>
            </Pressable>
          </View>
        </View>
        <Text style={styles.description}>{text.description(seriesList.length)}</Text>
        {!isLoading && sortedSeriesList.length > 0 ? (
          <View style={styles.sortRow}>
            <Pressable
              onPress={() => setSortOrder((current) => (current === 'recent_first' ? 'oldest_first' : 'recent_first'))}
              style={styles.sortButton}
            >
              <Ionicons color={colors.textSecondary} name="swap-vertical-outline" size={14} />
              <Text style={styles.sortButtonText}>{sortLabel}</Text>
            </Pressable>
          </View>
        ) : null}

        {isLoading ? (
          <Text style={styles.hint}>{text.loadingHint}</Text>
        ) : seriesList.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>{text.emptyTitle}</Text>
            <Text style={styles.emptyDescription}>{text.emptyDescription}</Text>
            <Pressable onPress={handleCreatePress} style={styles.emptyCreateButton}>
              <Text style={styles.emptyCreateButtonText}>{text.emptyCreateButton}</Text>
            </Pressable>
          </View>
        ) : (
          sortedSeriesList.map((series) => (
            <Pressable
              key={series.id}
              style={styles.seriesCard}
              onPress={() => handleSeriesPress(series.id)}
            >
              <View style={styles.seriesHeader}>
                <Text style={styles.seriesTitle}>{series.title}</Text>
                <Text style={styles.seriesMeta}>
                  {series.chapters.length} {text.chapterCountLabel}
                </Text>
              </View>
              <View style={styles.seriesFooter}>
                <Text style={styles.seriesSubMeta}>
                  {text.lastReadPrefix}{series.lastReadChapterNumber}
                </Text>
                <Text style={styles.seriesOpenedAt}>
                  {formatLibraryOpenedAt(openedAtBySeriesId[series.id])}
                </Text>
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
  },
  container: {
    paddingBottom: spacing.xxl,
    padding: spacing.lg,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
  },
  actionsRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  actionSpacing: {
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
  description: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  sortRow: {
    alignItems: 'flex-end',
    marginBottom: spacing.md,
  },
  sortButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  sortButtonText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  hint: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: spacing.sm,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: spacing.md,
    padding: spacing.md,
  },
  emptyTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  emptyDescription: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: spacing.sm,
  },
  emptyCreateButton: {
    alignItems: 'center',
    borderColor: '#A5B4FC',
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: spacing.sm,
  },
  emptyCreateButtonText: {
    color: '#4338CA',
    fontSize: 13,
    fontWeight: '700',
  },
  seriesCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  seriesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  seriesTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  seriesMeta: {
    color: '#4C5B74',
    fontSize: 13,
    fontWeight: '700',
  },
  seriesSubMeta: {
    color: '#64748B',
    fontSize: 12,
  },
  seriesFooter: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  seriesOpenedAt: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
});
