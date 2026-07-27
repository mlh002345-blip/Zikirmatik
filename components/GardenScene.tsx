import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, G, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';
import { colors } from '@/constants/theme';

interface GardenSceneProps {
  level: number; // 0-100
  height?: number;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedPath = Animated.createAnimatedComponent(Path);

// Kept below y≈68 so nothing sits in the band the "slice" crop trims off
// the top on wide/short containers (see preserveAspectRatio on the <Svg>).
const STAR_POSITIONS: [number, number][] = [
  [30, 78],
  [70, 96],
  [255, 100],
  [200, 74],
  [40, 118],
  [270, 138],
  [110, 80],
  [180, 92],
  [15, 100],
  [290, 86],
];

const NUR_PARTICLES = [
  { originX: 150, originY: 135, delay: 0, duration: 4200, drift: -8 },
  { originX: 130, originY: 148, delay: 900, duration: 5000, drift: 10 },
  { originX: 172, originY: 145, delay: 1800, duration: 4600, drift: -14 },
  { originX: 146, originY: 128, delay: 2600, duration: 5400, drift: 6 },
  { originX: 160, originY: 152, delay: 1300, duration: 4800, drift: 14 },
  { originX: 152, originY: 160, delay: 2100, duration: 5200, drift: -6 },
];

// Fixed ground positions — flowers reveal progressively as the garden grows,
// rather than being re-randomized on every render.
const GROUND_FLOWER_SLOTS: { x: number; y: number; hue: 'gold' | 'cream' }[] = [
  { x: 34, y: 202, hue: 'gold' },
  { x: 258, y: 198, hue: 'cream' },
  { x: 66, y: 214, hue: 'cream' },
  { x: 224, y: 210, hue: 'gold' },
  { x: 96, y: 197, hue: 'gold' },
  { x: 196, y: 203, hue: 'cream' },
  { x: 48, y: 222, hue: 'gold' },
  { x: 244, y: 220, hue: 'cream' },
  { x: 116, y: 218, hue: 'cream' },
  { x: 205, y: 224, hue: 'gold' },
  { x: 20, y: 210, hue: 'gold' },
  { x: 278, y: 208, hue: 'cream' },
];

function loop(value: Animated.Value, duration: number, easing = Easing.inOut(Easing.sin)) {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(value, { toValue: 1, duration, easing, useNativeDriver: false }),
      Animated.timing(value, { toValue: 0, duration, easing, useNativeDriver: false }),
    ])
  );
}

function Flower({
  cx,
  cy,
  scale = 1,
  petalColor,
  centerColor,
  opacity = 1,
}: {
  cx: number;
  cy: number;
  scale?: number;
  petalColor: string;
  centerColor: string;
  opacity?: number;
}) {
  const petalR = 2.1 * scale;
  const orbit = 2.6 * scale;
  const petals = Array.from({ length: 5 }).map((_, i) => {
    const angle = (i / 5) * Math.PI * 2;
    return { x: cx + Math.cos(angle) * orbit, y: cy + Math.sin(angle) * orbit };
  });
  return (
    <G opacity={opacity}>
      {petals.map((p, i) => (
        <Circle key={i} cx={p.x} cy={p.y} r={petalR} fill={petalColor} />
      ))}
      <Circle cx={cx} cy={cy} r={1.4 * scale} fill={centerColor} />
    </G>
  );
}

