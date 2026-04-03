import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

import { resolveAppLocale } from '../i18n/locale';
import { getSeriesDetailText, getSeriesSharedText } from '../i18n/screenText';
import { colors, spacing } from '../theme/tokens';
import { HomeStackParamList } from '../navigation/types';
import { ChapterSummaryRow } from '../features/series/components/ChapterSummaryRow';
import { RecapCard } from '../features/series/components/RecapCard';
import { useSeriesDetailData } from '../features/series/hooks/useSeriesDetailData';
import { getChaptersByScope } from '../features/series/domain/recap';
import { buildExportPack } from '../features/export/domain/exportPack';
import { buildExportFileName, serializeExportPack } from '../features/export/domain/exportPayload';

type ExportState = {
  fileName: string;
  json: string;
};

type Props = NativeStackScreenProps<HomeStackParamList, 'SeriesDetail'>;

const appLocale = resolveAppLocale(process.env.EXPO_PUBLIC_UI_LOCALE);
const text = getSeriesDetailText(appLocale);
const sharedText = getSeriesSharedText(appLocale);

export const SeriesDetailScreen = ({ route }: Props) => {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  const { detail, isLoading, recap, updateMeta } = useSeriesDetailData(
    route.params.seriesId,
  );
  const [exportState, setExportState] = useState<ExportState | null>(null);
  const [exportHint, setExportHint] = useState<string | null>(null);
  const [includeOnlyReadChapters, setIncludeOnlyReadChapters] = useState(true);

  const visibleChapters = getChaptersByScope(
    detail?.chapters ?? [],
    detail?.lastReadChapterNumber ?? '0',
    includeOnlyReadChapters,
  );

  if (isLoading) {
    return (
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{text.loadingSeries}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!detail) {
    return (
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <Text style={styles.notFoundTitle}>{text.notFoundTitle}</Text>
          <Text style={styles.notFoundHint}>{text.notFoundHint}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleExportSharedPack = () => {
    const now = new Date().toISOString();
    const seriesForExport = includeOnlyReadChapters
      ? detail
      : {
          ...detail,
          chapters: visibleChapters,
        };

    const pack = buildExportPack(seriesForExport, {
      packId: `pack_${detail.id}_${Date.now()}`,
      packTitle: `${detail.title} Shared Pack`,
      author: 'local-user',
      version: 1,
      updatedAt: now,
      includeOnlyReadChapters,
    });

    const fileName = buildExportFileName({
      seriesId: detail.id,
      version: pack.pack.version,
      timestamp: now,
    });

    setExportState({
      fileName,
      json: serializeExportPack(pack),
    });
    setExportHint(
      includeOnlyReadChapters
        ? text.exportGeneratedReadOnly(fileName)
        : text.exportGeneratedIncludeUnread(fileName),
    );
  };

  const handleCopyExportJson = async () => {
    if (!exportState) {
      return;
    }

    await Clipboard.setStringAsync(exportState.json);
    setExportHint(text.copyJsonSuccess);
  };

  const handleSaveExportFile = async () => {
    if (!exportState) {
      return;
    }

    if (Platform.OS === 'web') {
      const blob = new Blob([exportState.json], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = exportState.fileName;
      link.click();
      URL.revokeObjectURL(url);
      setExportHint(text.browserDownloadTriggered);
      return;
    }

    const baseDir = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;

    if (!baseDir) {
      setExportHint(text.saveFailedNoDirectory);
      return;
    }

    const targetPath = `${baseDir}${exportState.fileName}`;

    await FileSystem.writeAsStringAsync(targetPath, exportState.json, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(targetPath, {
        mimeType: 'application/json',
        dialogTitle: text.shareDialogTitle,
      });
      setExportHint(text.shareOpened);
      return;
    }

    setExportHint(text.savedTo(targetPath));
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{detail.title}</Text>
        <Text style={styles.progress}>{text.readProgressPrefix}{detail.lastReadChapterNumber}</Text>
        <Text style={styles.updateMeta}>{updateMeta}</Text>

        <Pressable
          onPress={() => navigation.navigate('SeriesManage', { seriesId: detail.id })}
          style={styles.manageButton}
        >
          <Text style={styles.manageButtonText}>{text.manageSeriesButton}</Text>
        </Pressable>

        <Pressable
          onPress={() => navigation.navigate('ChapterCreate', { seriesId: detail.id })}
          style={styles.addChapterButton}
        >
          <Text style={styles.addChapterButtonText}>{text.addChapterButton}</Text>
        </Pressable>

        <Pressable onPress={handleExportSharedPack} style={styles.exportButton}>
          <Text style={styles.exportButtonText}>{text.exportSharedPackButton}</Text>
        </Pressable>

        <View style={styles.exportScopeRow}>
          <Pressable
            onPress={() => setIncludeOnlyReadChapters(true)}
            style={[styles.exportScopeButton, includeOnlyReadChapters && styles.exportScopeButtonActive]}
          >
            <Text
              style={[styles.exportScopeText, includeOnlyReadChapters && styles.exportScopeTextActive]}
            >
              {text.exportScopeReadOnly}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setIncludeOnlyReadChapters(false)}
            style={[styles.exportScopeButton, !includeOnlyReadChapters && styles.exportScopeButtonActive]}
          >
            <Text
              style={[styles.exportScopeText, !includeOnlyReadChapters && styles.exportScopeTextActive]}
            >
              {text.exportScopeIncludeUnread}
            </Text>
          </Pressable>
        </View>

        {exportState ? (
          <View style={styles.exportCard}>
            <Text style={styles.exportTitle}>{text.exportPreviewTitle}</Text>
            <Text style={styles.exportMeta}>{text.fileNameLabel}{exportState.fileName}</Text>
            <View style={styles.exportActions}>
              <Pressable onPress={handleCopyExportJson} style={styles.exportActionButton}>
                <Text style={styles.exportActionText}>{text.copyJsonButton}</Text>
              </Pressable>
              <Pressable onPress={handleSaveExportFile} style={styles.exportActionButtonSecondary}>
                <Text style={styles.exportActionTextSecondary}>{text.saveFileButton}</Text>
              </Pressable>
            </View>
            {exportHint ? <Text style={styles.exportHint}>{exportHint}</Text> : null}
            <Text selectable style={styles.exportJsonText}>
              {exportState.json}
            </Text>
          </View>
        ) : null}

        {includeOnlyReadChapters ? (
          <RecapCard
            recap={recap}
            previousChapterPrefix={sharedText.previousChapterPrefix}
            recentThreeTitle={sharedText.recentThreeTitle}
            title={sharedText.recapTitle}
            sharedLayerLabel={sharedText.sharedLayerLabel}
            privateLayerLabel={sharedText.privateLayerLabel}
          />
        ) : null}

        <Text style={styles.sectionTitle}>{text.chapterSummaryTitle}</Text>
        {visibleChapters.map((chapter) => (
          <ChapterSummaryRow
            chapter={chapter}
            key={chapter.id}
            viewHint={sharedText.chapterRowViewHint}
            sharedLayerLabel={sharedText.sharedLayerLabel}
            privateLayerLabel={sharedText.privateLayerLabel}
            onPress={() =>
              navigation.navigate('ChapterDetail', {
                seriesId: detail.id,
                chapterId: chapter.id,
              })
            }
          />
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
    backgroundColor: colors.background,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  loadingContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  notFoundTitle: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  notFoundHint: {
    color: colors.textSecondary,
    fontSize: 15,
    textAlign: 'center',
  },
  title: {
    color: colors.textPrimary,
    fontSize: 26,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  progress: {
    color: '#4C5B74',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  updateMeta: {
    color: '#64748B',
    fontSize: 12,
    marginBottom: spacing.sm,
  },
  manageButton: {
    alignItems: 'center',
    borderColor: '#94A3B8',
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: spacing.lg,
    paddingVertical: spacing.xs,
  },
  manageButtonText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '700',
  },
  addChapterButton: {
    alignItems: 'center',
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
    marginBottom: spacing.lg,
    paddingVertical: spacing.xs,
  },
  addChapterButtonText: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '700',
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  exportButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 10,
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
  },
  exportButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  exportScopeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  exportScopeButton: {
    alignItems: 'center',
    borderColor: '#CBD5E1',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    paddingVertical: spacing.sm,
  },
  exportScopeButtonActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#A5B4FC',
  },
  exportScopeText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '700',
  },
  exportScopeTextActive: {
    color: '#4338CA',
  },
  exportCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  exportTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  exportMeta: {
    color: '#475569',
    fontSize: 12,
    marginBottom: spacing.sm,
  },
  exportActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  exportActionButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 8,
    flex: 1,
    paddingVertical: spacing.sm,
  },
  exportActionButtonSecondary: {
    alignItems: 'center',
    borderColor: '#A5B4FC',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    paddingVertical: spacing.sm,
  },
  exportActionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  exportActionTextSecondary: {
    color: '#4338CA',
    fontSize: 13,
    fontWeight: '700',
  },
  exportHint: {
    color: '#475569',
    fontSize: 12,
    marginBottom: spacing.sm,
  },
  exportJsonText: {
    color: '#334155',
    fontSize: 12,
    lineHeight: 18,
  },
});
