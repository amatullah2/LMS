import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNetwork } from '@/context/NetworkContext';

export function OfflineBanner() {
  const { isOnline } = useNetwork();
  if (isOnline) return null;
  return (
    <View style={styles.banner}>
      <Text style={styles.text}>⚠️  No internet — showing cached content</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#EF4444',
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  text: { color: '#fff', fontSize: 12, fontWeight: '600' },
});
