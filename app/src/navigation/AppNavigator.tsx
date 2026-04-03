import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { resolveAppLocale } from '../i18n/locale';
import { getNavigationText } from '../i18n/screenText';
import { colors } from '../theme/tokens';
import { SettingsScreen } from '../screens/SettingsScreen';
import { buildTabBarStyle } from './tabBarLayout';
import { HomeStackNavigator } from './HomeStackNavigator';
import { LibraryStackNavigator } from './LibraryStackNavigator';
import { RootTabParamList } from './types';

const Tab = createBottomTabNavigator<RootTabParamList>();
const appLocale = resolveAppLocale(process.env.EXPO_PUBLIC_UI_LOCALE);
const text = getNavigationText(appLocale);

export const AppNavigator = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      initialRouteName="HomeTab"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: '#94A3B8',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
          letterSpacing: 0.8,
          marginBottom: 2,
        },
        tabBarStyle: {
          backgroundColor: '#F8FAFC',
          borderTopColor: colors.divider,
          borderTopWidth: 1,
          ...buildTabBarStyle(insets.bottom),
        },
        tabBarIcon: ({ color, size }) => {
          const iconName =
            route.name === 'HomeTab' ? 'home' : route.name === 'Library' ? 'library' : 'settings';

          return <Ionicons color={color} name={iconName} size={size} />;
        },
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStackNavigator} options={{ title: text.tabHome }} />
      <Tab.Screen name="Library" component={LibraryStackNavigator} options={{ title: text.tabLibrary }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: text.tabSettings }} />
    </Tab.Navigator>
  );
};
