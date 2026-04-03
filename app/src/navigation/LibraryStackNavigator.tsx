import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { resolveAppLocale } from '../i18n/locale';
import { getNavigationText } from '../i18n/screenText';
import { ChapterCreateScreen } from '../screens/ChapterCreateScreen';
import { ChapterDetailScreen } from '../screens/ChapterDetailScreen';
import { ImportScreen } from '../screens/ImportScreen';
import { LibraryScreen } from '../screens/LibraryScreen';
import { SeriesDetailScreen } from '../screens/SeriesDetailScreen';
import { SeriesManageScreen } from '../screens/SeriesManageScreen';
import { LibraryStackParamList } from './types';

const Stack = createNativeStackNavigator<LibraryStackParamList>();
const appLocale = resolveAppLocale(process.env.EXPO_PUBLIC_UI_LOCALE);
const text = getNavigationText(appLocale);

export const LibraryStackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="HomeMain"
        component={LibraryScreen}
        options={{
          headerShown: false,
          title: text.tabLibrary,
        }}
      />
      <Stack.Screen
        name="Import"
        component={ImportScreen}
        options={{
          title: text.stackImport,
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="SeriesDetail"
        component={SeriesDetailScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ChapterDetail"
        component={ChapterDetailScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="ChapterCreate"
        component={ChapterCreateScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="SeriesManage"
        component={SeriesManageScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};
