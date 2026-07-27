import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import AuthField from '@/components/ui/AuthField';
import Button from '@/components/ui/Button';
import { colors, fonts, spacing } from '@/constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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
                onChangeText={setEmail}
              />
              <AuthField
                label="Şifre"
                placeholder="••••••••"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
              <Link href="/(auth)/forgot-password" style={styles.forgotLink}>
                Şifremi Unuttum
              </Link>

              <Button label="Giriş Yap" onPress={() => router.replace('/(tabs)/bahce')} style={{ marginTop: spacing.md }} />

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
