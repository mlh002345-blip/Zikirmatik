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
const AnimatedG = Animated.createAnimatedComponent(G);

const ROSE = '#D9A6A0';
const CANOPY_HILITE = '#6FBE95';
const CANOPY_SHADE = '#0A2A20';

type Pt = { x: number; y: number };

// Smooth closed Catmull-Rom spline through a ring of points, converted to
// cubic beziers — genuinely rounded, no facets, unlike a quad-through-midpoint
// approximation.
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

// A soft, rounded canopy silhouette — 18 gently-varied points on a smooth
// closed spline, reading as lush foliage rather than a geometric blob.
function cloudPath(R: number) {
  const radiusFactors = [1, 0.95, 1.05, 0.93, 1.06, 0.96, 1.04, 0.94, 1.05, 0.97, 1.03, 0.92, 1.06, 0.95, 1.04, 0.93, 1.05, 0.96];
  const pts: Pt[] = radiusFactors.map((rf, i) => {
    const angle = (i / radiusFactors.length) * Math.PI * 2;
    return { x: Math.cos(angle) * R * rf, y: Math.sin(angle) * R * rf * 0.86 };
  });
  return smoothClosedPath(pts);
}

// A classic three-lobed tulip crown, drawn from the base — reads clearly as
// a flower bud rather than a teardrop.
const TULIP_D =
  'M0,0 C-2.6,-0.3 -3.6,-1.6 -3.4,-3.2 C-4.4,-3.9 -4.6,-5.3 -3.5,-5.9 C-2.6,-6.4 -1.9,-5.6 -1.6,-4.6 C-1.5,-6.6 -0.8,-8.2 0,-9.4 C0.8,-8.2 1.5,-6.6 1.6,-4.6 C1.9,-5.6 2.6,-6.4 3.5,-5.9 C4.6,-5.3 4.4,-3.9 3.4,-3.2 C3.6,-1.6 2.6,-0.3 0,0 Z';
const CYPRESS_D =
  'M0,0 C-3,-3 -2.4,-9 -3.4,-13 C-2,-17 -3,-20 -1.4,-25 C-1,-30 -0.5,-35 0,-40 C0.5,-35 1,-30 1.4,-25 C3,-20 2,-17 3.4,-13 C2.4,-9 3,-3 0,0 Z';

function Tulip({ x, y, scale = 1, color, stem = true, opacity = 1 }: { x: number; y: number; scale?: number; color: string; stem?: boolean; opacity?: number }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
      {stem ? <Path d="M0,0 L0,2.4" stroke="#3F6B4E" strokeWidth={0.6} /> : null}
      <Path d={TULIP_D} fill={color} />
    </G>
  );
}

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
  { originX: 150, originY: 132, delay: 0, duration: 4200, drift: -8 },
  { originX: 128, originY: 146, delay: 900, duration: 5000, drift: 10 },
  { originX: 174, originY: 142, delay: 1800, duration: 4600, drift: -14 },
  { originX: 145, originY: 122, delay: 2600, duration: 5400, drift: 6 },
  { originX: 160, originY: 150, delay: 1300, duration: 4800, drift: 14 },
  { originX: 152, originY: 158, delay: 2100, duration: 5200, drift: -6 },
];

// Fixed ground slots — flowers reveal progressively as the garden grows,
// rather than being re-randomized on every render.
const GROUND_TULIP_SLOTS: { x: number; y: number; hue: 'gold' | 'cream' | 'rose' }[] = [
  { x: 34, y: 202, hue: 'gold' },
  { x: 258, y: 198, hue: 'rose' },
  { x: 66, y: 214, hue: 'cream' },
  { x: 224, y: 210, hue: 'gold' },
  { x: 96, y: 197, hue: 'gold' },
  { x: 196, y: 203, hue: 'rose' },
  { x: 48, y: 222, hue: 'cream' },
  { x: 244, y: 220, hue: 'gold' },
  { x: 116, y: 218, hue: 'rose' },
  { x: 205, y: 224, hue: 'cream' },
  { x: 20, y: 210, hue: 'gold' },
  { x: 278, y: 208, hue: 'cream' },
];

