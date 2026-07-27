import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, LinearGradient, Path, RadialGradient, Stop } from 'react-native-svg';
import { colors } from '@/constants/theme';

interface GardenSceneProps {
  level: number; // 0-100
  height?: number;
}

const AnimatedG = Animated.createAnimatedComponent(View);

export default function GardenScene({ level, height = 260 }: GardenSceneProps) {
  const clamped = Math.max(0, Math.min(100, level));
  const bloomCount = Math.round((clamped / 100) * 7);
  const sway = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(sway, { toValue: 1, duration: 3200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(sway, { toValue: 0, duration: 3200, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, { toValue: 1, duration: 2400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(glow, { toValue: 0, duration: 2400, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    ).start();
  }, [sway, glow]);

  const rotate = sway.interpolate({ inputRange: [0, 1], outputRange: ['-1.5deg', '1.5deg'] });
  const opacity = glow.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] });

  const blossoms = Array.from({ length: 7 }).map((_, i) => {
    const angle = (i / 7) * Math.PI * 1.3 - Math.PI * 0.15;
    const radius = 70 - (i % 3) * 8;
    const x = 150 + Math.cos(angle + Math.PI) * radius * 0.9;
    const y = 90 + Math.sin(angle) * radius * 0.55 - 10;
    return { x, y, active: i < bloomCount, key: i };
  });

  return (
    <View style={[styles.container, { height }]}>
      <Svg width="100%" height={height} viewBox="0 0 300 260" preserveAspectRatio="xMidYMax slice">
        <Defs>
          <RadialGradient id="moonGlow" cx="50%" cy="20%" r="60%">
            <Stop offset="0" stopColor={colors.goldSoft} stopOpacity={0.35} />
            <Stop offset="1" stopColor={colors.goldSoft} stopOpacity={0} />
          </RadialGradient>
          <LinearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.emeraldSoft} stopOpacity={0.5} />
            <Stop offset="1" stopColor={colors.emerald} stopOpacity={0.9} />
          </LinearGradient>
          <LinearGradient id="hillGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#173F30" />
            <Stop offset="1" stopColor="#0A2B20" />
          </LinearGradient>
        </Defs>

        <Circle cx={150} cy={40} r={90} fill="url(#moonGlow)" />
        <Circle cx={225} cy={38} r={16} fill={colors.goldSoft} opacity={0.9} />

        {/* stars */}
        {[[30, 30], [70, 60], [255, 70], [200, 20], [40, 100], [270, 130]].map(([x, y], i) => (
          <Circle key={i} cx={x} cy={y} r={1.4} fill={colors.cream} opacity={0.6} />
        ))}

        {/* rolling hills */}
        <Path d="M0,190 Q75,150 150,175 T300,165 L300,260 L0,260 Z" fill="url(#hillGrad)" />
        <Path d="M0,215 Q90,190 150,205 T300,195 L300,260 L0,260 Z" fill={colors.emerald} opacity={0.9} />

        {/* water */}
        <Path d="M0,232 Q60,222 120,232 T240,232 T300,228 L300,260 L0,260 Z" fill="url(#waterGrad)" />

        {/* tree trunk */}
        <Path
          d={`M150,210 C148,${190 - clamped * 0.3} 152,${170 - clamped * 0.5} 150,${150 - clamped * 0.6}`}
          stroke="#5B3A22"
          strokeWidth={5}
          fill="none"
          strokeLinecap="round"
        />

        {/* canopy circles scale with level */}
        <Circle cx={150} cy={150 - clamped * 0.55} r={14 + clamped * 0.28} fill={colors.emeraldSoft} opacity={0.9} />
        <Circle cx={130} cy={160 - clamped * 0.5} r={10 + clamped * 0.18} fill={colors.emerald} opacity={0.85} />
        <Circle cx={172} cy={158 - clamped * 0.5} r={10 + clamped * 0.18} fill={colors.emerald} opacity={0.85} />

        {blossoms.map((b) => (
          <Circle
            key={b.key}
            cx={b.x}
            cy={b.y}
            r={b.active ? 4.2 : 2}
            fill={b.active ? colors.goldBright : 'rgba(232,201,122,0.25)'}
          />
        ))}
      </Svg>

      <Animated.View pointerEvents="none" style={[styles.glowOverlay, { opacity, transform: [{ rotate }] }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: 28,
  },
  glowOverlay: {
    position: 'absolute',
    top: 10,
    left: 90,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'transparent',
  },
});
