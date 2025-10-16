import React from 'react';
import { Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { HomeScreen } from './src/screens/HomeScreen';
import { HomeScreenWeb } from './src/screens/HomeScreenWeb';
import { ResultsScreen } from './src/screens/ResultsScreen';
import { ResultsScreenWeb } from './src/screens/ResultsScreenWeb';
import { RootStackParamList } from './src/types';

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  // Use web-compatible components for web platform
  const HomeComponent = Platform.OS === 'web' ? HomeScreenWeb : HomeScreen;
  const ResultsComponent = Platform.OS === 'web' ? ResultsScreenWeb : ResultsScreen;
  
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <StatusBar style="dark" backgroundColor="#f9fafb" />
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerShown: false,
            gestureEnabled: true,
            gestureDirection: 'horizontal',
            ...(Platform.OS !== 'web' && {
              cardStyleInterpolator: ({ current, layouts }) => {
                return {
                  cardStyle: {
                    transform: [
                      {
                        translateX: current.progress.interpolate({
                          inputRange: [0, 1],
                          outputRange: [layouts.screen.width, 0],
                        }),
                      },
                    ],
                  },
                };
              }
            })
          }}
        >
          <Stack.Screen 
            name="Home" 
            component={HomeComponent}
            options={{
              title: 'Vibe'
            }}
          />
          <Stack.Screen 
            name="Results" 
            component={ResultsComponent}
            options={{
              title: 'Your Activities'
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
