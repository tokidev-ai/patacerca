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

export default function UiGallery() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [seg, setSeg] = useState<'a' | 'b'>('a');
  const [uploaded, setUploaded] = useState(false);

  return (
    <SafeAreaView edges={['top', 'bottom', 'left', 'right']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Galería de Componentes UI</Text>

        <Text style={styles.section}>Botones</Text>
        <View style={styles.row}>
          <Button title="Primario" />
          <Button title="Secundario" variant="outline" />
          <Button title="Destructivo" variant="danger-soft" />
          <Button title="Deshabilitado" variant="disabled" />
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

        <Text style={styles.section}>Chips & Segmented</Text>
        <View style={styles.iconRow}>
          <Chip label="Chip Normal" />
          <Chip label="Chip Seleccionado" selected />
        </View>
        <Segmented
          options={[
            { value: 'a', label: 'Opción 1', count: 3 },
            { value: 'b', label: 'Opción 2' },
          ]}
          value={seg}
          onChange={setSeg}
        />

        <Text style={styles.section}>Avatares & Badges</Text>
        <View style={styles.iconRow}>
          <Avatar name="Marco Rojas" colorName="green" size={56} />
          <Avatar name="Valeria Céspedes" colorName="peach" size={56} />
          <Avatar name="Luis Fernández" colorName="purple" size={56} />
          <VerifiedBadge size={24} />
        </View>

        <Text style={styles.section}>Status Pills</Text>
        <View style={styles.iconRow}>
          <StatusPill status="pending" />
          <StatusPill status="accepted" />
          <StatusPill status="rejected" />
        </View>

        <Text style={styles.section}>Cards & Stats</Text>
        <Card>
          <Text style={styles.bold}>Tarjeta Surface Estándar</Text>
        </Card>
        <View style={styles.iconRow}>
          <Stat value="20 Bs" label="30 min" />
          <Stat value="★ 4.9" label="23 reseñas" />
        </View>

        <Text style={styles.section}>Upload Tile</Text>
        <UploadTile
          label="Certificado de antecedentes"
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
  bold: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 15,
    color: '#2A2420',
  },
});

