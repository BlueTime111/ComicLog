import { colors, radius, spacing } from '../../../theme/tokens';

type TopBarButtonVariant = 'primary' | 'secondary';

export const TOP_BAR_BUTTON_HEIGHT = 40;
export const TOP_BAR_BUTTON_MIN_WIDTH = 74;

const COMMON_BUTTON_STYLE = {
  alignItems: 'center' as const,
  borderRadius: radius.sm,
  borderWidth: 1,
  height: TOP_BAR_BUTTON_HEIGHT,
  justifyContent: 'center' as const,
  minWidth: TOP_BAR_BUTTON_MIN_WIDTH,
  paddingHorizontal: spacing.md,
};

const COMMON_TEXT_STYLE = {
  fontSize: 14,
  fontWeight: '700' as const,
  letterSpacing: 0.4,
};

export const createTopBarButtonStyle = (variant: TopBarButtonVariant) => {
  if (variant === 'primary') {
    return {
      ...COMMON_BUTTON_STYLE,
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    };
  }

  return {
    ...COMMON_BUTTON_STYLE,
    backgroundColor: '#EEF2FF',
    borderColor: '#A5B4FC',
  };
};

export const createTopBarButtonTextStyle = (variant: TopBarButtonVariant) => {
  if (variant === 'primary') {
    return {
      ...COMMON_TEXT_STYLE,
      color: '#FFFFFF',
    };
  }

  return {
    ...COMMON_TEXT_STYLE,
    color: '#4338CA',
  };
};