function hueColor(hue: 'gold' | 'cream' | 'rose') {
  if (hue === 'gold') return colors.goldBright;
  if (hue === 'rose') return ROSE;
  return colors.cream;
}

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
  const bloomCount = Math.round(growth * 8);
  const groundTulipCount = Math.round(2 + growth * (GROUND_TULIP_SLOTS.length - 2));

  const sway = useRef(new Animated.Value(0)).current;
  const cypressSway = useRef(new Animated.Value(0)).current;
  const breathe = useRef(new Animated.Value(0)).current;
  const shimmer = useRef(new Animated.Value(0)).current;
  const haloPulse = useRef(new Animated.Value(0)).current;
  const ripple = useRef(new Animated.Value(0)).current;
  const starPulses = useRef(STAR_POSITIONS.map(() => new Animated.Value(Math.random()))).current;
  const particleClocks = useRef(NUR_PARTICLES.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const animations: Animated.CompositeAnimation[] = [
      loop(sway, 3400),
      loop(cypressSway, 4200, Easing.inOut(Easing.sin)),
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
          Animated.timing(v, { toValue: 1, duration: NUR_PARTICLES[i].duration, easing: Easing.out(Easing.quad), useNativeDriver: false }),
          Animated.timing(v, { toValue: 0, duration: 0, useNativeDriver: false }),
        ])
      )
    );
    particleLoops.forEach((a) => a.start());

    const rippleLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(ripple, { toValue: 1, duration: 3200, easing: Easing.out(Easing.quad), useNativeDriver: false }),
        Animated.timing(ripple, { toValue: 0, duration: 0, useNativeDriver: false }),
      ])
    );
    rippleLoop.start();

    return () => {
      animations.forEach((a) => a.stop());
      starLoops.forEach((a) => a.stop());
      particleLoops.forEach((a) => a.stop());
      rippleLoop.stop();
    };
  }, [sway, cypressSway, breathe, shimmer, haloPulse, ripple, starPulses, particleClocks]);

  const canopyCx = 150;
  const canopyCy = 148 - growth * 46;
  const canopyR = 26 + growth * 30;
  const trunkTopY = canopyCy + canopyR * 0.35;
  const trunkBaseY = 214 - growth * 3;

  const swayTransform = sway.interpolate({ inputRange: [0, 1], outputRange: ['translate(-5,0)', 'translate(5,0)'] });
  const breatheTransform = breathe.interpolate({ inputRange: [0, 1], outputRange: ['scale(1)', 'scale(1.03)'] });
  const cypressSwayL = cypressSway.interpolate({ inputRange: [0, 1], outputRange: ['rotate(-1.4)', 'rotate(1.4)'] });
  const cypressSwayR = cypressSway.interpolate({ inputRange: [0, 1], outputRange: ['rotate(1.6)', 'rotate(-1.6)'] });
  const shimmerOpacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.2, 0.5] });
  const haloOpacity = haloPulse.interpolate({ inputRange: [0, 1], outputRange: [0.28 + growth * 0.32, 0.42 + growth * 0.4] });
  const haloR = 34 + growth * 64;

  const rippleR = ripple.interpolate({ inputRange: [0, 1], outputRange: [3, 26] });
  const rippleOpacity = ripple.interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 0.4, 0] });
  const rippleR2 = ripple.interpolate({ inputRange: [0, 1], outputRange: [3, 20] });
  const rippleOpacity2 = ripple.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0, 0.35, 0] });

  const canopyOutline = cloudPath(canopyR);
  const canopyHighlight = cloudPath(canopyR * 0.5);
  const canopyShadow = cloudPath(canopyR * 0.55);

  const treeBlossoms = Array.from({ length: 8 }).map((_, i) => {
    const angle = (i / 8) * Math.PI * 2;
    const r = canopyR * 0.72;
    return {
      x: Math.cos(angle) * r,
      y: Math.sin(angle) * r * 0.85,
      active: i < bloomCount,
      hue: (['gold', 'cream', 'rose'] as const)[i % 3],
      key: i,
    };
  });

  return (
    <View style={[styles.container, { height }]}>
      <Svg width="100%" height={height} viewBox="0 0 300 260" preserveAspectRatio="xMidYMax slice">
        <Defs>
          <LinearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#061A15" />
            <Stop offset="0.45" stopColor="#0C2E23" />
            <Stop offset="0.78" stopColor="#154332" />
            <Stop offset="1" stopColor="#1E5A41" />
          </LinearGradient>
          <RadialGradient id="horizonGlow" cx="50%" cy="100%" r="75%">
            <Stop offset="0" stopColor={colors.goldSoft} stopOpacity={0.28} />
            <Stop offset="1" stopColor={colors.goldSoft} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="moonGlow" cx="76%" cy="30%" r="38%">
            <Stop offset="0" stopColor={colors.goldSoft} stopOpacity={0.45} />
            <Stop offset="1" stopColor={colors.goldSoft} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="nurHalo" cx="50%" cy="50%" r="50%">
            <Stop offset="0" stopColor={colors.goldBright} stopOpacity={0.6} />
            <Stop offset="0.55" stopColor={colors.gold} stopOpacity={0.2} />
            <Stop offset="1" stopColor={colors.gold} stopOpacity={0} />
          </RadialGradient>
          <RadialGradient id="canopyGrad" cx="38%" cy="30%" r="72%">
            <Stop offset="0" stopColor="#57A57E" />
            <Stop offset="0.5" stopColor={colors.emeraldSoft} />
            <Stop offset="1" stopColor="#0F3A2B" />
          </RadialGradient>
          <LinearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#2F6E56" stopOpacity={0.6} />
            <Stop offset="1" stopColor={colors.emerald} stopOpacity={0.96} />
          </LinearGradient>
          <LinearGradient id="hillGradFar" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#1B4534" />
            <Stop offset="1" stopColor="#0A2B20" />
          </LinearGradient>
          <LinearGradient id="hillGradNear" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#245A40" />
            <Stop offset="1" stopColor="#153B2B" />
          </LinearGradient>
          <RadialGradient id="vignette" cx="50%" cy="46%" r="72%">
            <Stop offset="0" stopColor="#000000" stopOpacity={0} />
            <Stop offset="0.7" stopColor="#000000" stopOpacity={0} />
            <Stop offset="1" stopColor="#04140F" stopOpacity={0.5} />
          </RadialGradient>
        </Defs>

        <Rect x={0} y={0} width={300} height={260} fill="url(#skyGrad)" />
        <Rect x={0} y={130} width={300} height={130} fill="url(#horizonGlow)" />

        {/* crescent moon */}
        <Circle cx={230} cy={78} r={70} fill="url(#moonGlow)" />
        <Circle cx={228} cy={76} r={14} fill={colors.goldSoft} />
        <Circle cx={233.5} cy={71.5} r={12.6} fill="#0C2E23" />

        {/* twinkling stars */}
        {STAR_POSITIONS.map(([x, y], i) => (
          <AnimatedCircle
            key={i}
            cx={x}
            cy={y}
            r={i % 3 === 0 ? 1.7 : 1.2}
            fill={colors.cream}
            opacity={starPulses[i].interpolate({ inputRange: [0, 1], outputRange: [0.25, 0.95] })}
          />
        ))}

        {/* rolling hills */}
        <Path d="M0,188 Q75,148 150,173 T300,163 L300,260 L0,260 Z" fill="url(#hillGradFar)" />
        <Path d="M0,214 Q90,186 150,201 T300,191 L300,260 L0,260 Z" fill="url(#hillGradNear)" />

        {/* cypress trees framing the garden */}
        <G transform="translate(36 220) scale(1.65)">
          <AnimatedG transform={cypressSwayL}>
            <Path d={CYPRESS_D} fill="#1B4B36" opacity={0.95} />
            <Path d={CYPRESS_D} fill="none" stroke="#2F6E52" strokeWidth={0.4} opacity={0.6} />
          </AnimatedG>
        </G>
        <G transform="translate(266 217) scale(1.35)">
          <AnimatedG transform={cypressSwayR}>
            <Path d={CYPRESS_D} fill="#173F2D" opacity={0.9} />
            <Path d={CYPRESS_D} fill="none" stroke="#2A6249" strokeWidth={0.4} opacity={0.55} />
          </AnimatedG>
        </G>

        {/* river of light beneath the garden */}
        <Path d="M0,230 Q60,220 120,230 T240,230 T300,226 L300,260 L0,260 Z" fill="url(#waterGrad)" />
        <AnimatedPath
          d="M0,228 Q60,219 120,228 T240,228 T300,224"
          stroke={colors.goldSoft}
          strokeWidth={1.1}
          fill="none"
          opacity={shimmerOpacity}
        />
        <AnimatedPath
          d="M0,234 Q70,227 130,234 T260,233 T300,231"
          stroke={colors.cream}
          strokeWidth={0.7}
          fill="none"
          opacity={shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.1, 0.24] })}
        />
        {/* a quiet spring, feeding the river */}
        <AnimatedCircle cx={150} cy={244} r={rippleR} stroke={colors.goldSoft} strokeWidth={0.8} fill="none" opacity={rippleOpacity} />
        <AnimatedCircle cx={150} cy={244} r={rippleR2} stroke={colors.cream} strokeWidth={0.6} fill="none" opacity={rippleOpacity2} />

        {/* ground tulips — bloom in number as dhikr accumulates */}
        {GROUND_TULIP_SLOTS.slice(0, groundTulipCount).map((f, i) => (
          <Tulip key={i} x={f.x} y={f.y} scale={0.95 + growth * 0.35} color={hueColor(f.hue)} />
        ))}

        {/* nur halo behind the tree — glows brighter as the garden matures */}
        <AnimatedCircle cx={canopyCx} cy={canopyCy} r={haloR} fill="url(#nurHalo)" opacity={haloOpacity} />

        {/* trunk */}
        <Path
          d={`M${canopyCx - 2},${trunkBaseY} C${canopyCx - 3},${trunkBaseY - (trunkBaseY - trunkTopY) * 0.4} ${canopyCx + 2},${trunkBaseY - (trunkBaseY - trunkTopY) * 0.7} ${canopyCx},${trunkTopY}`}
          stroke="#5B3A22"
          strokeWidth={4 + growth * 2.4}
          fill="none"
          strokeLinecap="round"
        />
        <Path
          d={`M${canopyCx - 1},${trunkBaseY} C${canopyCx - 2},${trunkBaseY - (trunkBaseY - trunkTopY) * 0.4} ${canopyCx + 2.5},${trunkBaseY - (trunkBaseY - trunkTopY) * 0.7} ${canopyCx + 0.5},${trunkTopY}`}
          stroke="#7A5636"
          strokeWidth={1.1}
          fill="none"
          strokeLinecap="round"
          opacity={0.6}
        />

        {/* canopy — a single soft cloud silhouette that sways and breathes */}
        <G transform={`translate(${canopyCx} ${canopyCy})`}>
          <AnimatedG transform={swayTransform}>
            <AnimatedG transform={breatheTransform}>
              <Path d={canopyOutline} fill="url(#canopyGrad)" />
              <G transform={`translate(${-canopyR * 0.28} ${-canopyR * 0.32})`}>
                <Path d={canopyHighlight} fill={CANOPY_HILITE} opacity={0.32} />
              </G>
              <G transform={`translate(${canopyR * 0.24} ${canopyR * 0.28})`}>
                <Path d={canopyShadow} fill={CANOPY_SHADE} opacity={0.28} />
              </G>
              {treeBlossoms.map((b) => (
                <Tulip
                  key={b.key}
                  x={b.x}
                  y={b.y}
                  scale={b.active ? 0.75 : 0.4}
                  color={b.active ? hueColor(b.hue) : 'rgba(232,201,122,0.28)'}
                  stem={false}
                  opacity={b.active ? 1 : 0.6}
                />
              ))}
            </AnimatedG>
          </AnimatedG>
        </G>

        {/* rising nur particles */}
        {NUR_PARTICLES.map((p, i) => {
          const clock = particleClocks[i];
          const cy = clock.interpolate({ inputRange: [0, 1], outputRange: [p.originY, p.originY - 98] });
          const cx = clock.interpolate({ inputRange: [0, 0.5, 1], outputRange: [p.originX, p.originX + p.drift, p.originX] });
          const coreOpacity = clock.interpolate({
            inputRange: [0, 0.15, 0.75, 1],
            outputRange: [0, 0.55 + growth * 0.35, 0.25 + growth * 0.2, 0],
          });
          const glowOpacity = clock.interpolate({
            inputRange: [0, 0.15, 0.75, 1],
            outputRange: [0, (0.55 + growth * 0.35) * 0.35, (0.25 + growth * 0.2) * 0.35, 0],
          });
          const r = clock.interpolate({ inputRange: [0, 1], outputRange: [2.2, 0.6] });
          return (
            <React.Fragment key={i}>
              <AnimatedCircle cx={cx} cy={cy} r={Animated.multiply(r, 2.6)} fill={colors.goldBright} opacity={glowOpacity} />
              <AnimatedCircle cx={cx} cy={cy} r={r} fill={colors.goldBright} opacity={coreOpacity} />
            </React.Fragment>
          );
        })}

        <Rect x={0} y={0} width={300} height={260} fill="url(#vignette)" />
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
