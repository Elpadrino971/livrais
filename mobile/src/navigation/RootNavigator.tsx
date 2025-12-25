import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuthStore } from '@/store/useAuthStore';

// Screens
import AuthScreen from '@/screens/AuthScreen';
import HomeScreen from '@/screens/HomeScreen';
import MapScreen from '@/screens/MapScreen';
import ProfileScreen from '@/screens/ProfileScreen';
import CreateRequestScreen from '@/screens/CreateRequestScreen';
import RequestDetailsScreen from '@/screens/RequestDetailsScreen';
import DeliveryTrackingScreen from '@/screens/DeliveryTrackingScreen';
import RateDeliveryScreen from '@/screens/RateDeliveryScreen';
import PricingGuideScreen from '@/screens/PricingGuideScreen';
import DeliveryHistoryScreen from '@/screens/DeliveryHistoryScreen';
import FavoritesScreen from '@/screens/FavoritesScreen';
import FAQScreen from '@/screens/FAQScreen';
import TermsOfServiceScreen from '@/screens/TermsOfServiceScreen';
import PrivacyPolicyScreen from '@/screens/PrivacyPolicyScreen';
import AboutScreen from '@/screens/AboutScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: '#999',
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color }) => <TabIcon icon="🏠" color={color} />,
        }}
      />
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          title: 'Carte',
          tabBarIcon: ({ color }) => <TabIcon icon="🗺️" color={color} />,
        }}
      />
      <Tab.Screen
        name="History"
        component={DeliveryHistoryScreen}
        options={{
          title: 'Historique',
          tabBarIcon: ({ color }) => <TabIcon icon="📦" color={color} />,
        }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          title: 'Favoris',
          tabBarIcon: ({ color }) => <TabIcon icon="⭐" color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profil',
          tabBarIcon: ({ color }) => <TabIcon icon="👤" color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

function TabIcon({ icon, color }: { icon: string; color: string }) {
  return <Text style={{ fontSize: 24, color }}>{icon}</Text>;
}

export default function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthScreen} />
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            {/* Delivery Flow Screens */}
            <Stack.Screen
              name="CreateRequest"
              component={CreateRequestScreen}
              options={{ presentation: 'modal' }}
            />
            <Stack.Screen
              name="RequestDetails"
              component={RequestDetailsScreen}
            />
            <Stack.Screen
              name="DeliveryTracking"
              component={DeliveryTrackingScreen}
            />
            <Stack.Screen
              name="RateDelivery"
              component={RateDeliveryScreen}
              options={{ presentation: 'modal' }}
            />
            {/* Information Screens */}
            <Stack.Screen
              name="PricingGuide"
              component={PricingGuideScreen}
            />
            <Stack.Screen
              name="FAQ"
              component={FAQScreen}
            />
            {/* Legal Screens */}
            <Stack.Screen
              name="TermsOfService"
              component={TermsOfServiceScreen}
              options={{ presentation: 'modal' }}
            />
            <Stack.Screen
              name="PrivacyPolicy"
              component={PrivacyPolicyScreen}
              options={{ presentation: 'modal' }}
            />
            <Stack.Screen
              name="About"
              component={AboutScreen}
              options={{ presentation: 'modal' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

import { Text } from 'react-native';
