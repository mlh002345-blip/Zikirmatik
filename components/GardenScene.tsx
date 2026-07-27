import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';
import { colors } from '@/constants/theme';

interface GardenSceneProps {
  level: number; // 0-100
  height?: number;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedEllipse = Animated.createAnimatedComponent(Ellipse);
const AnimatedPath = Animated.createAnimatedComponent(Path);

const CENTER_X = 150;
const CENTER_Y = 168;

// A single, graceful pointed petal — base at the origin, tip pointing up.
// One smooth silhouette reads far more clearly at small scale than a
// multi-lobed shape, which is why every ring reuses this one form.
function petalPath(length: number, width: number) {
  const w = width;
  const l = length;
  return [
    `M0,0`,
    `C ${-w},${-l * 0.16} ${-w * 0.92},${-l * 0.56} ${-w * 0.18},${-l * 0.86}`,
    `C ${-w * 0.06},${-l * 0.94} ${-w * 0.02},${-l * 0.98} 0,${-l}`,
    `C ${w * 0.02},${-l * 0.98} ${w * 0.06},${-l * 0.94} ${w * 0.18},${-l * 0.86}`,
    `C ${w * 0.92},${-l * 0.56} ${w},${-l * 0.16} 0,0`,
    'Z',
  ].join(' ');
}

interface RingConfig {
  threshold: number; // growth (0-1) at which this ring starts blooming
  fullAt: number; // growth (0-1) at which this ring is fully bloomed
  radius: number;
  count: number;
  length: number;
  width: number;
  rotation: number;
  gradientId: string;
}

const RINGS: RingConfig[] = [
  { threshold: 0, fullAt: 0.12, radius: 11, count: 6, length: 10, width: 3.2, rotation: 0, gradientId: 'ring1' },
  { threshold: 0.1, fullAt: 0.3, radius: 19, count: 8, length: 12.5, width: 3.7, rotation: 22.5, gradientId: 'ring2' },
  { threshold: 0.3, fullAt: 0.55, radius: 28, count: 10, length: 14.5, width: 4.3, rotation: 18, gradientId: 'ring3' },
  { threshold: 0.55, fullAt: 0.78, radius: 38, count: 12, length: 16.5, width: 4.8, rotation: 15, gradientId: 'ring4' },
  { threshold: 0.78, fullAt: 1, radius: 48, count: 14, length: 18.5, width: 5.3, rotation: 12.86, gradientId: 'ring5' },
];

const STAR_POSITIONS: { x: number; y: number; hero?: boolean }[] = [
  { x: 235, y: 78, hero: true },
  { x: 68, y: 92 },
  { x: 200, y: 100 },
  { x: 42, y: 140 },
  { x: 268, y: 120, hero: true },
  { x: 100, y: 76 },
  { x: 20, y: 108 },
  { x: 285, y: 158 },
];

const NUR_PARTICLES = [
  { originX: 150, originY: 150, delay: 0, duration: 4400, drift: -10 },
  { originX: 128, originY: 160, delay: 900, duration: 5000, drift: 12 },
  { originX: 174, originY: 158, delay: 1800, duration: 4700, drift: -14 },
  { originX: 150, originY: 130, delay: 2600, duration: 5400, drift: 6 },
  { originX: 160, originY: 168, delay: 1300, duration: 4900, drift: 14 },
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
  const growth = clamped / 100;

  const breathe = useRef(new Animated.Value(0)).current;
  const shimmer = useRef(new Animated.Value(0)).current;
  const haloPulse = useRef(new Animated.Value(0)).current;
  const corePulse = useRef(new Animated.Value(0)).current;
  const starPulses = useRef(STAR_POSITIONS.map(() => new Animated.Value(Math.random()))).current;
  const petalShimmer = useRef(RINGS.map(() => new Animated.Value(Math.random()))).current;
  const particleClocks = useRef(NUR_PARTICLES.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const animations: Animated.CompositeAnimation[] = [
      loop(breathe, 2600, Easing.inOut(Easing.quad)),
      loop(shimmer, 3200, Easing.inOut(Easing.quad)),
      loop(haloPulse, 3000, Easing.inOut(Easing.quad)),
      loop(corePulse, 1900, Easing.inOut(Easing.quad)),
    ];
    animations.forEach((a) => a.start());

    const starLoops = starPulses.map((v, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(v, { toValue: 1, duration: 1500 + i * 210, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
          Animated.timing(v, { toValue: 0.2, duration: 1500 + i * 210, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
        ])
      )
    );
    starLoops.forEach((a) => a.start());

    const petalLoops = petalShimmer.map((v, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(v, { toValue: 1, duration: 2600 + i * 340, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
          Animated.timing(v, { toValue: 0.3, duration: 2600 + i * 340, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
        ])
      )
    );
    petalLoops.forEach((a) => a.start());

    const particleLoops = particleClocks.map((v, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(NUR_PARTICLES[i].delay),
          Animated.timing(v, { toValue: 1, duration: NUR_PARTICLES[i].duration, easing: Easing.out(Easing.quad), useNativeDriver: false }),
          Animated.timing(v, { toValue: 0, duration: 0, useNativeDriver: false }),
        ])
      )
    );
    particleLoops.forEach((a) => a.start());

    return () => {
      animations.forEach((a) => a.stop());
      starLoops.forEach((a) => a.stop());
      petalLoops.forEach((a) => a.stop());
      particleLoops.forEach((a) => a.stop());
    };
  }, [breathe, shimmer, haloPulse, corePulse, starPulses, petalShimmer, particleClocks]);

  const breatheTransform = breathe.interpolate({ inputRange: [0, 1], outputRange: ['scale(1)', 'scale(1.018)'] });
  const haloOpacity = haloPulse.interpolate({ inputRange: [0, 1], outputRange: [0.3 + growth * 0.3, 0.42 + growth * 0.38] });
  const haloR = 46 + growth * 60;
  const coreR = corePulse.interpolate({ inputRange: [0, 1], outputRange: [7 + growth * 4, 8.6 + growth * 4] });
  const poolOpacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.22, 0.4] });
  const poolRy = shimmer.interpolate({ inputRange: [0, 1], outputRange: [9, 11] });

  return (
    <View style={[styles.container, { height }]}>
      <Svg width="100%" height={height} viewBox="0 0 300 260" preserveAspectRatio="xMidYMax slice">
        <Defs>
          <LinearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#050F0C" />
            <Stop offset="0.5" stopColor="#0A2620" />
            <Stop offset="1" stopColor="#123B2C" />
          </LinearGradient>
          <RadialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={colors.goldSoft} stopOpacity={0.4} />
            <Stop offset="1" stopColor={colors.goldSoft} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="nurHalo" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={colors.goldBright} stopOpacity={0.5} />
            <Stop offset="0.5" stopColor={colors.gold} stopOpacity={0.16} />
            <Stop offset="1" stopColor={colors.gold} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor="#FFFBEF" />
            <Stop offset="0.5" stopColor={colors.goldBright} />
            <Stop offset="1" stopColor={colors.gold} stopOpacity={0.7} />
          </RadialGradient>
          <RadialGradient id="poolGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={colors.goldSoft} stopOpacity={0.55} />
            <Stop offset="1" stopColor={colors.goldSoft} stopOpacity={0} />
          </RadialGradient>

          {/* petal ring gradients — deep jade at the core, warming outward
              into gold and finally radiant near-white light */}
          <RadialGradient id="ring1" cx="50%" cy="12%" r="90%">
            <Stop offset="0" stopColor="#2E7A55" />
            <Stop offset="1" stopColor="#164430" />
          </RadialGradient>
          <RadialGradient id="ring2" cx="50%" cy="12%" r="90%">
            <Stop offset="0" stopColor="#4A9A70" />
            <Stop offset="1" stopColor="#215C40" />
          </RadialGradient>
          <RadialGradient id="ring3" cx="50%" cy="12%" r="90%">
            <Stop offset="0" stopColor="#8FBE86" />
            <Stop offset="1" stopColor="#3E8A61" />
          </RadialGradient>
          <RadialGradient id="ring4" cx="50%" cy="12%" r="90%">
            <Stop offset="0" stopColor={colors.goldSoft} />
            <Stop offset="1" stopColor={colors.gold} />
          </RadialGradient>
          <RadialGradient id="ring5" cx="50%" cy="12%" r="90%">
            <Stop offset="0" stopColor="#FFFBEF" />
            <Stop offset="1" stopColor={colors.goldBright} />
          </RadialGradient>
        </Defs>

        <Rect x={0} y={0} width={300} height={260} fill="url(#skyGrad)" />

        {/* crescent moon */}
        <Circle cx={236} cy={80} r={62} fill="url(#moonGlow)" />
        <Circle cx={234} cy={78} r={13} fill={colors.goldSoft} />
        <Circle cx={239} cy={73.5} r={11.7} fill="#0A2620" />

        {/* stars, two with a soft sparkle halo */}
        {STAR_POSITIONS.map((s, i) => (
          <React.Fragment key={i}>
            {s.hero ? <Circle cx={s.x} cy={s.y} r={7} fill={colors.goldSoft} opacity={0.14} /> : null}
            <AnimatedCircle
              cx={s.x}
              cy={s.y}
              r={s.hero ? 1.8 : 1.2}
              fill={colors.cream}
              opacity={starPulses[i].interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.95] })}
            />
          </React.Fragment>
        ))}

        {/* reflection pool of light beneath the mandala */}
        <AnimatedEllipse cx={CENTER_X} cy={228} rx={54} ry={poolRy} fill="url(#poolGlow)" opacity={poolOpacity} />
        <Path
          d={`M${CENTER_X - 70},228 Q${CENTER_X},236 ${CENTER_X + 70},228`}
          stroke={colors.goldSoft}
          strokeWidth={0.6}
          opacity={0.22}
          fill="none"
        />

        {/* halo behind the mandala — brighter as the garden matures */}
        <AnimatedCircle cx={CENTER_X} cy={CENTER_Y} r={haloR} fill="url(#nurHalo)" opacity={haloOpacity} />

        {/* the mandala of light — rings bloom outward as dhikr accumulates */}
        <G transform={`translate(${CENTER_X} ${CENTER_Y})`}>
          <AnimatedG transform={breatheTransform}>
            {RINGS.map((ring, ringIndex) => {
              const span = ring.fullAt - ring.threshold;
              const reveal = span > 0 ? Math.max(0, Math.min(1, (growth - ring.threshold) / span)) : growth >= ring.threshold ? 1 : 0;
              if (reveal <= 0) return null;
              const eased = reveal * reveal * (3 - 2 * reveal); // smoothstep
              const d = petalPath(ring.length * (0.35 + 0.65 * eased), ring.width);
              return (
                <G key={ring.gradientId} opacity={eased}>
                  {Array.from({ length: ring.count }).map((_, i) => {
                    const angle = ring.rotation + (i / ring.count) * 360;
                    return (
                      <G key={i} transform={`rotate(${angle}) translate(0 ${-ring.radius * (0.55 + 0.45 * eased)})`}>
                        <AnimatedPath
                          d={d}
                          fill={`url(#${ring.gradientId})`}
                          opacity={petalShimmer[(ringIndex + i) % petalShimmer.length].interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.82, 1],
                          })}
                        />
                      </G>
                    );
                  })}
                </G>
              );
            })}

            {/* the seed of light at the very centre */}
            <AnimatedCircle cx={0} cy={0} r={coreR} fill="url(#coreGlow)" />
            <Circle cx={0} cy={0} r={2.2} fill="#FFFEF9" />
          </AnimatedG>
        </G>

        {/* rising nur particles */}
        {NUR_PARTICLES.map((p, i) => {
          const clock = particleClocks[i];
          const cy = clock.interpolate({ inputRange: [0, 1], outputRange: [p.originY, p.originY - 100] });
          const cx = clock.interpolate({ inputRange: [0, 0.5, 1], outputRange: [p.originX, p.originX + p.drift, p.originX] });
          const coreOpacity = clock.interpolate({
            inputRange: [0, 0.15, 0.75, 1],
            outputRange: [0, 0.55 + growth * 0.35, 0.25 + growth * 0.2, 0],
          });
          const glowOpacity = clock.interpolate({
            inputRange: [0, 0.15, 0.75, 1],
            outputRange: [0, (0.55 + growth * 0.35) * 0.35, (0.25 + growth * 0.2) * 0.35, 0],
          });
          const r = clock.interpolate({ inputRange: [0, 1], outputRange: [2.3, 0.6] });
          return (
            <React.Fragment key={i}>
              <AnimatedCircle cx={cx} cy={cy} r={Animated.multiply(r, 2.6)} fill={colors.goldBright} opacity={glowOpacity} />
              <AnimatedCircle cx={cx} cy={cy} r={r} fill={colors.goldBright} opacity={coreOpacity} />
            </React.Fragment>
          );
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
