import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AuthField from '@/components/ui/AuthField';
import Button from '@/components/ui/Button';
import { colors, fonts, spacing } from '@/constants/theme';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { signInWithGoogle } from '@/lib/googleAuth';

const PRIVACY_POLICY_URL =
  'https://github.com/mlh002345-blip/Zikirmatik/blob/claude/niyet-zikirmatik-design-xtervm/PRIVACY_POLICY.md';

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!isSupabaseConfigured) {
      setError('Supabase yapılandırılmadı. .env dosyasını kontrol edin (bkz. supabase/README.md).');
      return;
    }
    if (!name.trim() || !email.trim() || !password) {
      setError('Tüm alanları doldur.');
      return;
    }
    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalı.');
      return;
    }
    setError(null);
    setLoading(true);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name: name.trim() } },
    });
    setLoading(false);
    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    if (data.session) {
      router.replace('/(tabs)/bahce');
    } else {
      // E-posta doğrulaması açıksa oturum hemen açılmaz.
      router.replace('/(auth)/login');
    }
  };

  const handleGoogleRegister = async () => {
    if (!isSupabaseConfigured) {
      setError('Supabase yapılandırılmadı. .env dosyasını kontrol edin (bkz. supabase/README.md).');
      return;
    }
    setError(null);
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      if (Platform.OS !== 'web') {
        router.replace('/(tabs)/bahce');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Google ile giriş başarısız oldu.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <View style={styles.flex}>
      <LinearGradient colors={[colors.emeraldDeep, colors.emerald]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.flex}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
          <View style={styles.content}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={22} color={colors.cream} />
            </Pressable>

            <Text style={styles.title}>Yolculuğuna Başla</Text>
            <Text style={styles.subtitle}>Manevi gelişimini kaydetmek için bir hesap oluştur.</Text>

            <View style={styles.form}>
              <AuthField
                label="Ad Soyad"
                placeholder="Adın"
                value={name}
                onChangeText={(t) => {
                  setName(t);
                  setError(null);
                }}
              />
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
              <AuthField
                label="Şifre"
                placeholder="En az 6 karakter"
                secureTextEntry
                value={password}
                onChangeText={(t) => {
                  setPassword(t);
                  setError(null);
                }}
              />

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <Button
                label={loading ? '...' : 'Hesap Oluştur'}
                onPress={handleRegister}
                disabled={loading}
                style={{ marginTop: spacing.md }}
              />
              {loading ? <ActivityIndicator color={colors.gold} style={{ marginTop: spacing.sm }} /> : null}

              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>veya</Text>
                <View style={styles.dividerLine} />
              </View>

              <Pressable
                onPress={handleGoogleRegister}
                disabled={googleLoading}
                style={({ pressed }) => [styles.googleBtn, { opacity: pressed ? 0.8 : googleLoading ? 0.6 : 1 }]}
              >
                <Ionicons name="logo-google" size={18} color={colors.emeraldDeep} />
                <Text style={styles.googleLabel}>{googleLoading ? '...' : 'Google ile Devam Et'}</Text>
              </Pressable>

              <Text style={styles.legalText}>
                Hesap oluşturarak{' '}
                <Text style={styles.legalLink} onPress={() => Linking.openURL(PRIVACY_POLICY_URL)}>
                  Gizlilik Politikası
                </Text>
                'nı kabul etmiş olursun.
              </Text>
            </View>
          </View>
        </KeyboardAvoidingView>
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
    fontSize: 26,
    color: colors.cream,
  },
  subtitle: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.mist,
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  form: {},
  error: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.danger,
    marginBottom: spacing.sm,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(251,246,234,0.15)',
  },
  dividerText: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.mist,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.cream,
    borderRadius: 999,
    paddingVertical: spacing.md,
    marginTop: spacing.lg,
  },
  googleLabel: {
    fontFamily: fonts.sansBold,
    fontSize: 15,
    color: colors.emeraldDeep,
  },
  legalText: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.mist,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  legalLink: {
    color: colors.gold,
    textDecorationLine: 'underline',
  },
});
