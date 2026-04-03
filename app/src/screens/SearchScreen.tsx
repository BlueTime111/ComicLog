import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { resolveAppLocale } from '../i18n/locale';
import { getSearchScreenText } from '../i18n/screenText';
import { HomeStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme/tokens';
import { useSearchScreenData } from '../features/search/hooks/useSearchScreenData';
import { SearchMatchField } from '../features/search/domain/searchReadSummaries';
import { formScrollProps } from '../ui/formScrollProps';

type Props = NativeStackScreenProps<HomeStackParamList, 'Search'>;

const appLocale = resolveAppLocale(process.env.EXPO_PUBLIC_UI_LOCALE);
const text = getSearchScreenText(appLocale);

const SEARCH_MATCH_FIELD_TEXT: Record<SearchMatchField, string> = {
  seriesTitle: text.matchedFieldSeriesTitle,
  chapterNumber: text.matchedFieldChapterNumber,
  chapterTitle: text.matchedFieldChapterTitle,
  summary: text.matchedFieldSummary,
  tag: text.matchedFieldTag,
};

export const SearchScreen = ({ navigation, route }: Props) => {
  const initialQuery = useMemo(() => route.params?.initialQuery?.trim() ?? '', [route.params?.initialQuery]);
  const [query, setQuery] = useState(initialQuery);
  const { isLoading, results } = useSearchScreenData(query);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView
        {...formScrollProps}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{text.title}</Text>
        <Text style={styles.description}>{text.description}</Text>

        <TextInput
          onChangeText={setQuery}
          placeholder={text.inputPlaceholder}
          placeholderTextColor="#94A3B8"
          style={styles.input}
          value={query}
        />

        {isLoading ? <Text style={styles.hint}>{text.loadingHint}</Text> : null}

        {!isLoading && query.trim() && results.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>{text.emptyTitle}</Text>
            <Text style={styles.emptyDescription}>{text.emptyDescription}</Text>
          </View>
        ) : null}

        {results.map((item) => (
          <Pressable
            key={item.chapterId}
            onPress={() => navigation.navigate('ChapterDetail', { seriesId: item.seriesId, chapterId: item.chapterId })}
            style={styles.resultCard}
          >
            <Text style={styles.resultSeries}>{item.seriesTitle}</Text>
            <Text style={styles.resultMeta}>
              Ch. {item.chapterNumber} · {item.chapterTitle}
            </Text>
            <View style={styles.resultMatchedFieldsRow}>
              <Text style={styles.resultMatchedLabel}>{text.matchedFieldsPrefix}</Text>
              <View style={styles.resultMatchedFieldList}>
                {item.matchedFields.map((field) => (
                  <View key={`${item.chapterId}-${field}`} style={styles.resultMatchedFieldChip}>
                    <Text style={styles.resultMatchedFieldChipText}>{SEARCH_MATCH_FIELD_TEXT[field]}</Text>
                  </View>
                ))}
              </View>
            </View>
            <Text style={styles.resultSummary}>{item.summary}</Text>
          </Pressable>
        ))}
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
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  description: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    color: colors.textPrimary,
    fontSize: 14,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  hint: {
    color: colors.textSecondary,
    fontSize: 13,
    marginBottom: spacing.sm,
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
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
    fontSize: 13,
  },
  resultCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    marginTop: spacing.sm,
    padding: spacing.md,
  },
  resultSeries: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  resultMeta: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  resultMatchedFieldsRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.xs,
  },
  resultMatchedLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginRight: spacing.xs,
  },
  resultMatchedFieldList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  resultMatchedFieldChip: {
    backgroundColor: '#E2E8F0',
    borderRadius: radius.sm,
    marginBottom: spacing.xs,
    marginRight: spacing.xs,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  resultMatchedFieldChipText: {
    color: '#334155',
    fontSize: 11,
    fontWeight: '600',
  },
  resultSummary: {
    color: '#334155',
    fontSize: 14,
    lineHeight: 20,
  },
});
