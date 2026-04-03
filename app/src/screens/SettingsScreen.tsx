import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { resolveAppLocale } from '../i18n/locale';
import { getSettingsScreenText } from '../i18n/screenText';
import { buildSettingsRuntimeInfo } from '../features/settings/domain/runtimeInfo';
import { colors, radius, spacing } from '../theme/tokens';

const appLocale = resolveAppLocale(process.env.EXPO_PUBLIC_UI_LOCALE);
const text = getSettingsScreenText(appLocale);

export const SettingsScreen = () => {
  const runtimeInfo = buildSettingsRuntimeInfo({
    configuredLocale: process.env.EXPO_PUBLIC_UI_LOCALE,
    configuredDataSource: process.env.EXPO_PUBLIC_DATA_SOURCE,
    runtimeNodeEnv: process.env.NODE_ENV,
    runtimePlatform: process.env.EXPO_OS,
  });

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{text.title}</Text>
        <Text style={styles.description}>{text.description}</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{text.runtimeInfoTitle}</Text>
          <View style={styles.row}>
            <Text style={styles.label}>{text.runtimeLocaleLabel}</Text>
            <Text style={styles.value}>{runtimeInfo.locale}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{text.runtimeConfiguredSourceLabel}</Text>
            <Text style={styles.value}>{runtimeInfo.configuredDataSource}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{text.runtimeResolvedSourceLabel}</Text>
            <Text style={styles.value}>{runtimeInfo.resolvedDataSource}</Text>
          </View>
          <View style={styles.rowLast}>
            <Text style={styles.label}>{text.runtimePlatformLabel}</Text>
            <Text style={styles.value}>{runtimeInfo.platform}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{text.aboutTitle}</Text>
          <Text style={styles.aboutText}>{text.aboutDescription}</Text>
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
  container: {
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
  row: {
    alignItems: 'center',
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  rowLast: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  value: {
    color: colors.textPrimary,
    fontSize: 13,
    fontWeight: '700',
  },
  aboutText: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 20,
  },
});
