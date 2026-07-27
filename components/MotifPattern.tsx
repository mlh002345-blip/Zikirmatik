import React, { useMemo } from 'react';
import Svg, { Circle, Defs, G, LinearGradient, Path, Polygon, Rect, Stop, ClipPath } from 'react-native-svg';
import { colors } from '@/constants/theme';
import type { MotifPatternType } from '@/constants/motifs';

interface MotifPatternProps {
  pattern: MotifPatternType;
  variant?: number;
  progress: number; // 0..1
  size?: number;
  baseColor?: string;
}

const VIEWBOX = 100;
const CENTER = 50;

function starPoints(points: number, outerR: number, innerR: number, rotationDeg: number) {
  const coords: string[] = [];
  const step = Math.PI / points;
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = i * step - Math.PI / 2 + (rotationDeg * Math.PI) / 180;
    const x = CENTER + r * Math.cos(angle);
    const y = CENTER + r * Math.sin(angle);
    coords.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return coords.join(' ');
}

function ringPetals(count: number, radius: number, petalR: number, rotationDeg: number) {
  const items: { cx: number; cy: number }[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (i * (360 / count) + rotationDeg) * (Math.PI / 180);
    items.push({
      cx: CENTER + radius * Math.cos(angle),
      cy: CENTER + radius * Math.sin(angle),
    });
  }
  return items.map((p) => ({ ...p, r: petalR }));
}

function girihLines(rays: number, r1: number, r2: number, rotationDeg: number) {
  const lines: string[] = [];
  for (let i = 0; i < rays; i++) {
    const a = (i * (360 / rays) + rotationDeg) * (Math.PI / 180);
    const b = ((i + 2) * (360 / rays) + rotationDeg) * (Math.PI / 180);
    const x1 = CENTER + r1 * Math.cos(a);
    const y1 = CENTER + r1 * Math.sin(a);
    const x2 = CENTER + r2 * Math.cos(b);
    const y2 = CENTER + r2 * Math.sin(b);
    lines.push(`M ${x1.toFixed(2)} ${y1.toFixed(2)} L ${x2.toFixed(2)} ${y2.toFixed(2)}`);
  }
  return lines.join(' ');
}

export default function MotifPattern({
  pattern,
  variant = 0,
  progress,
  size = 96,
  baseColor = colors.hairline,
}: MotifPatternProps) {
  const clamped = Math.max(0, Math.min(1, progress));
  const gradId = useMemo(() => `nur-${pattern}-${variant}-${Math.round(Math.random() * 1e6)}`, [pattern, variant]);
  const clipId = `${gradId}-clip`;

  const rotation = variant * 12;

  const renderShape = () => {
    switch (pattern) {
      case 'star8':
        return <Polygon points={starPoints(8, 42, 20 + variant, rotation)} />;
      case 'star10':
        return <Polygon points={starPoints(10, 42, 22 + variant, rotation)} />;
      case 'star12':
        return <Polygon points={starPoints(12, 42, 26 + variant, rotation)} />;
      case 'girih':
        return (
          <G>
            <Polygon points={starPoints(8, 40, 40, rotation)} fill="none" strokeWidth={2.5} />
            <Path d={girihLines(8, 40, 18, rotation)} strokeWidth={2.5} fill="none" />
          </G>
        );
      case 'weave':
        return (
          <G>
            <Circle cx={CENTER} cy={CENTER} r={40} fill="none" strokeWidth={2.5} />
            <Circle cx={CENTER} cy={CENTER} r={28} fill="none" strokeWidth={2.5} />
            <Circle cx={CENTER} cy={CENTER} r={16} fill="none" strokeWidth={2.5} />
            <Path d={girihLines(12, 40, 40, rotation)} strokeWidth={1.5} fill="none" />
          </G>
        );
      case 'rosette':
      default:
        return (
          <G>
            <Circle cx={CENTER} cy={CENTER} r={10 + variant} />
            {ringPetals(8, 24, 11 + variant, rotation).map((p, i) => (
              <Circle key={i} cx={p.cx} cy={p.cy} r={p.r} />
            ))}
          </G>
        );
    }
  };

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}>
      <Defs>
        <LinearGradient id={gradId} x1="0" y1="1" x2="0" y2="0">
          <Stop offset="0" stopColor={colors.gold} />
          <Stop offset="0.55" stopColor={colors.goldBright} />
          <Stop offset="1" stopColor="#FFF6DC" />
        </LinearGradient>
        <ClipPath id={clipId}>
          <Rect x={0} y={VIEWBOX * (1 - clamped)} width={VIEWBOX} height={VIEWBOX * clamped} />
        </ClipPath>
      </Defs>

      <G stroke={baseColor} fill={baseColor} strokeWidth={pattern === 'girih' || pattern === 'weave' ? undefined : 0}>
        {renderShape()}
      </G>

      <G
        stroke={`url(#${gradId})`}
        fill={`url(#${gradId})`}
        clipPath={`url(#${clipId})`}
      >
        {renderShape()}
      </G>
    </Svg>
  );
}
