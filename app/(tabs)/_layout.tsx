import React from 'react';
import { Tabs } from 'expo-router';
import { Platform, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { colors, fonts } from '@/constants/theme';

function TabIcon({ name, focused }: { name: keyof typeof Ionicons.glyphMap; focused: boolean }) {
  return (
    <View
      style={{
        width: 44,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: focused ? 'rgba(201,162,75,0.16)' : 'transparent',
      }}
    >
      <Ionicons name={name} size={22} color={focused ? colors.gold : colors.mist} />
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.mist,
        tabBarLabelStyle: { fontFamily: fonts.sansMedium, fontSize: 11, marginBottom: Platform.OS === 'ios' ? 0 : 4 },
        tabBarStyle: {
          backgroundColor: 'rgba(10,43,32,0.96)',
          borderTopWidth: 0,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingTop: 8,
        },
        tabBarBackground:
          Platform.OS === 'ios'
            ? () => <BlurView intensity={40} tint="dark" style={{ flex: 1 }} />
            : undefined,
      }}
    >
      <Tabs.Screen
        name="bahce"
        options={{
          title: 'Bahçe',
          tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'leaf' : 'leaf-outline'} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="galeri"
        options={{
          title: 'Motifler',
          tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'sparkles' : 'sparkles-outline'} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="zikirmatik"
        options={{
          title: 'Zikirmatik',
          tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'radio-button-on' : 'ellipse-outline'} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="dua"
        options={{
          title: 'Kardeşlik',
          tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'people' : 'people-outline'} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="analiz"
        options={{
          title: 'Gelişim',
          tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'stats-chart' : 'stats-chart-outline'} focused={focused} />,
        }}
      />
    </Tabs>
  );
}
