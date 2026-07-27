import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, G, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';
import { colors } from '@/constants/theme';

interface GardenSceneProps {
  level: number; // 0-100
  height?: number;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedG = Animated.createAnimatedComponent(G);
const AnimatedPath = Animated.createAnimatedComponent(Path);

type Pt = { x: number; y: number };

// Smooth closed Catmull-Rom spline through a ring of points — genuinely
// rounded foliage silhouettes, no facets.
function smoothClosedPath(pts: Pt[]) {
  const n = pts.length;
  const at = (i: number) => pts[(i + n) % n];
  let d = `M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)} `;
  for (let i = 0; i < n; i++) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += `C ${c1.x.toFixed(2)} ${c1.y.toFixed(2)} ${c2.x.toFixed(2)} ${c2.y.toFixed(2)} ${p2.x.toFixed(2)} ${p2.y.toFixed(2)} `;
  }
  return d + 'Z';
}

function cloudPath(R: number, squash = 0.86) {
  const radiusFactors = [1, 0.95, 1.05, 0.93, 1.06, 0.96, 1.04, 0.94, 1.05, 0.97, 1.03, 0.92, 1.06, 0.95, 1.04, 0.93];
  const pts: Pt[] = radiusFactors.map((rf, i) => {
    const angle = (i / radiusFactors.length) * Math.PI * 2;
    return { x: Math.cos(angle) * R * rf, y: Math.sin(angle) * R * rf * squash };
  });
  return smoothClosedPath(pts);
}

// A single graceful petal — base at the origin, tip pointing up.
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

function FlowerHead({
  x,
  y,
  scale = 1,
  color,
  opacity = 1,
}: {
  x: number;
  y: number;
  scale?: number;
  color: string;
  opacity?: number;
}) {
  const d = petalPath(3.6, 1.4);
  return (
    <G transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
      <Path d="M0,0 L0,3" stroke="#3F6B4E" strokeWidth={0.5} />
      {Array.from({ length: 5 }).map((_, i) => (
        <G key={i} transform={`rotate(${(i / 5) * 360})`}>
          <Path d={d} fill={color} />
        </G>
      ))}
      <Circle cx={0} cy={0} r={0.85} fill="#FFF8E4" />
    </G>
  );
}

function Bush({ x, y, r, opacity = 1 }: { x: number; y: number; r: number; opacity?: number }) {
  return (
    <G transform={`translate(${x} ${y})`} opacity={opacity}>
      <Path d={cloudPath(r, 0.78)} fill="url(#bushGrad)" />
      <G transform={`translate(${-r * 0.28} ${-r * 0.32})`}>
        <Path d={cloudPath(r * 0.42, 0.78)} fill="#8FD3A8" opacity={0.28} />
      </G>
    </G>
  );
}

function GrassTuft({ x, y, scale = 1, opacity = 1 }: { x: number; y: number; scale?: number; opacity?: number }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
      <Path d="M0,0 Q-2,-5 -3.4,-8.2" stroke="#3E7A52" strokeWidth={0.8} fill="none" strokeLinecap="round" />
      <Path d="M0,0 Q0,-6.5 0.2,-10" stroke="#4E8F62" strokeWidth={0.8} fill="none" strokeLinecap="round" />
      <Path d="M0,0 Q2,-5 3.4,-8.2" stroke="#3E7A52" strokeWidth={0.8} fill="none" strokeLinecap="round" />
    </G>
  );
}

type SlotType = 'bush' | 'flower' | 'grass';
type Hue = 'gold' | 'cream' | 'rose' | 'jade';

interface GardenSlot {
  x: number;
  y: number;
  type: SlotType;
  hue: Hue;
  size: number;
  threshold: number; // growth (0-1) at which this plant sprouts
  depth: 'back' | 'front';
}

function hueColor(hue: Hue) {
  switch (hue) {
    case 'gold':
      return colors.goldBright;
    case 'rose':
      return '#D9A6A0';
    case 'jade':
      return colors.emeraldSoft;
    default:
      return colors.cream;
  }
}

