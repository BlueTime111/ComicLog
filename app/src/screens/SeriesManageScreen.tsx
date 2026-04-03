import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { seriesRepository } from '../data/repositories';
import {
  buildCreateSeriesInput,
  normalizeLastReadChapterNumber,
  normalizeSeriesTitle,
} from '../features/series/domain/seriesManageForm';
import { resolveAppLocale } from '../i18n/locale';
import { getSeriesManageText } from '../i18n/screenText';
import { HomeStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme/tokens';
import { formScrollProps } from '../ui/formScrollProps';

type Props = NativeStackScreenProps<HomeStackParamList, 'SeriesManage'>;

const appLocale = resolveAppLocale(process.env.EXPO_PUBLIC_UI_LOCALE);
const text = getSeriesManageText(appLocale);

export const SeriesManageScreen = ({ navigation, route }: Props) => {
  const seriesId = route.params?.seriesId;
  const isEditMode = Boolean(seriesId);

  const [isLoading, setIsLoading] = useState(isEditMode);
  const [title, setTitle] = useState('');
  const [lastReadChapterNumber, setLastReadChapterNumber] = useState('0');
  const [hint, setHint] = useState<string | null>(null);

  useEffect(() => {
    if (!seriesId) {
      return;
    }

    let active = true;
    const load = async () => {
      const detail = await seriesRepository.getSeriesDetail(seriesId);
      if (!active) {
        return;
      }

      if (!detail) {
        setIsLoading(false);
        setHint(text.saveFailed);
        return;
      }

      setTitle(detail.title);
      setLastReadChapterNumber(detail.lastReadChapterNumber);
      setIsLoading(false);
    };

    load().catch(() => {
      if (!active) {
        return;
      }

      setIsLoading(false);
      setHint(text.saveFailed);
    });

    return () => {
      active = false;
    };
  }, [seriesId]);

  const screenTitle = useMemo(
    () => (isEditMode ? text.titleEdit : text.titleCreate),
    [isEditMode],
  );

  const handleSave = async () => {
    const normalizedTitle = normalizeSeriesTitle(title);
    const normalizedProgress = normalizeLastReadChapterNumber(lastReadChapterNumber);

    if (!normalizedTitle) {
      setHint(text.saveFailed);
      return;
    }

    try {
      if (!seriesId) {
        const created = await seriesRepository.createSeries(buildCreateSeriesInput(title));
        setHint(text.saveSuccess);
        navigation.replace('SeriesDetail', { seriesId: created.id });
        return;
      }

      const titleChanged = await seriesRepository.updateSeries(seriesId, {
        title: normalizedTitle,
      });
      const progressChanged = await seriesRepository.setLastReadChapterNumber(
        seriesId,
        normalizedProgress,
      );

      if (!titleChanged && !progressChanged) {
        setHint(text.saveFailed);
        return;
      }

      setHint(text.saveSuccess);
      navigation.replace('SeriesDetail', { seriesId });
    } catch {
      setHint(text.saveFailed);
    }
  };

  const handleDelete = async () => {
    if (!seriesId) {
      return;
    }

    try {
      const deleted = await seriesRepository.deleteSeries(seriesId);
      if (!deleted) {
        setHint(text.deleteFailed);
        return;
      }

      setHint(text.deleteSuccess);
      navigation.navigate('HomeMain');
    } catch {
      setHint(text.deleteFailed);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.loadingBox}>
          <Text style={styles.loadingText}>Loading series...</Text>
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
        <Text style={styles.screenTitle}>{screenTitle}</Text>

        <View style={styles.card}>
          <Text style={styles.label}>{text.seriesTitleLabel}</Text>
          <TextInput
            onChangeText={setTitle}
            placeholder={text.seriesTitlePlaceholder}
            placeholderTextColor="#94A3B8"
            style={styles.input}
            value={title}
          />

          {isEditMode ? (
            <>
              <Text style={styles.label}>{text.progressLabel}</Text>
              <TextInput
                onChangeText={setLastReadChapterNumber}
                placeholder={text.progressPlaceholder}
                placeholderTextColor="#94A3B8"
                style={styles.input}
                value={lastReadChapterNumber}
              />
            </>
          ) : null}

          <Pressable onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>{text.saveButton}</Text>
          </Pressable>

          {seriesId ? (
            <Pressable onPress={handleDelete} style={styles.deleteButton}>
              <Text style={styles.deleteButtonText}>{text.deleteButton}</Text>
            </Pressable>
          ) : null}

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
  loadingBox: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 15,
  },
  screenTitle: {
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
  deleteButton: {
    alignItems: 'center',
    borderColor: '#FCA5A5',
    borderRadius: radius.sm,
    borderWidth: 1,
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
  },
  deleteButtonText: {
    color: '#B91C1C',
    fontSize: 14,
    fontWeight: '700',
  },
  hintText: {
    color: '#475569',
    fontSize: 12,
    marginTop: spacing.sm,
  },
});
