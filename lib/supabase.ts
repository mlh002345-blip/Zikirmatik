import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn(
    '[Niyet] Supabase yapılandırılmadı. .env dosyasına EXPO_PUBLIC_SUPABASE_URL ve ' +
      'EXPO_PUBLIC_SUPABASE_ANON_KEY değerlerini ekleyin (bkz. .env.example).'
  );
}

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder-anon-key', {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    // Web'de OAuth dönüşünde URL'deki oturum bilgisini otomatik yakalar;
    // native'de bu akış WebBrowser.openAuthSessionAsync ile elle yönetiliyor.
    detectSessionInUrl: Platform.OS === 'web',
  },
});
