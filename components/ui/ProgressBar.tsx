import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius } from '@/constants/theme';

interface ProgressBarProps {
  progress: number; // 0..1
  height?: number;
  trackColor?: string;
}

export default function ProgressBar({ progress, height = 8, trackColor }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(1, progress));
  return (
    <View style={[styles.track, { height, backgroundColor: trackColor ?? colors.hairline, borderRadius: height / 2 }]}>
      <LinearGradient
        colors={[colors.goldBright, colors.gold]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ width: `${clamped * 100}%`, height, borderRadius: height / 2 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
  },
});
