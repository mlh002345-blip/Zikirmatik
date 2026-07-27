import { Redirect } from 'expo-router';
import { View } from 'react-native';
import { colors } from '@/constants/theme';
import { useSession } from '@/hooks/useSession';

export default function Index() {
  const { session, loading } = useSession();

  if (loading) {
    return <View style={{ flex: 1, backgroundColor: colors.emeraldDeep }} />;
  }

  return <Redirect href={session ? '/(tabs)/bahce' : '/onboarding'} />;
}
