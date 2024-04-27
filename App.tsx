import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import type { PropsWithChildren } from 'react';
import {
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import { useMaterial3Theme } from '@pchmn/expo-material3-theme';
import {
  MD3DarkTheme,
  MD3LightTheme,
  PaperProvider,
  adaptNavigationTheme,
} from 'react-native-paper';

import { Login } from './src/screens/Login';
import { Main as MainScreen } from './src/screens/Main';
import { Stack } from './src/globals/navigator';
import { Chat } from './src/screens/Chat';
import { ConnectToSatori } from './src/screens/connection/Satori';
import { initConfigStore } from './src/globals/config';

const { LightTheme, DarkTheme: DarkThemeA } = adaptNavigationTheme({ reactNavigationLight: DefaultTheme, reactNavigationDark: DarkTheme });

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <NavigationContainer theme={isDarkMode ? DarkThemeA : LightTheme} >
      <Stack.Navigator screenOptions={{
        headerShown: false
      }}>
        <Stack.Screen
          name="Main"
          component={MainScreen}
        />
        <Stack.Screen
          name="Login"
          component={Login}
        />
        <Stack.Screen
          name="Chat"
          component={Chat}
        />

        {/* Connect to adaptors */}
        <Stack.Screen
          name="ConnectToSatori"
          component={ConnectToSatori}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function Main() {
  const colorScheme = useColorScheme();
  const { theme } = useMaterial3Theme();

  initConfigStore();

  const paperTheme =
    colorScheme === 'dark'
      ? { ...MD3DarkTheme, colors: theme.dark }
      : { ...MD3LightTheme, colors: theme.light };

  return (
    <PaperProvider theme={paperTheme}>
      <App />
    </PaperProvider>
  );
}