// A full garden bed of individually-revealed plants — spread across two
// depth bands so the scene has real perspective, not a single centred icon.
// Thresholds are derived from array order (not hand-tuned per slot) so the
// garden keeps visibly filling in across the *entire* 0→100% range, right
// up to full bloom, instead of maxing out early.
const GARDEN_SLOTS: GardenSlot[] = (
  [
    { x: 118, y: 205, type: 'grass', hue: 'jade', size: 0.9, depth: 'back' },
    { x: 46, y: 200, type: 'grass', hue: 'jade', size: 1, depth: 'back' },
    { x: 255, y: 200, type: 'grass', hue: 'jade', size: 1, depth: 'back' },
    { x: 18, y: 206, type: 'bush', hue: 'jade', size: 9, depth: 'back' },
    { x: 182, y: 204, type: 'grass', hue: 'jade', size: 0.9, depth: 'back' },
    { x: 70, y: 210, type: 'bush', hue: 'jade', size: 7, depth: 'back' },
    { x: 230, y: 209, type: 'bush', hue: 'jade', size: 8, depth: 'back' },
    { x: 95, y: 198, type: 'flower', hue: 'gold', size: 0.85, depth: 'back' },
    { x: 205, y: 197, type: 'flower', hue: 'cream', size: 0.85, depth: 'back' },
    { x: 280, y: 208, type: 'bush', hue: 'jade', size: 7, depth: 'back' },
    { x: 150, y: 250, type: 'grass', hue: 'jade', size: 1.1, depth: 'front' },
    { x: 58, y: 226, type: 'grass', hue: 'jade', size: 1.2, depth: 'front' },
    { x: 12, y: 232, type: 'bush', hue: 'jade', size: 11, depth: 'front' },
    { x: 244, y: 226, type: 'grass', hue: 'jade', size: 1.2, depth: 'front' },
    { x: 22, y: 248, type: 'grass', hue: 'jade', size: 1.1, depth: 'front' },
    { x: 34, y: 240, type: 'flower', hue: 'rose', size: 1.05, depth: 'front' },
    { x: 100, y: 230, type: 'bush', hue: 'jade', size: 10, depth: 'front' },
    { x: 278, y: 250, type: 'grass', hue: 'jade', size: 1.1, depth: 'front' },
    { x: 200, y: 230, type: 'bush', hue: 'jade', size: 10, depth: 'front' },
    { x: 78, y: 244, type: 'flower', hue: 'gold', size: 1.1, depth: 'front' },
    { x: 122, y: 246, type: 'flower', hue: 'cream', size: 1.05, depth: 'front' },
    { x: 222, y: 244, type: 'flower', hue: 'gold', size: 1.1, depth: 'front' },
    { x: 178, y: 246, type: 'flower', hue: 'rose', size: 1.05, depth: 'front' },
    { x: 266, y: 240, type: 'flower', hue: 'cream', size: 1.05, depth: 'front' },
    { x: 288, y: 234, type: 'bush', hue: 'jade', size: 9, depth: 'front' },
  ] as Omit<GardenSlot, 'threshold'>[]
).map((s, i, arr) => ({ ...s, threshold: (i / (arr.length - 1)) * 0.92 }));

const STAR_POSITIONS: { x: number; y: number; hero?: boolean }[] = [
  { x: 235, y: 76, hero: true },
  { x: 70, y: 90 },
  { x: 198, y: 98 },
  { x: 40, y: 130 },
  { x: 270, y: 112, hero: true },
  { x: 100, y: 74 },
  { x: 18, y: 102 },
];