export default function GardenScene({ level, height = 260 }: GardenSceneProps) {
  const clamped = Math.max(0, Math.min(100, level));
  const growth = clamped / 100;
  const bloomCount = Math.round(growth * 7);
  const groundFlowerCount = Math.round(2 + growth * (GROUND_FLOWER_SLOTS.length - 2));

  const sway = useRef(new Animated.Value(0)).current;
  const breathe = useRef(new Animated.Value(0)).current;
  const shimmer = useRef(new Animated.Value(0)).current;
  const haloPulse = useRef(new Animated.Value(0)).current;
  const starPulses = useRef(STAR_POSITIONS.map(() => new Animated.Value(Math.random()))).current;
  const particleClocks = useRef(NUR_PARTICLES.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const animations: Animated.CompositeAnimation[] = [
      loop(sway, 3200),
      loop(breathe, 2200, Easing.inOut(Easing.quad)),
      loop(shimmer, 2600, Easing.inOut(Easing.quad)),
      loop(haloPulse, 2800, Easing.inOut(Easing.quad)),
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
  }, [sway, breathe, shimmer, haloPulse, starPulses, particleClocks]);

  const canopyBaseY = 152 - growth * 62;
  const canopyR = 16 + growth * 30;
  const lobeR = 11 + growth * 20;

  const canopyCx = sway.interpolate({ inputRange: [0, 1], outputRange: [146, 154] });
  const leftLobeCx = sway.interpolate({ inputRange: [0, 1], outputRange: [122, 134] });
  const rightLobeCx = sway.interpolate({ inputRange: [0, 1], outputRange: [166, 178] });
  const topLobeCx = sway.interpolate({ inputRange: [0, 1], outputRange: [144, 156] });
  const canopyRAnimated = breathe.interpolate({ inputRange: [0, 1], outputRange: [canopyR, canopyR + 1.6] });
  const shimmerOpacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.2, 0.48] });
  const haloOpacity = haloPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.25 + growth * 0.35, 0.4 + growth * 0.45],
  });
  const haloR = 30 + growth * 60;

  const treeBlossoms = Array.from({ length: 7 }).map((_, i) => {
    const angle = (i / 7) * Math.PI * 1.5 - Math.PI * 0.2;
    const radius = 26 + (i % 3) * 6;
    const x = 150 + Math.cos(angle + Math.PI) * radius * 0.9;
    const y = canopyBaseY + Math.sin(angle) * radius * 0.6 - 4;
    return { x, y, active: i < bloomCount, key: i };
  });

  return (
    <View style={[styles.container, { height }]}>
      <Svg width="100%" height={height} viewBox="0 0 300 260" preserveAspectRatio="xMidYMax slice">
        <Defs>
          <LinearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#08201A" />
            <Stop offset="0.55" stopColor="#0D3327" />
            <Stop offset="1" stopColor={colors.emerald} />
          </LinearGradient>
          <RadialGradient id="moonGlow" cx="76%" cy="16%" r="42%">
            <Stop offset="0" stopColor={colors.goldSoft} stopOpacity={0.4} />
            <Stop offset="1" stopColor={colors.goldSoft} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="nurHalo" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={colors.goldBright} stopOpacity={0.55} />
            <Stop offset="0.6" stopColor={colors.gold} stopOpacity={0.18} />
            <Stop offset="1" stopColor={colors.gold} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="canopyGrad" cx="42%" cy="35%" r="65%">
            <Stop offset="0" stopColor="#4A9A76" />
            <Stop offset="0.55" stopColor={colors.emeraldSoft} />
            <Stop offset="1" stopColor="#123D2E" />
          </RadialGradient>
          <LinearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#2F6E56" stopOpacity={0.65} />
            <Stop offset="1" stopColor={colors.emerald} stopOpacity={0.95} />
          </LinearGradient>
          <LinearGradient id="hillGradFar" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#173F30" />
            <Stop offset="1" stopColor="#0A2B20" />
          </LinearGradient>
          <LinearGradient id="hillGradNear" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#215239" />
            <Stop offset="1" stopColor="#153B2B" />
          </LinearGradient>
        </Defs>

        <Rect x={0} y={0} width={300} height={260} fill="url(#skyGrad)" />

        {/* crescent moon */}
        <Circle cx={230} cy={78} r={85} fill="url(#moonGlow)" />
        <Circle cx={228} cy={76} r={15} fill={colors.goldSoft} />
        <Circle cx={234} cy={71} r={13.5} fill="#0D3327" />

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
        <Path d="M0,190 Q75,150 150,175 T300,165 L300,260 L0,260 Z" fill="url(#hillGradFar)" />
        <Path d="M0,215 Q90,188 150,203 T300,193 L300,260 L0,260 Z" fill="url(#hillGradNear)" />

        {/* river of light beneath the garden */}
        <Path d="M0,232 Q60,222 120,232 T240,232 T300,228 L300,260 L0,260 Z" fill="url(#waterGrad)" />
        <AnimatedPath
          d="M0,230 Q60,221 120,230 T240,230 T300,226"
          stroke={colors.goldSoft}
          strokeWidth={1.1}
          fill="none"
          opacity={shimmerOpacity}
        />
        <AnimatedPath
          d="M0,236 Q70,229 130,236 T260,235 T300,233"
          stroke={colors.cream}
          strokeWidth={0.7}
          fill="none"
          opacity={shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.1, 0.22] })}
        />

        {/* ground flowers — bloom in number as dhikr accumulates */}
        {GROUND_FLOWER_SLOTS.slice(0, groundFlowerCount).map((f, i) => (
          <Flower
            key={i}
            cx={f.x}
            cy={f.y}
            scale={0.85 + growth * 0.4}
            petalColor={f.hue === 'gold' ? colors.goldBright : colors.cream}
            centerColor={colors.gold}
          />
        ))}

        {/* nur halo behind the tree — glows brighter as the garden matures */}
        <AnimatedCircle cx={150} cy={canopyBaseY} r={haloR} fill="url(#nurHalo)" opacity={haloOpacity} />

        {/* tree trunk */}
        <Path
          d={`M150,${212 - growth * 4} C148,${192 - growth * 26} 152,${172 - growth * 46} 150,${canopyBaseY + canopyR * 0.3}`}
          stroke="#5B3A22"
          strokeWidth={4 + growth * 2.5}
          fill="none"
          strokeLinecap="round"
        />

        {/* canopy — sways and breathes gently in the wind */}
        <AnimatedCircle cx={canopyCx} cy={canopyBaseY} r={canopyRAnimated} fill="url(#canopyGrad)" opacity={0.95} />
        <AnimatedCircle cx={leftLobeCx} cy={canopyBaseY + 12} r={lobeR} fill="url(#canopyGrad)" opacity={0.9} />
        <AnimatedCircle cx={rightLobeCx} cy={canopyBaseY + 10} r={lobeR} fill="url(#canopyGrad)" opacity={0.9} />
        <AnimatedCircle cx={topLobeCx} cy={canopyBaseY - 16} r={lobeR * 0.75} fill="url(#canopyGrad)" opacity={0.9} />

        {treeBlossoms.map((b) => (
          <Flower
            key={b.key}
            cx={b.x}
            cy={b.y}
            scale={b.active ? 1 : 0.55}
            petalColor={b.active ? colors.goldBright : 'rgba(232,201,122,0.3)'}
            centerColor={b.active ? '#FFF6DC' : 'rgba(255,246,220,0.3)'}
          />
        ))}

        {/* rising nur particles */}
        {NUR_PARTICLES.map((p, i) => {
          const clock = particleClocks[i];
          const cy = clock.interpolate({ inputRange: [0, 1], outputRange: [p.originY, p.originY - 95] });
          const cx = clock.interpolate({ inputRange: [0, 0.5, 1], outputRange: [p.originX, p.originX + p.drift, p.originX] });
          const opacity = clock.interpolate({
            inputRange: [0, 0.15, 0.75, 1],
            outputRange: [0, 0.5 + growth * 0.4, 0.25 + growth * 0.2, 0],
          });
          const r = clock.interpolate({ inputRange: [0, 1], outputRange: [2.4, 0.6] });
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
