import React, { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import SheetModal from '@/components/ui/SheetModal';
import LightField from '@/components/ui/LightField';
import Button from '@/components/ui/Button';
import { colors, fonts, spacing } from '@/constants/theme';
import { useNiyetStore } from '@/store/useNiyetStore';
import { useGroups } from '@/hooks/useGroups';

interface JoinGroupModalProps {
  visible: boolean;
  onClose: () => void;
  prefillCode?: string;
}

export default function JoinGroupModal({ visible, onClose, prefillCode }: JoinGroupModalProps) {
  const router = useRouter();
  const { joinGroupByCode } = useGroups();
  const setActiveGroup = useNiyetStore((s) => s.setActiveGroup);
  const [code, setCode] = useState(prefillCode ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleJoin = async () => {
    setLoading(true);
    const result = await joinGroupByCode(code);
    setLoading(false);
    if (!result.success || !result.groupId) {
      setError(result.error ?? 'Bir hata oluştu.');
      return;
    }
    setError(null);
    setCode('');
    setActiveGroup(result.groupId, result.dhikrId);
    onClose();
    router.push('/(tabs)/zikirmatik');
  };

  return (
    <SheetModal visible={visible} onClose={onClose} title="Gruba Katıl">
      <Text style={styles.desc}>
        Aile veya arkadaşından aldığın davet kodunu gir, onlarla birlikte zikir çekmeye başla.
      </Text>
      <LightField
        label="Davet Kodu"
        placeholder="ÖRN. AILE-70K"
        autoCapitalize="characters"
        value={code}
        onChangeText={(t) => {
          setCode(t);
          setError(null);
        }}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button label={loading ? '...' : 'Katıl'} onPress={handleJoin} disabled={!code.trim() || loading} />
    </SheetModal>
  );
}

const styles = StyleSheet.create({
  desc: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.inkSoft,
    marginBottom: spacing.md,
    lineHeight: 19,
  },
  error: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.danger,
    marginTop: -4,
    marginBottom: spacing.md,
  },
});
