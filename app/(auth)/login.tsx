import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AuthField from '@/components/ui/AuthField';
import Button from '@/components/ui/Button';
import { colors, fonts, spacing } from '@/constants/theme';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { signInWithGoogle } from '@/lib/googleAuth';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!isSupabaseConfigured) {
      setError('Supabase yapılandırılmadı. .env dosyasını kontrol edin (bkz. supabase/README.md).');
      return;
    }
    if (!email.trim() || !password) {
      setError('E-posta ve şifreni gir.');
      return;
    }
    setError(null);
    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    router.replace('/(tabs)/bahce');
  };

  const handleGoogleLogin = async () => {
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
            <Text style={styles.wordmark}>Niyet</Text>
            <Text style={styles.tagline}>Cebindeki dergâh</Text>

            <View style={styles.form}>
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
                placeholder="••••••••"
                secureTextEntry
                value={password}
                onChangeText={(t) => {
                  setPassword(t);
                  setError(null);
                }}
              />
              <Link href="/(auth)/forgot-password" style={styles.forgotLink}>
                Şifremi Unuttum
              </Link>

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <Button
                label={loading ? '...' : 'Giriş Yap'}
                onPress={handleLogin}
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
                onPress={handleGoogleLogin}
                disabled={googleLoading}
                style={({ pressed }) => [styles.googleBtn, { opacity: pressed ? 0.8 : googleLoading ? 0.6 : 1 }]}
              >
                <Ionicons name="logo-google" size={18} color={colors.emeraldDeep} />
                <Text style={styles.googleLabel}>{googleLoading ? '...' : 'Google ile Devam Et'}</Text>
              </Pressable>

              <View style={styles.registerRow}>
                <Text style={styles.registerText}>Hesabın yok mu?</Text>
                <Link href="/(auth)/register" style={styles.registerLink}>
                  Kayıt Ol
                </Link>
              </View>
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
    justifyContent: 'center',
  },
  wordmark: {
    fontFamily: fonts.serif,
    fontSize: 40,
    color: colors.goldBright,
    textAlign: 'center',
  },
  tagline: {
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.mist,
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing.xxl,
  },
  form: {},
  forgotLink: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    color: colors.gold,
    textAlign: 'right',
    marginBottom: spacing.sm,
  },
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
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing.lg,
  },
  registerText: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.mist,
  },
  registerLink: {
    fontFamily: fonts.sansBold,
    fontSize: 13,
    color: colors.goldBright,
  },
});
