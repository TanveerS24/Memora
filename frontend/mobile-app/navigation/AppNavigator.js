import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useStore } from '../store/useStore';

// Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import PartnerScreen from '../screens/PartnerScreen';
import ChatScreen from '../screens/ChatScreen';
import MemoryUploadScreen from '../screens/MemoryUploadScreen';
import TimelineScreen from '../screens/TimelineScreen';
import LoveFeedScreen from '../screens/LoveFeedScreen';
import InsightsScreen from '../screens/InsightsScreen';
import TimeCapsuleScreen from '../screens/TimeCapsuleScreen';
import SharedNotesScreen from '../screens/SharedNotesScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          paddingBottom: 8,
          paddingTop: 8,
          height: 60,
        },
      }}
    >
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Memories" component={TimelineScreen} />
      <Tab.Screen name="LoveFeed" component={LoveFeedScreen} />
      <Tab.Screen name="Upload" component={MemoryUploadScreen} />
      <Tab.Screen name="Insights" component={InsightsScreen} />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { token } = useStore();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!token ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Partner" component={PartnerScreen} />
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="TimeCapsule" component={TimeCapsuleScreen} />
            <Stack.Screen name="SharedNotes" component={SharedNotesScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
