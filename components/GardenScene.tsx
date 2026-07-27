import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, RadialGradient, Stop } from 'react-native-svg';
import { colors } from '@/constants/theme';

interface GardenSceneProps {
  level: number; // 0-100
  height?: number;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);

const STAR_POSITIONS: [number, number][] = [
  [30, 30],
  [70, 60],
  [255, 70],
  [200, 20],
  [40, 100],
  [270, 130],
  [110, 25],
  [180, 55],
];

const NUR_PARTICLES = [
  { originX: 150, originY: 140, delay: 0, duration: 4200, drift: -8 },
  { originX: 132, originY: 150, delay: 900, duration: 5000, drift: 10 },
  { originX: 170, originY: 148, delay: 1800, duration: 4600, drift: -14 },
  { originX: 148, originY: 130, delay: 2600, duration: 5400, drift: 6 },
  { originX: 160, originY: 155, delay: 1300, duration: 4800, drift: 14 },
];

function loop(value: Animated.Value, duration: number, easing = Easing.inOut(Easing.sin)) {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(value, { toValue: 1, duration, easing, useNativeDriver: false }),
      Animated.timing(value, { toValue: 0, duration, easing, useNativeDriver: false }),
    ])
  );
}

export default function GardenScene({ level, height = 260 }: GardenSceneProps) {
  const clamped = Math.max(0, Math.min(100, level));
  const bloomCount = Math.round((clamped / 100) * 7);

  const sway = useRef(new Animated.Value(0)).current;
  const breathe = useRef(new Animated.Value(0)).current;
  const shimmer = useRef(new Animated.Value(0)).current;
  const starPulses = useRef(STAR_POSITIONS.map(() => new Animated.Value(Math.random()))).current;
  const particleClocks = useRef(NUR_PARTICLES.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const animations: Animated.CompositeAnimation[] = [
      loop(sway, 3200),
      loop(breathe, 2200, Easing.inOut(Easing.quad)),
      loop(shimmer, 2600, Easing.inOut(Easing.quad)),
    ];
    animations.forEach((a) => a.start());

    const starLoops = starPulses.map((v, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(v, { toValue: 1, duration: 1400 + i * 220, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
          Animated.timing(v, { toValue: 0.2, duration: 1400 + i * 220, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
        ])
      )
    );
    starLoops.forEach((a) => a.start());

    const particleLoops = particleClocks.map((v, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(NUR_PARTICLES[i].delay),
          Animated.timing(v, {
            toValue: 1,
            duration: NUR_PARTICLES[i].duration,
            easing: Easing.out(Easing.quad),
            useNativeDriver: false,
          }),
          Animated.timing(v, { toValue: 0, duration: 0, useNativeDriver: false }),
        ])
      )
    );
    particleLoops.forEach((a) => a.start());

    return () => {
      animations.forEach((a) => a.stop());
      starLoops.forEach((a) => a.stop());
      particleLoops.forEach((a) => a.stop());
    };
  }, [sway, breathe, shimmer, starPulses, particleClocks]);

  const canopyBaseY = 150 - clamped * 0.55;
  const canopyR = 14 + clamped * 0.28;
  const lobeR = 10 + clamped * 0.18;

  const canopyCx = sway.interpolate({ inputRange: [0, 1], outputRange: [146, 154] });
  const leftLobeCx = sway.interpolate({ inputRange: [0, 1], outputRange: [124, 136] });
  const rightLobeCx = sway.interpolate({ inputRange: [0, 1], outputRange: [166, 178] });
  const canopyRAnimated = breathe.interpolate({ inputRange: [0, 1], outputRange: [canopyR, canopyR + 1.4] });
  const shimmerOpacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.18, 0.4] });

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

        {/* twinkling stars */}
        {STAR_POSITIONS.map(([x, y], i) => (
          <AnimatedCircle
            key={i}
            cx={x}
            cy={y}
            r={1.4}
            fill={colors.cream}
            opacity={starPulses[i].interpolate({ inputRange: [0, 1], outputRange: [0.25, 0.95] })}
          />
        ))}

        {/* rolling hills */}
        <Path d="M0,190 Q75,150 150,175 T300,165 L300,260 L0,260 Z" fill="url(#hillGrad)" />
        <Path d="M0,215 Q90,190 150,205 T300,195 L300,260 L0,260 Z" fill={colors.emerald} opacity={0.9} />

        {/* water with shimmer */}
        <Path d="M0,232 Q60,222 120,232 T240,232 T300,228 L300,260 L0,260 Z" fill="url(#waterGrad)" />
        <AnimatedPath
          d="M0,230 Q60,221 120,230 T240,230 T300,226"
          stroke={colors.goldSoft}
          strokeWidth={1}
          fill="none"
          opacity={shimmerOpacity}
        />

        {/* tree trunk */}
        <Path
          d={`M150,210 C148,${190 - clamped * 0.3} 152,${170 - clamped * 0.5} 150,${150 - clamped * 0.6}`}
          stroke="#5B3A22"
          strokeWidth={5}
          fill="none"
          strokeLinecap="round"
        />

        {/* canopy — sways and breathes gently in the wind */}
        <AnimatedCircle cx={canopyCx} cy={canopyBaseY} r={canopyRAnimated} fill={colors.emeraldSoft} opacity={0.9} />
        <AnimatedCircle cx={leftLobeCx} cy={160 - clamped * 0.5} r={lobeR} fill={colors.emerald} opacity={0.85} />
        <AnimatedCircle cx={rightLobeCx} cy={158 - clamped * 0.5} r={lobeR} fill={colors.emerald} opacity={0.85} />

        {blossoms.map((b) => (
          <Circle
            key={b.key}
            cx={b.x}
            cy={b.y}
            r={b.active ? 4.2 : 2}
            fill={b.active ? colors.goldBright : 'rgba(232,201,122,0.25)'}
          />
        ))}

        {/* rising nur particles */}
        {NUR_PARTICLES.map((p, i) => {
          const clock = particleClocks[i];
          const cy = clock.interpolate({ inputRange: [0, 1], outputRange: [p.originY, p.originY - 90] });
          const cx = clock.interpolate({ inputRange: [0, 0.5, 1], outputRange: [p.originX, p.originX + p.drift, p.originX] });
          const opacity = clock.interpolate({ inputRange: [0, 0.15, 0.75, 1], outputRange: [0, 0.85, 0.4, 0] });
          const r = clock.interpolate({ inputRange: [0, 1], outputRange: [2.2, 0.6] });
          return <AnimatedCircle key={i} cx={cx} cy={cy} r={r} fill={colors.goldBright} opacity={opacity} />;
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    borderRadius: 28,
  },
});
