import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AuthField from '@/components/ui/AuthField';
import Button from '@/components/ui/Button';
import { colors, fonts, spacing } from '@/constants/theme';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
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
});
