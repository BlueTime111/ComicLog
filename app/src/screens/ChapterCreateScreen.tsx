import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { seriesRepository } from '../data/repositories';
import { resolveAppLocale } from '../i18n/locale';
import { getChapterCreateText } from '../i18n/screenText';
import { HomeStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme/tokens';
import { formScrollProps } from '../ui/formScrollProps';

type Props = NativeStackScreenProps<HomeStackParamList, 'ChapterCreate'>;

const appLocale = resolveAppLocale(process.env.EXPO_PUBLIC_UI_LOCALE);
const text = getChapterCreateText(appLocale);

export const ChapterCreateScreen = ({ navigation, route }: Props) => {
  const { seriesId } = route.params;

  const [chapterNumber, setChapterNumber] = useState('');
  const [chapterTitle, setChapterTitle] = useState('');
  const [chapterSummary, setChapterSummary] = useState('');
  const [isRead, setIsRead] = useState(true);
  const [hint, setHint] = useState<string | null>(null);

  const handleSave = async () => {
    if (!chapterNumber.trim()) {
      setHint(text.validationFailed);
      return;
    }

    try {
      const chapterId = await seriesRepository.createChapter(seriesId, {
        number: chapterNumber,
        title: chapterTitle,
        privateNote: chapterSummary,
        isRead,
      });

      if (!chapterId) {
        setHint(text.saveFailed);
        return;
      }

      navigation.replace('SeriesDetail', { seriesId });
    } catch {
      setHint(text.saveFailed);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView
        {...formScrollProps}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{text.title}</Text>

        <View style={styles.card}>
          <Text style={styles.label}>{text.chapterNumberLabel}</Text>
          <TextInput
            onChangeText={setChapterNumber}
            placeholder={text.chapterNumberPlaceholder}
            placeholderTextColor="#94A3B8"
            style={styles.input}
            value={chapterNumber}
          />

          <Text style={styles.label}>{text.chapterTitleLabel}</Text>
          <TextInput
            onChangeText={setChapterTitle}
            placeholder={text.chapterTitlePlaceholder}
            placeholderTextColor="#94A3B8"
            style={styles.input}
            value={chapterTitle}
          />

          <Text style={styles.label}>{text.chapterSummaryLabel}</Text>
          <TextInput
            multiline
            onChangeText={setChapterSummary}
            placeholder={text.chapterSummaryPlaceholder}
            placeholderTextColor="#94A3B8"
            style={styles.inputMultiline}
            value={chapterSummary}
          />

          <Pressable onPress={() => setIsRead((current) => !current)} style={styles.toggleRow}>
            <View style={[styles.checkbox, isRead && styles.checkboxChecked]}>
              {isRead ? <Text style={styles.checkboxTick}>✓</Text> : null}
            </View>
            <Text style={styles.toggleLabel}>{text.markAsReadLabel}</Text>
          </Pressable>

          <Pressable onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>{text.saveButton}</Text>
          </Pressable>
          {hint ? <Text style={styles.hintText}>{hint}</Text> : null}
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
  title: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '800',
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
  },
  label: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    borderRadius: radius.sm,
    borderWidth: 1,
    color: colors.textPrimary,
    fontSize: 15,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  inputMultiline: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    borderRadius: radius.sm,
    borderWidth: 1,
    color: colors.textPrimary,
    fontSize: 15,
    minHeight: 110,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    textAlignVertical: 'top',
  },
  toggleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: spacing.md,
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
  hintText: {
    color: '#475569',
    fontSize: 12,
    marginTop: spacing.sm,
  },
});
