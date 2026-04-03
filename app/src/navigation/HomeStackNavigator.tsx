import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { resolveAppLocale } from '../i18n/locale';
import { getNavigationText } from '../i18n/screenText';
import { HomeScreen } from '../screens/HomeScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { SeriesDetailScreen } from '../screens/SeriesDetailScreen';
import { ChapterDetailScreen } from '../screens/ChapterDetailScreen';
import { ChapterCreateScreen } from '../screens/ChapterCreateScreen';
import { ImportScreen } from '../screens/ImportScreen';
import { SeriesManageScreen } from '../screens/SeriesManageScreen';
import { HomeStackParamList } from './types';

const Stack = createNativeStackNavigator<HomeStackParamList>();
const appLocale = resolveAppLocale(process.env.EXPO_PUBLIC_UI_LOCALE);
const text = getNavigationText(appLocale);

export const HomeStackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="HomeMain"
        component={HomeScreen}
        options={{
          headerShown: false,
          title: text.tabHome,
        }}
      />
      <Stack.Screen
        name="Search"
        component={SearchScreen}
        options={{
          title: text.stackSearch,
          headerShadowVisible: false,
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
