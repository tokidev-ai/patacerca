import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Button,
  IconButton,
  Input,
  PhoneInput,
  OtpInput,
  Chip,
  Segmented,
  Avatar,
  VerifiedBadge,
  StatusPill,
  Card,
  Stat,
  UploadTile,
} from '@patacerca/ui';

export default function WalkerUiGallery() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [seg, setSeg] = useState<'a' | 'b'>('a');
  const [uploaded, setUploaded] = useState(false);

  return (
    <SafeAreaView edges={['top', 'bottom', 'left', 'right']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Galería UI — Paseadores</Text>

        <Text style={styles.section}>Botones</Text>
        <View style={styles.row}>
          <Button title="Aceptar paseo" />
          <Button title="Rechazar" variant="outline" />
          <Button title="Cerrar sesión" variant="danger-soft" />
          <Button title="Enviar a revisión" variant="disabled" />
        </View>

        <Text style={styles.section}>Icon Buttons</Text>
        <View style={styles.iconRow}>
          <IconButton icon="back" />
          <IconButton icon="close" />
          <IconButton icon="plus" />
          <IconButton icon="minus" />
        </View>

        <Text style={styles.section}>Inputs</Text>
        <Input placeholder="Texto normal" />
        <PhoneInput value={phone} onChangeText={setPhone} />
        <OtpInput value={otp} onChangeText={setOtp} />

        <Text style={styles.section}>Upload Tile</Text>
        <UploadTile
          label="Carnet Anverso"
          isUploaded={uploaded}
          onPress={() => setUploaded(!uploaded)}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F2EA',
  },
  scroll: {
    padding: 20,
    gap: 12,
  },
  title: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 24,
    color: '#2A2420',
    marginBottom: 8,
  },
  section: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 16,
    color: '#2A2420',
    marginTop: 12,
  },
  row: {
    gap: 8,
  },
  iconRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
});

