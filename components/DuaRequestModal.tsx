import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import SheetModal from '@/components/ui/SheetModal';
import Button from '@/components/ui/Button';
import { colors, fonts, radius, spacing } from '@/constants/theme';
import { useDuaRequests } from '@/hooks/useDuaRequests';

const CATEGORIES = ['Şifa', 'Sınav', 'Hayırlı Kısmet', 'Aile', 'Yolculuk'];

interface DuaRequestModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function DuaRequestModal({ visible, onClose }: DuaRequestModalProps) {
  const { createRequest } = useDuaRequests();
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!text.trim()) {
      setError('Niyetini birkaç cümleyle yaz.');
      return;
    }
    setLoading(true);
    setError(null);
    const result = await createRequest(category, text);
    setLoading(false);
    if (!result.success) {
      setError(result.error ?? 'Bir hata oluştu.');
      return;
    }
    setText('');
    onClose();
  };

  return (
    <SheetModal visible={visible} onClose={onClose} title="Dua Talebi Oluştur">
      <Text style={styles.label}>Kategori</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
        {CATEGORIES.map((c) => {
          const active = c === category;
          return (
            <Pressable key={c} onPress={() => setCategory(c)} style={[styles.chip, active && styles.chipActive]}>
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{c}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <Text style={styles.label}>Niyetin</Text>
      <View style={styles.textAreaWrap}>
        <TextInput
          value={text}
          onChangeText={(t) => {
            setText(t);
            setError(null);
          }}
          placeholder="Annem için şifa niyetine dua bekliyorum..."
          placeholderTextColor={colors.mist}
          multiline
          numberOfLines={4}
          style={styles.textArea}
        />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button label={loading ? '...' : 'Paylaş'} onPress={handleSubmit} disabled={loading} style={{ marginTop: spacing.sm }} />
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
  textAreaWrap: {
    marginBottom: spacing.sm,
  },
  textArea: {
    backgroundColor: colors.creamDeep,
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontFamily: fonts.sans,
    fontSize: 15,
    color: colors.ink,
    minHeight: 90,
    textAlignVertical: 'top',
  },
  error: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.danger,
    marginTop: spacing.sm,
  },
});
