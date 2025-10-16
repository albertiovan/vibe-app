import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeScreenWeb } from './src/screens/HomeScreenWeb';
import { ResultsScreen } from './src/screens/ResultsScreen';
import { RootStackParamList } from './src/types';

const Stack = createStackNavigator<RootStackParamList>();

export default function AppWeb() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" backgroundColor="#f9fafb" />
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          gestureEnabled: true,
          gestureDirection: 'horizontal',
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreenWeb}
          options={{
            title: 'Vibe'
          }}
        />
        <Stack.Screen 
          name="Results" 
          component={ResultsScreen}
          options={{
            title: 'Your Activities'
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
