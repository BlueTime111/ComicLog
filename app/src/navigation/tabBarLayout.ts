export const BASE_TAB_BAR_HEIGHT = 72;
export const BASE_TAB_BAR_PADDING_TOP = 6;
export const BASE_TAB_BAR_PADDING_BOTTOM = 6;

export const buildTabBarStyle = (bottomInset: number) => {
  const safeBottomInset = Number.isFinite(bottomInset) && bottomInset > 0 ? bottomInset : 0;

  return {
    height: BASE_TAB_BAR_HEIGHT + safeBottomInset,
    paddingTop: BASE_TAB_BAR_PADDING_TOP,
    paddingBottom: BASE_TAB_BAR_PADDING_BOTTOM + safeBottomInset,
  };
};
