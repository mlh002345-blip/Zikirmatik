import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import SheetModal from '@/components/ui/SheetModal';
import LightField from '@/components/ui/LightField';
import Button from '@/components/ui/Button';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { dhikrPresets } from '@/constants/dhikr';
import { useNiyetStore } from '@/store/useNiyetStore';

interface GroupFormModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function GroupFormModal({ visible, onClose }: GroupFormModalProps) {
  const router = useRouter();
  const createGroup = useNiyetStore((s) => s.createGroup);
  const [name, setName] = useState('');
  const [dhikrId, setDhikrId] = useState(dhikrPresets[0].id);
  const [target, setTarget] = useState('10000');

  const handleCreate = () => {
    const parsedTarget = parseInt(target.replace(/[^0-9]/g, ''), 10) || 1000;
    createGroup(name, dhikrId, parsedTarget);
    setName('');
    setTarget('10000');
    onClose();
    router.push('/(tabs)/zikirmatik');
  };

  return (
    <SheetModal visible={visible} onClose={onClose} title="Yeni Grup Oluştur">
      <LightField label="Grup Adı" placeholder="Örn. Aile Zikir Halkası" value={name} onChangeText={setName} />

      <Text style={styles.label}>Zikir Türü</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
        {dhikrPresets.map((d) => {
          const active = d.id === dhikrId;
          return (
            <Pressable key={d.id} onPress={() => setDhikrId(d.id)} style={[styles.chip, active && styles.chipActive]}>
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{d.transliteration}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <LightField
        label="Ortak Hedef"
        placeholder="10000"
        keyboardType="number-pad"
        value={target}
        onChangeText={setTarget}
      />

      <Button label="Grubu Oluştur ve Katıl" onPress={handleCreate} disabled={!name.trim()} />
    </SheetModal>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    color: colors.inkSoft,
    marginBottom: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.hairline,
    backgroundColor: colors.creamDeep,
    marginRight: spacing.xs,
  },
  chipActive: {
    backgroundColor: colors.emerald,
    borderColor: colors.emerald,
  },
  chipText: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    color: colors.inkSoft,
  },
  chipTextActive: {
    color: colors.cream,
  },
});
