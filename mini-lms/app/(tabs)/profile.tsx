import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, Image, StyleSheet, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { useCourses } from '@/context/CoursesContext';
import { AppStorage } from '@/lib/storage/async';
import { Button } from '@/components/ui/Button';
import { colors, radius, shadow } from '@/constants/theme';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { enrolledIds, bookmarkedIds, completedIds } = useCourses();
  const [avatarUri, setAvatarUri] = useState<string | null>(user?.avatar?.url ?? null);

  // Restore persisted avatar on mount
  useEffect(() => {
    AppStorage.getAvatarUri().then((saved) => {
      if (saved) setAvatarUri(saved);
    });
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'We need photo library access to update your picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setAvatarUri(uri);
      await AppStorage.setAvatarUri(uri);
    }
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      logout();
      return;
    }
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  const stats = [
    { label: 'Enrolled', value: enrolledIds.length, emoji: '📖' },
    { label: 'Bookmarked', value: bookmarkedIds.length, emoji: '🔖' },
    { label: 'Completed', value: completedIds.length, emoji: '✅' },
  ];

  const infoRows = [
    { label: 'Username', value: `@${user?.username ?? '-'}` },
    { label: 'Email', value: user?.email ?? '-' },
    { label: 'Member since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-' },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header section */}
        <View style={styles.headerSection}>
          <Text style={styles.screenTitle}>Profile</Text>

          <View style={styles.avatarWrap}>
            <TouchableOpacity onPress={pickImage} activeOpacity={0.8}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarInitial}>
                    {user?.username?.[0]?.toUpperCase() ?? 'U'}
                  </Text>
                </View>
              )}
              <View style={styles.editBadge}>
                <Text style={styles.editIcon}>✏️</Text>
              </View>
            </TouchableOpacity>

            <Text style={styles.displayName}>
              {user?.fullName ?? user?.username ?? 'Learner'}
            </Text>
            <Text style={styles.emailText}>{user?.email}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{user?.role ?? 'USER'}</Text>
            </View>
          </View>
        </View>

        {/* Stats card */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Your Progress</Text>
          <View style={styles.statsRow}>
            {stats.map((s) => (
              <View key={s.label} style={styles.statItem}>
                <Text style={styles.statEmoji}>{s.emoji}</Text>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Info card */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Account Info</Text>
          {infoRows.map((item, i) => (
            <View
              key={item.label}
              style={[styles.infoRow, i < infoRows.length - 1 && styles.infoRowBorder]}
            >
              <Text style={styles.infoRowLabel}>{item.label}</Text>
              <Text style={styles.infoRowValue} numberOfLines={1}>{item.value}</Text>
            </View>
          ))}
        </View>

        {/* Logout */}
        <View style={styles.logoutWrap}>
          <Button title="Sign Out" variant="danger" fullWidth onPress={handleLogout} />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  headerSection: {
    backgroundColor: colors.card,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 28,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  screenTitle: { fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: 20 },
  avatarWrap: { alignItems: 'center' },
  avatarImage: { width: 88, height: 88, borderRadius: 44 },
  avatarPlaceholder: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: { color: '#fff', fontSize: 32, fontWeight: '800' },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.card,
  },
  editIcon: { fontSize: 11 },
  displayName: { fontSize: 20, fontWeight: '800', color: colors.text, marginTop: 14 },
  emailText: { fontSize: 13, color: colors.textMuted, marginTop: 3 },
  roleBadge: {
    marginTop: 8,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  roleText: { fontSize: 12, fontWeight: '700', color: colors.primary, textTransform: 'uppercase' },

  card: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.sm,
  },
  cardLabel: { fontSize: 13, fontWeight: '700', color: colors.textMuted, marginBottom: 14, textTransform: 'uppercase', letterSpacing: 0.5 },

  statsRow: { flexDirection: 'row' },
  statItem: { flex: 1, alignItems: 'center' },
  statEmoji: { fontSize: 22, marginBottom: 4 },
  statValue: { fontSize: 22, fontWeight: '800', color: colors.primary },
  statLabel: { fontSize: 12, color: colors.textMuted, marginTop: 2 },

  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 11 },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.divider },
  infoRowLabel: { fontSize: 14, color: colors.textMuted },
  infoRowValue: { fontSize: 14, fontWeight: '600', color: colors.text, maxWidth: '60%' },

  logoutWrap: { marginHorizontal: 16, marginTop: 16, marginBottom: 32 },
});
