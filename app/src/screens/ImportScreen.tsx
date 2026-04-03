import { useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';

import { samplePackRawJson } from '../data/mock/importPacks';
import { importRepository } from '../data/repositories';
import { resolveAppLocale } from '../i18n/locale';
import { getImportScreenText, getImportStrategyOptions } from '../i18n/screenText';
import {
  ImportApplyResult,
  ImportManualDecision,
  ImportPreview,
  ImportStrategy,
  parseSummaryPack,
  SummaryPack,
} from '../features/import/domain/summaryPack';
import {
  applyBulkManualResolution,
  createDefaultManualDecisions,
} from '../features/import/domain/manualDecisions';
import { shouldRenderImportTitle } from '../features/import/domain/importScreenLayout';
import { colors, radius, spacing } from '../theme/tokens';
import { formScrollProps } from '../ui/formScrollProps';

const appLocale = resolveAppLocale(process.env.EXPO_PUBLIC_UI_LOCALE);
const text = getImportScreenText(appLocale);
const strategyOptions = getImportStrategyOptions(appLocale);

export const ImportScreen = () => {
  const [rawJson, setRawJson] = useState('');
  const [parsedPack, setParsedPack] = useState<SummaryPack | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [applyResult, setApplyResult] = useState<ImportApplyResult | null>(null);
  const [strategy, setStrategy] = useState<ImportStrategy>('missingOnly');
  const [manualDecisions, setManualDecisions] = useState<Record<string, 'keepLocal' | 'useIncoming'>>({});
  const [fileLoadHint, setFileLoadHint] = useState<string | null>(null);

  const strategyDescription = useMemo(
    () => strategyOptions.find((option) => option.key === strategy)?.description ?? '',
    [strategy],
  );

  const handleLoadSample = () => {
    setRawJson(samplePackRawJson);
    setParsedPack(null);
    setPreview(null);
    setParseError(null);
    setApplyResult(null);
    setManualDecisions({});
    setFileLoadHint(text.sampleLoadedHint);
  };

  const readPickedFile = async (asset: DocumentPicker.DocumentPickerAsset): Promise<string> => {
    if (Platform.OS === 'web' && asset.file) {
      return asset.file.text();
    }

    if (Platform.OS === 'web') {
      const response = await fetch(asset.uri);
      return response.text();
    }

    return FileSystem.readAsStringAsync(asset.uri);
  };

  const handlePickLocalJson = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/json', 'text/plain'],
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (result.canceled) {
      return;
    }

    const picked = result.assets[0];

    if (!picked) {
      setFileLoadHint(text.fileNotReadHint);
      return;
    }

    try {
      const fileContent = await readPickedFile(picked);
      setRawJson(fileContent);
      setParsedPack(null);
      setPreview(null);
      setParseError(null);
      setApplyResult(null);
      setManualDecisions({});
      setFileLoadHint(text.fileSelectedHint(picked.name));
    } catch {
      setFileLoadHint(text.fileReadFailedHint);
    }
  };

  const handlePreview = async () => {
    const parsed = parseSummaryPack(rawJson);

    if (!parsed.data) {
      setParsedPack(null);
      setPreview(null);
      setParseError(parsed.error);
      setApplyResult(null);
      return;
    }

    try {
      const nextPreview = await importRepository.previewPack(parsed.data);
      const defaultManualDecisions = createDefaultManualDecisions(nextPreview.conflictChapters);

      setParsedPack(parsed.data);
      setPreview(nextPreview);
      setParseError(null);
      setApplyResult(null);
      setManualDecisions(defaultManualDecisions);
    } catch {
      setParsedPack(null);
      setPreview(null);
      setApplyResult(null);
      setManualDecisions({});
      setParseError('SQLite repository is unavailable. Please verify local database support and retry.');
    }
  };

  const updateManualDecision = (chapterNumber: string, resolution: 'keepLocal' | 'useIncoming') => {
    setManualDecisions((current) => ({
      ...current,
      [chapterNumber]: resolution,
    }));
  };

  const setAllManualDecisions = (resolution: 'keepLocal' | 'useIncoming') => {
    if (!preview) {
      return;
    }

    setManualDecisions((current) =>
      applyBulkManualResolution(current, preview.conflictChapters, resolution),
    );
  };

  const handleApplyImport = async () => {
    if (!parsedPack) {
      return;
    }

    const decisions: ImportManualDecision[] = Object.entries(manualDecisions).map(
      ([number, resolution]) => ({ number, resolution }),
    );

    try {
      const result = await importRepository.applyPack(
        parsedPack,
        strategy,
        strategy === 'manual' ? decisions : undefined,
      );
      setApplyResult(result);
    } catch {
      setApplyResult(null);
      setParseError('Import failed because SQLite repository is unavailable.');
    }
  };

  return (
    <SafeAreaView edges={['left', 'right']} style={styles.safeArea}>
      <ScrollView
        {...formScrollProps}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {shouldRenderImportTitle(text.title) ? <Text style={styles.title}>{text.title}</Text> : null}
        <Text style={styles.description}>{text.description}</Text>

        <Pressable onPress={handleLoadSample} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>{text.loadSampleButton}</Text>
        </Pressable>

        <Pressable onPress={handlePickLocalJson} style={styles.secondaryButtonMuted}>
          <Text style={styles.secondaryButtonMutedText}>{text.pickLocalFileButton}</Text>
        </Pressable>

        {fileLoadHint ? <Text style={styles.fileLoadHint}>{fileLoadHint}</Text> : null}

        <TextInput
          multiline
          onChangeText={setRawJson}
          placeholder={text.inputPlaceholder}
          placeholderTextColor="#94A3B8"
          style={styles.input}
          value={rawJson}
        />

        <Pressable onPress={handlePreview} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>{text.previewButton}</Text>
        </Pressable>

        {parseError ? <Text style={styles.errorText}>{parseError}</Text> : null}

        {preview ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{preview.packTitle}</Text>
            <Text style={styles.cardMeta}>{text.cardSeriesLabel}{preview.seriesTitle}</Text>
            <Text style={styles.cardMeta}>{text.cardAuthorLabel}{preview.author}</Text>
            <Text style={styles.cardMeta}>{text.cardVersionLabel}{preview.version}</Text>
            <Text style={styles.cardMeta}>{text.cardCoverageLabel}{preview.coverageLabel}</Text>
            <Text style={styles.cardMeta}>{text.cardChapterCountLabel}{preview.chapterCount}</Text>

            <View style={styles.statsRow}>
              <Text style={styles.statChip}>{text.statAddedLabel}{preview.addedCount}</Text>
              <Text style={styles.statChip}>{text.statUpdatedLabel}{preview.updatedCount}</Text>
              <Text style={styles.statChip}>{text.statConflictLabel}{preview.conflictCount}</Text>
            </View>

            {preview.conflictChapters.length > 0 ? (
              <View style={styles.conflictList}>
                <Text style={styles.conflictTitle}>{text.conflictTitle}</Text>
                {preview.conflictChapters.map((conflict) => (
                  <View key={conflict.number} style={styles.conflictItem}>
                    <Text style={styles.conflictNumber}>Ch. {conflict.number}</Text>
                    <Text style={styles.conflictText}>{text.localSummaryPrefix}{conflict.existingSummary}</Text>
                    <Text style={styles.conflictText}>{text.incomingSummaryPrefix}{conflict.incomingSummary}</Text>

                    {strategy === 'manual' ? (
                      <View style={styles.conflictActionRow}>
                        <Pressable
                          onPress={() => updateManualDecision(conflict.number, 'keepLocal')}
                          style={[
                            styles.conflictActionButton,
                            manualDecisions[conflict.number] === 'keepLocal' &&
                              styles.conflictActionButtonActive,
                          ]}
                        >
                          <Text
                            style={[
                              styles.conflictActionText,
                              manualDecisions[conflict.number] === 'keepLocal' &&
                                styles.conflictActionTextActive,
                            ]}
                          >
                            {text.keepLocalButton}
                          </Text>
                        </Pressable>
                        <Pressable
                          onPress={() => updateManualDecision(conflict.number, 'useIncoming')}
                          style={[
                            styles.conflictActionButton,
                            manualDecisions[conflict.number] === 'useIncoming' &&
                              styles.conflictActionButtonActive,
                          ]}
                        >
                          <Text
                            style={[
                              styles.conflictActionText,
                              manualDecisions[conflict.number] === 'useIncoming' &&
                                styles.conflictActionTextActive,
                            ]}
                          >
                            {text.useIncomingButton}
                          </Text>
                        </Pressable>
                      </View>
                    ) : null}
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        ) : null}

        {preview ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{text.strategyTitle}</Text>
            <View style={styles.strategyList}>
              {strategyOptions.map((option) => {
                const active = option.key === strategy;

                return (
                  <Pressable
                    key={option.key}
                    onPress={() => setStrategy(option.key)}
                    style={[styles.strategyButton, active && styles.strategyButtonActive]}
                  >
                    <Text style={[styles.strategyLabel, active && styles.strategyLabelActive]}>
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.strategyHint}>{strategyDescription}</Text>

            {strategy === 'manual' && preview.conflictChapters.length > 0 ? (
              <View style={styles.bulkActionRow}>
                <Pressable
                  onPress={() => setAllManualDecisions('keepLocal')}
                  style={styles.bulkActionButton}
                >
                  <Text style={styles.bulkActionText}>{text.bulkKeepLocalButton}</Text>
                </Pressable>
                <Pressable
                  onPress={() => setAllManualDecisions('useIncoming')}
                  style={styles.bulkActionButton}
                >
                  <Text style={styles.bulkActionText}>{text.bulkUseIncomingButton}</Text>
                </Pressable>
              </View>
            ) : null}

            <Pressable onPress={handleApplyImport} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>{text.applyImportButton}</Text>
            </Pressable>
          </View>
        ) : null}

        {applyResult ? (
          <View style={styles.resultCard}>
            <Text style={styles.resultTitle}>{text.resultTitle}</Text>
            <Text style={styles.resultLine}>{text.resultAddedLine}{applyResult.addedCount}</Text>
            <Text style={styles.resultLine}>{text.resultUpdatedLine}{applyResult.updatedCount}</Text>
            <Text style={styles.resultLine}>{text.resultConflictLine}{applyResult.conflictCount}</Text>
            <Text style={styles.resultLine}>{text.resultPreservedPrivateLine}{applyResult.preservedPrivateCount}</Text>
          </View>
        ) : null}
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
    fontSize: 13,
    minHeight: 220,
    padding: spacing.md,
    textAlignVertical: 'top',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  secondaryButton: {
    alignItems: 'center',
    borderColor: colors.primary,
    borderRadius: radius.sm,
    borderWidth: 1,
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  secondaryButtonMuted: {
    alignItems: 'center',
    borderColor: '#94A3B8',
    borderRadius: radius.sm,
    borderWidth: 1,
    marginBottom: spacing.md,
    paddingVertical: spacing.sm,
  },
  secondaryButtonMutedText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '700',
  },
  fileLoadHint: {
    color: '#475569',
    fontSize: 12,
    marginBottom: spacing.sm,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 13,
    marginTop: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radius.md,
    borderWidth: 1,
    marginTop: spacing.md,
    padding: spacing.md,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  cardMeta: {
    color: '#4B5563',
    fontSize: 13,
    marginBottom: spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  statChip: {
    backgroundColor: '#E2E8F0',
    borderRadius: radius.sm,
    color: '#334155',
    fontSize: 12,
    fontWeight: '700',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  conflictList: {
    marginTop: spacing.md,
  },
  conflictTitle: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  conflictItem: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    borderRadius: radius.sm,
    borderWidth: 1,
    marginBottom: spacing.sm,
    padding: spacing.sm,
  },
  conflictNumber: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  conflictText: {
    color: '#475569',
    fontSize: 12,
    lineHeight: 18,
  },
  conflictActionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  conflictActionButton: {
    alignItems: 'center',
    borderColor: '#CBD5E1',
    borderRadius: radius.sm,
    borderWidth: 1,
    flex: 1,
    paddingVertical: spacing.xs,
  },
  conflictActionButtonActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#A5B4FC',
  },
  conflictActionText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '700',
  },
  conflictActionTextActive: {
    color: '#4338CA',
  },
  strategyList: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  strategyButton: {
    borderColor: colors.border,
    borderRadius: radius.sm,
    borderWidth: 1,
    flex: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  strategyButtonActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#C7D2FE',
  },
  strategyLabel: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  strategyLabelActive: {
    color: '#3F3FC5',
  },
  strategyHint: {
    color: '#64748B',
    fontSize: 12,
    marginTop: spacing.sm,
  },
  bulkActionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  bulkActionButton: {
    alignItems: 'center',
    borderColor: '#CBD5E1',
    borderRadius: radius.sm,
    borderWidth: 1,
    flex: 1,
    paddingVertical: spacing.xs,
  },
  bulkActionText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '700',
  },
  resultCard: {
    backgroundColor: '#ECFDF5',
    borderColor: '#BBF7D0',
    borderRadius: radius.md,
    borderWidth: 1,
    marginTop: spacing.md,
    padding: spacing.md,
  },
  resultTitle: {
    color: '#166534',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  resultLine: {
    color: '#166534',
    fontSize: 13,
    marginBottom: spacing.xs,
  },
});
