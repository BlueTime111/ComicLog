import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TagChip } from '../components/TagChip';
import { resolveAppLocale } from '../i18n/locale';
import { getChapterDetailText } from '../i18n/screenText';
import { HomeStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme/tokens';
import { useChapterDetailData } from '../features/series/hooks/useChapterDetailData';
import {
  toOptionalLayerSummary,
  toSharedDraftValue,
  toSharedSummaryUpdateValue,
} from '../features/series/domain/chapterLayers';
import { formScrollProps } from '../ui/formScrollProps';

type Props = NativeStackScreenProps<HomeStackParamList, 'ChapterDetail'>;

const appLocale = resolveAppLocale(process.env.EXPO_PUBLIC_UI_LOCALE);
const text = getChapterDetailText(appLocale);

export const ChapterDetailScreen = ({ route }: Props) => {
  const { seriesId, chapterId } = route.params;
  const { isLoading, isSaving, seriesTitle, chapter, layers, saveChapterSummary, setChapterRead } = useChapterDetailData(
    seriesId,
    chapterId,
  );
  const [sharedDraft, setSharedDraft] = useState('');
  const [privateDraft, setPrivateDraft] = useState('');
  const [saveHint, setSaveHint] = useState<string | null>(null);
  const previewSharedSummary = chapter ? toOptionalLayerSummary(chapter.oneLineSummary) : null;
  const previewPrivateSummary = chapter ? toOptionalLayerSummary(chapter.privateNote) : null;

  useEffect(() => {
    if (!chapter) {
      return;
    }

    setSharedDraft(toSharedDraftValue(chapter.oneLineSummary));
    setPrivateDraft(chapter.privateNote ?? '');
  }, [chapter]);

  const handleSave = async () => {
    if (!chapter) {
      return;
    }

    const nextSharedSummary = toSharedSummaryUpdateValue(sharedDraft);
    const changed = await saveChapterSummary(nextSharedSummary, privateDraft);

    setSaveHint(changed ? text.saveSuccess : text.saveNoChanges);
  };

  const handleToggleRead = async () => {
    if (!chapter) {
      return;
    }

    const success = await setChapterRead(!chapter.isRead);
    setSaveHint(success ? null : text.readStatusToggleFailed);
  };

  if (isLoading) {
    return (
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.centerBox}>
          <Text style={styles.hintText}>{text.loadingChapter}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!chapter || !layers) {
    return (
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.centerBox}>
          <Text style={styles.notFoundTitle}>{text.notFoundTitle}</Text>
          <Text style={styles.hintText}>{text.notFoundHint}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView
        {...formScrollProps}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.seriesTitle}>{seriesTitle ?? 'Series'}</Text>
        <Text style={styles.chapterTitle}>
          {chapter.title === `Chapter ${chapter.number}` ? `Ch. ${chapter.number}` : `${chapter.number} · ${chapter.title}`}
        </Text>

        <View style={styles.card}>
          <Pressable hitSlop={6} onPress={handleToggleRead} style={styles.toggleRow}>
            <View style={[styles.checkbox, chapter.isRead && styles.checkboxChecked]}>
              {chapter.isRead ? <Text style={styles.checkboxTick}>✓</Text> : null}
            </View>
            <Text style={styles.toggleLabel}>
              {chapter.isRead ? text.readStatusCheckedLabel : text.readStatusUncheckedLabel}
            </Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{text.sharedSummaryTitle}</Text>
          <TextInput
            multiline
            onChangeText={setSharedDraft}
            placeholder={text.sharedPlaceholder}
            placeholderTextColor="#94A3B8"
            style={styles.input}
            value={sharedDraft}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{text.privateNotesTitle}</Text>
          <TextInput
            multiline
            onChangeText={setPrivateDraft}
            placeholder={text.privatePlaceholder}
            placeholderTextColor="#94A3B8"
            style={styles.inputMuted}
            value={privateDraft}
          />
          {layers.privateTags.length > 0 ? (
            <View style={styles.tagsRow}>
              {layers.privateTags.map((tag) => (
                <TagChip key={tag} label={tag} />
              ))}
            </View>
          ) : null}

          <Pressable onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>{isSaving ? text.saveButtonSaving : text.saveButtonIdle}</Text>
          </Pressable>
          {saveHint ? <Text style={styles.saveHint}>{saveHint}</Text> : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{text.combinedPreviewTitle}</Text>
          <Text style={styles.previewHint}>{text.combinedPreviewHint}</Text>

          {previewSharedSummary ? (
            <View style={styles.previewSection}>
              <View style={styles.previewSectionHeader}>
                <View style={[styles.previewBadge, styles.previewBadgeShared]}>
                  <Text style={styles.previewBadgeText}>{text.previewSharedLabel}</Text>
                </View>
              </View>
              <Text style={styles.cardBody}>{previewSharedSummary}</Text>
            </View>
          ) : null}

          {previewPrivateSummary ? (
            <View style={styles.previewSection}>
              <View style={styles.previewSectionHeader}>
                <View style={[styles.previewBadge, styles.previewBadgePrivate]}>
                  <Text style={styles.previewBadgeText}>{text.previewPrivateLabel}</Text>
                </View>
              </View>
              <Text style={styles.cardBody}>{previewPrivateSummary}</Text>
            </View>
          ) : null}
        </View>
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
  centerBox: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  hintText: {
    color: colors.textSecondary,
    fontSize: 15,
    textAlign: 'center',
  },
  notFoundTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  seriesTitle: {
    color: '#4C5B74',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  chapterTitle: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  cardBody: {
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 22,
  },
  cardBodyMuted: {
    color: '#4B5563',
    fontSize: 15,
    lineHeight: 22,
  },
  previewHint: {
    color: '#64748B',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  previewSection: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    borderRadius: radius.sm,
    borderWidth: 1,
    marginTop: spacing.sm,
    padding: spacing.sm,
  },
  previewSectionHeader: {
    marginBottom: spacing.xs,
  },
  previewBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  previewBadgeShared: {
    backgroundColor: '#E2E8F0',
  },
  previewBadgePrivate: {
    backgroundColor: '#E0E7FF',
  },
  previewBadgeText: {
    color: '#334155',
    fontSize: 11,
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    borderRadius: radius.sm,
    borderWidth: 1,
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 22,
    minHeight: 88,
    padding: spacing.sm,
    textAlignVertical: 'top',
  },
  inputMuted: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    borderRadius: radius.sm,
    borderWidth: 1,
    color: '#4B5563',
    fontSize: 15,
    lineHeight: 22,
    minHeight: 88,
    padding: spacing.sm,
    textAlignVertical: 'top',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  toggleRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  checkbox: {
    alignItems: 'center',
    borderColor: '#94A3B8',
    borderRadius: 4,
    borderWidth: 1,
    height: 20,
    justifyContent: 'center',
    marginRight: spacing.sm,
    width: 20,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxTick: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  toggleLabel: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '700',
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  saveHint: {
    color: '#475569',
    fontSize: 12,
    marginTop: spacing.sm,
  },
});