const NUR_PARTICLES = [
  { originX: 150, originY: 168, delay: 0, duration: 4400, drift: -10 },
  { originX: 132, originY: 176, delay: 900, duration: 5000, drift: 12 },
  { originX: 168, originY: 174, delay: 1800, duration: 4700, drift: -14 },
  { originX: 150, originY: 150, delay: 2600, duration: 5400, drift: 6 },
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

  const sway = useRef(new Animated.Value(0)).current;
  const breathe = useRef(new Animated.Value(0)).current;
  const haloPulse = useRef(new Animated.Value(0)).current;
  const starPulses = useRef(STAR_POSITIONS.map(() => new Animated.Value(Math.random()))).current;
  const particleClocks = useRef(NUR_PARTICLES.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const animations: Animated.CompositeAnimation[] = [
      loop(sway, 3400),
      loop(breathe, 2400, Easing.inOut(Easing.quad)),
      loop(haloPulse, 2800, Easing.inOut(Easing.quad)),
    ];
    animations.forEach((a) => a.start());

    const starLoops = starPulses.map((v, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(v, { toValue: 1, duration: 1500 + i * 220, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
          Animated.timing(v, { toValue: 0.2, duration: 1500 + i * 220, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
        ])
      )
    );
    starLoops.forEach((a) => a.start());

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
      particleLoops.forEach((a) => a.stop());
    };
  }, [sway, breathe, haloPulse, starPulses, particleClocks]);

  const canopyCx = 150;
  const canopyCy = 158 - growth * 34;
  const canopyR = 18 + growth * 20;
  const trunkTopY = canopyCy + canopyR * 0.4;
  const trunkBaseY = 214;

  const swayTransform = sway.interpolate({ inputRange: [0, 1], outputRange: ['translate(-3,0)', 'translate(3,0)'] });
  const breatheTransform = breathe.interpolate({ inputRange: [0, 1], outputRange: ['scale(1)', 'scale(1.025)'] });
  const haloOpacity = haloPulse.interpolate({ inputRange: [0, 1], outputRange: [0.25 + growth * 0.3, 0.38 + growth * 0.35] });
  const haloR = 26 + growth * 46;

  const canopyOutline = cloudPath(canopyR);
  const canopyHighlight = cloudPath(canopyR * 0.48);
  const canopyShadow = cloudPath(canopyR * 0.52);

  const treeBlossomCount = Math.round(growth * 6);
  const treeBlossoms = Array.from({ length: 6 }).map((_, i) => {
    const angle = (i / 6) * Math.PI * 2 + 0.4;
    const r = canopyR * 0.68;
    return {
      x: Math.cos(angle) * r,
      y: Math.sin(angle) * r * 0.85,
      active: i < treeBlossomCount,
      hue: (['gold', 'cream', 'rose'] as const)[i % 3],
      key: i,
    };
  });

  const visibleBack = GARDEN_SLOTS.filter((s) => s.depth === 'back' && growth >= s.threshold);
  const visibleFront = GARDEN_SLOTS.filter((s) => s.depth === 'front' && growth >= s.threshold);
  const lushness = 0.75 + growth * 0.35;

  const renderSlot = (s: GardenSlot, i: number) => {
    const scale = s.size * lushness;
    if (s.type === 'bush') return <Bush key={i} x={s.x} y={s.y} r={scale} />;
    if (s.type === 'flower') return <FlowerHead key={i} x={s.x} y={s.y} scale={scale} color={hueColor(s.hue)} />;
    return <GrassTuft key={i} x={s.x} y={s.y} scale={scale} />;
  };

  return (
    <View style={[styles.container, { height }]}>
      <Svg width="100%" height={height} viewBox="0 0 300 260" preserveAspectRatio="xMidYMax slice">
        <Defs>
          <LinearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#061A15" />
            <Stop offset="0.5" stopColor="#0D3327" />
            <Stop offset="1" stopColor="#1B4C38" />
          </LinearGradient>
          <LinearGradient id="groundGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#1F5038" />
            <Stop offset="1" stopColor="#0E3527" />
          </LinearGradient>
          <RadialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={colors.goldSoft} stopOpacity={0.4} />
            <Stop offset="1" stopColor={colors.goldSoft} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="nurHalo" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={colors.goldBright} stopOpacity={0.55} />
            <Stop offset="0.55" stopColor={colors.gold} stopOpacity={0.18} />
            <Stop offset="1" stopColor={colors.gold} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="canopyGrad" cx="38%" cy="30%" r="72%">
            <Stop offset="0" stopColor="#5CAA80" />
            <Stop offset="0.5" stopColor={colors.emeraldSoft} />
            <Stop offset="1" stopColor="#0F3A2B" />
          </RadialGradient>
          <RadialGradient id="bushGrad" cx="38%" cy="28%" r="75%">
            <Stop offset="0" stopColor="#4F9C74" />
            <Stop offset="0.6" stopColor="#2E7A54" />
            <Stop offset="1" stopColor="#154430" />
          </RadialGradient>
        </Defs>

        <Rect x={0} y={0} width={300} height={260} fill="url(#skyGrad)" />

        {/* crescent moon */}
        <Circle cx={234} cy={78} r={62} fill="url(#moonGlow)" />
        <Circle cx={232} cy={76} r={13} fill={colors.goldSoft} />
        <Circle cx={237} cy={71.5} r={11.7} fill="#0D3327" />

        {STAR_POSITIONS.map((s, i) => (
          <React.Fragment key={i}>
            {s.hero ? <Circle cx={s.x} cy={s.y} r={6} fill={colors.goldSoft} opacity={0.14} /> : null}
            <AnimatedCircle
              cx={s.x}
              cy={s.y}
              r={s.hero ? 1.7 : 1.1}
              fill={colors.cream}
              opacity={starPulses[i].interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.95] })}
            />
          </React.Fragment>
        ))}

        {/* garden ground */}
        <Path d="M0,196 Q150,182 300,194 L300,260 L0,260 Z" fill="url(#groundGrad)" />
        <Path d="M0,196 Q150,182 300,194" stroke="#2E6B49" strokeWidth={1} opacity={0.5} fill="none" />

        {/* back row — smaller, further away */}
        {visibleBack.map(renderSlot)}

        {/* halo + centre tree */}
        <AnimatedCircle cx={canopyCx} cy={canopyCy} r={haloR} fill="url(#nurHalo)" opacity={haloOpacity} />

        <Path
          d={`M${canopyCx - 1.5},${trunkBaseY} C${canopyCx - 2},${trunkBaseY - (trunkBaseY - trunkTopY) * 0.4} ${canopyCx + 2},${trunkBaseY - (trunkBaseY - trunkTopY) * 0.7} ${canopyCx},${trunkTopY}`}
          stroke="#5B3A22"
          strokeWidth={3.4 + growth * 2}
          fill="none"
          strokeLinecap="round"
        />

        <G transform={`translate(${canopyCx} ${canopyCy})`}>
          <AnimatedG transform={swayTransform}>
            <AnimatedG transform={breatheTransform}>
              <Path d={canopyOutline} fill="url(#canopyGrad)" />
              <G transform={`translate(${-canopyR * 0.26} ${-canopyR * 0.3})`}>
                <Path d={canopyHighlight} fill="#7FCB9E" opacity={0.3} />
              </G>
              <G transform={`translate(${canopyR * 0.22} ${canopyR * 0.26})`}>
                <Path d={canopyShadow} fill="#0A2A20" opacity={0.26} />
              </G>
              {treeBlossoms.map((b) =>
                b.active ? (
                  <FlowerHead key={b.key} x={b.x} y={b.y} scale={0.85} color={hueColor(b.hue)} />
                ) : null
              )}
            </AnimatedG>
          </AnimatedG>
        </G>

        {/* front row — larger, closer to the viewer, drawn over the trunk base */}
        {visibleFront.map(renderSlot)}

        {/* rising nur particles */}
        {NUR_PARTICLES.map((p, i) => {
          const clock = particleClocks[i];
          const cy = clock.interpolate({ inputRange: [0, 1], outputRange: [p.originY, p.originY - 90] });
          const cx = clock.interpolate({ inputRange: [0, 0.5, 1], outputRange: [p.originX, p.originX + p.drift, p.originX] });
          const coreOpacity = clock.interpolate({
            inputRange: [0, 0.15, 0.75, 1],
            outputRange: [0, 0.5 + growth * 0.35, 0.22 + growth * 0.2, 0],
          });
          const r = clock.interpolate({ inputRange: [0, 1], outputRange: [2.1, 0.5] });
          return <AnimatedCircle key={i} cx={cx} cy={cy} r={r} fill={colors.goldBright} opacity={coreOpacity} />;
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
