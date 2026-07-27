import React, { useRef, useState } from 'react';
import { Dimensions, NativeScrollEvent, NativeSyntheticEvent, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Button from '@/components/ui/Button';
import { colors, fonts, spacing } from '@/constants/theme';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    icon: 'sparkles-outline' as const,
    title: 'Kutsal Geometri',
    body: 'Her zikir, seçtiğin motifin içine altın bir nur doldurur. Selçuklu ve Osmanlı mirasından ilhamla kendi manevi galerini oluştur.',
  },
  {
    icon: 'leaf-outline' as const,
    title: 'Manevi Bahçe',
    body: 'Zikrin arttıkça bahçen yeşerir, çiçekler açar. Maneviyatının aynası, cebinde taşıdığın yaşayan bir ekosistem.',
  },
  {
    icon: 'people-outline' as const,
    title: 'Dua Kardeşliği',
    body: 'Rekabetten uzak, yardımlaşma üzerine kurulu bir topluluk. Niyetlerine ortak ol, ortak hedeflere birlikte yürü.',
  },
  {
    icon: 'radio-button-on-outline' as const,
    title: 'Zikirmatik',
    body: 'Haptik geri bildirimli, odaklanmayı kolaylaştıran minimal bir sayaç. Cebinde taşıdığın küçük bir dergâh.',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(e.nativeEvent.contentOffset.x / width);
    if (next !== index) setIndex(next);
  };

  const goNext = () => {
    if (index < SLIDES.length - 1) {
      scrollRef.current?.scrollTo({ x: (index + 1) * width, animated: true });
    } else {
      router.replace('/(auth)/login');
    }
  };

  return (
    <View style={styles.flex}>
      <LinearGradient colors={[colors.emeraldDeep, colors.emerald]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.flex}>
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
        >
          {SLIDES.map((slide) => (
            <View key={slide.title} style={[styles.slide, { width }]}>
              <View style={styles.iconCircle}>
                <Ionicons name={slide.icon} size={40} color={colors.goldBright} />
              </View>
              <Text style={styles.slideTitle}>{slide.title}</Text>
              <Text style={styles.slideBody}>{slide.body}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.dots}>
            {SLIDES.map((_, i) => (
              <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
            ))}
          </View>
          <Button label={index === SLIDES.length - 1 ? 'Başla' : 'Devam Et'} onPress={goNext} />
          <Text style={styles.skip} onPress={() => router.replace('/(auth)/login')}>
            Geç
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(232,201,122,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(232,201,122,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  slideTitle: {
    fontFamily: fonts.serif,
    fontSize: 28,
    color: colors.cream,
    textAlign: 'center',
  },
  slideBody: {
    fontFamily: fonts.sans,
    fontSize: 15,
    lineHeight: 23,
    color: colors.mist,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(251,246,234,0.2)',
  },
  dotActive: {
    backgroundColor: colors.goldBright,
    width: 22,
  },
  skip: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    color: colors.mist,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
