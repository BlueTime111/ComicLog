import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { SectionHeader } from '../components/SectionHeader';
import { resolveAppLocale } from '../i18n/locale';
import { getHomeScreenText } from '../i18n/screenText';
import { colors, spacing } from '../theme/tokens';
import { ComicTrackingCard } from '../features/home/components/ComicTrackingCard';
import { HomeTopBar } from '../features/home/components/HomeTopBar';
import { RecentlyViewedCard } from '../features/home/components/RecentlyViewedCard';
import { SegmentedControl } from '../features/home/components/SegmentedControl';
import { useHomeScreenData } from '../features/home/hooks/useHomeScreenData';
import {
  filterHomeComicsByInlineQuery,
  filterRecentlyViewedComicsByInlineQuery,
  hasInlineSearchQuery,
} from '../features/home/domain/homeInlineSearch';
import { HomeStackParamList } from '../navigation/types';

type HomeListSegment = 'tracking' | 'library';

const appLocale = resolveAppLocale(process.env.EXPO_PUBLIC_UI_LOCALE);
const text = getHomeScreenText(appLocale);

export const HomeScreen = () => {
  const [activeSegment, setActiveSegment] = useState<HomeListSegment>('tracking');
  const [inlineSearchQuery, setInlineSearchQuery] = useState('');
  const [isInlineSearchExpanded, setIsInlineSearchExpanded] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const { recentlyViewedComics, trackingComics, libraryComics, markComicAsRecentlyViewed } = useHomeScreenData();
  const segmentOptions: { key: HomeListSegment; label: string }[] = [
    { key: 'tracking', label: text.segmentTracking },
    { key: 'library', label: text.segmentLibrary },
  ];

  const hasSearchQuery = hasInlineSearchQuery(inlineSearchQuery);

  const visibleComics = useMemo(() => {
    const baseComics = activeSegment === 'tracking' ? trackingComics : libraryComics;
    return filterHomeComicsByInlineQuery(baseComics, inlineSearchQuery);
  }, [activeSegment, trackingComics, libraryComics, inlineSearchQuery]);

  const visibleRecentlyViewedComics = useMemo(() => {
    return filterRecentlyViewedComicsByInlineQuery(recentlyViewedComics, inlineSearchQuery).slice(0, 3);
  }, [recentlyViewedComics, inlineSearchQuery]);

  const handleInlineSearchCancel = () => {
    setInlineSearchQuery('');
    setIsInlineSearchExpanded(false);
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <HomeTopBar
          showActionButtons={false}
          isSearchExpanded={isInlineSearchExpanded}
          onSearchCancel={handleInlineSearchCancel}
          onSearchChange={setInlineSearchQuery}
          onSearchPress={() => setIsInlineSearchExpanded(true)}
          onSearchSubmit={(value) => {
            const query = value.trim();
            if (!query) {
              return;
            }

            navigation.navigate('Search', { initialQuery: query });
          }}
          searchCancelLabel={text.topSearchCancelButton}
          searchPlaceholder={text.topSearchPlaceholder}
          searchValue={inlineSearchQuery}
        />

        {visibleRecentlyViewedComics.length > 0 ? (
          <>
            <SectionHeader title={text.recentlyViewedTitle} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recentlyViewedList}>
              {visibleRecentlyViewedComics.map((comic) => (
                <RecentlyViewedCard
                  comic={comic}
                  key={comic.id}
                  onPress={() => {
                    markComicAsRecentlyViewed(comic.id);
                    navigation.navigate('SeriesDetail', { seriesId: comic.id });
                  }}
                />
              ))}
            </ScrollView>
          </>
        ) : null}

        <View style={styles.myComicsHeader}>
          <Text style={styles.myComicsTitle}>{text.myComicsTitle}</Text>
          <View style={styles.myComicsControls}>
            <SegmentedControl
              onChange={(value) => setActiveSegment(value)}
              options={segmentOptions}
              value={activeSegment}
            />
          </View>
        </View>

        {visibleComics.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              {hasSearchQuery ? text.inlineSearchEmptyStateText : text.emptyStateText}
            </Text>
          </View>
        ) : (
          visibleComics.map((comic) => (
            <ComicTrackingCard
              comic={comic}
              key={comic.id}
              progressLabelPrefix={text.progressLabelPrefix}
              onPress={() => {
                markComicAsRecentlyViewed(comic.id);
                navigation.navigate('SeriesDetail', { seriesId: comic.id });
              }}
            />
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
  content: {
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  recentlyViewedList: {
    marginBottom: spacing.xxl,
    marginRight: -spacing.lg,
  },
  myComicsHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  myComicsControls: {
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  myComicsTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  emptyState: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    padding: spacing.xl,
  },
  emptyStateText: {
    color: colors.textSecondary,
    fontSize: 15,
  },
});
