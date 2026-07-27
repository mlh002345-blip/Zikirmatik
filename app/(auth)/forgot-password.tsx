import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AuthField from '@/components/ui/AuthField';
import Button from '@/components/ui/Button';
import { colors, fonts, spacing } from '@/constants/theme';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    if (!isSupabaseConfigured) {
      setError('Supabase yapılandırılmadı. .env dosyasını kontrol edin (bkz. supabase/README.md).');
      return;
    }
    if (!email.trim()) {
      setError('E-posta adresini gir.');
      return;
    }
    setError(null);
    setLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim());
    setLoading(false);
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setSent(true);
  };

  return (
    <View style={styles.flex}>
      <LinearGradient colors={[colors.emeraldDeep, colors.emerald]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.flex}>
        <View style={styles.content}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color={colors.cream} />
          </Pressable>

          {!sent ? (
            <>
              <Text style={styles.title}>Şifreni Sıfırla</Text>
              <Text style={styles.subtitle}>Kayıtlı e-posta adresine sıfırlama bağlantısı gönderelim.</Text>
              <AuthField
                label="E-posta"
                placeholder="ornek@eposta.com"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  setError(null);
                }}
              />
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <Button label={loading ? '...' : 'Bağlantı Gönder'} onPress={handleSend} disabled={loading} style={{ marginTop: spacing.md }} />
              {loading ? <ActivityIndicator color={colors.gold} style={{ marginTop: spacing.sm }} /> : null}
            </>
          ) : (
            <View style={styles.confirmWrap}>
              <View style={styles.iconCircle}>
                <Ionicons name="mail-outline" size={32} color={colors.goldBright} />
              </View>
              <Text style={[styles.title, styles.confirmText]}>E-postanı Kontrol Et</Text>
              <Text style={[styles.subtitle, styles.confirmText]}>
                {email || 'E-posta adresine'} bir sıfırlama bağlantısı gönderdik.
              </Text>
              <Button label="Girişe Dön" onPress={() => router.replace('/(auth)/login')} style={{ marginTop: spacing.lg }} />
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    justifyContent: 'center',
  },
  backBtn: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.lg,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(251,246,234,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 24,
    color: colors.cream,
  },
  subtitle: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.mist,
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  confirmWrap: {
    alignItems: 'center',
  },
  confirmText: {
    textAlign: 'center',
  },
  error: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.danger,
    marginBottom: spacing.sm,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(232,201,122,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
});
