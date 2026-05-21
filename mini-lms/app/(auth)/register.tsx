import React, { useEffect } from 'react';
import {
  View, Text, ScrollView, KeyboardAvoidingView,
  Platform, TouchableOpacity, StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { colors, radius, shadow } from '@/constants/theme';

const schema = z.object({
  username: z.string().min(3, 'Min 3 characters').regex(/^[a-zA-Z0-9_]+$/, 'Letters, numbers & underscores only'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Min 8 characters').regex(/[A-Z]/, 'Must have uppercase').regex(/[0-9]/, 'Must have a number'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});
type FormData = z.infer<typeof schema>;

export default function RegisterScreen() {
  const router = useRouter();
  const { register: registerUser, isLoading, error, clearError } = useAuth();

  useEffect(() => {
    console.log('[auth] register_screen_mounted');
  }, []);

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { username: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (data: FormData) => {
    clearError();
    console.log('[auth] register_submit', { email: data.email, username: data.username });
    try { await registerUser({ username: data.username, email: data.email, password: data.password }); } catch {}
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* Back */}
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Create Account ✨</Text>
            <Text style={styles.subtitle}>Join thousands of learners today</Text>
          </View>

          <View style={styles.card}>
            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorBoxText}>⚠️  {error}</Text>
              </View>
            )}

            <Controller control={control} name="username"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input label="Username" placeholder="johndoe123" autoCapitalize="none"
                  value={value} onChangeText={onChange} onBlur={onBlur} error={errors.username?.message} />
              )}
            />
            <Controller control={control} name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input label="Email Address" placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none"
                  value={value} onChangeText={onChange} onBlur={onBlur} error={errors.email?.message} />
              )}
            />
            <Controller control={control} name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input label="Password" placeholder="Min 8 chars, 1 uppercase, 1 number" secureTextEntry secureToggle
                  value={value} onChangeText={onChange} onBlur={onBlur} error={errors.password?.message} />
              )}
            />
            <Controller control={control} name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input label="Confirm Password" placeholder="Repeat your password" secureTextEntry secureToggle
                  value={value} onChangeText={onChange} onBlur={onBlur} error={errors.confirmPassword?.message} />
              )}
            />

            <Button title="Create Account" onPress={handleSubmit(onSubmit)} loading={isLoading} fullWidth size="lg" style={{ marginTop: 4 }} />

            <TouchableOpacity onPress={() => router.replace('/(auth)/login')} style={styles.linkBtn}>
              <Text style={styles.linkText}>
                Already have an account?{' '}<Text style={styles.linkAccent}>Sign in</Text>
              </Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 40 },
  backBtn: { paddingTop: 16, paddingBottom: 4 },
  backText: { color: colors.primary, fontSize: 15, fontWeight: '600' },
  header: { paddingTop: 12, paddingBottom: 24 },
  title: { fontSize: 26, fontWeight: '800', color: colors.text, marginBottom: 6 },
  subtitle: { fontSize: 15, color: colors.textMuted },
  card: { backgroundColor: colors.card, borderRadius: 24, padding: 24, ...shadow.sm },
  errorBox: { backgroundColor: colors.errorLight, borderRadius: radius.md, padding: 12, marginBottom: 16 },
  errorBoxText: { color: colors.error, fontSize: 13, fontWeight: '500' },
  linkBtn: { alignItems: 'center', paddingTop: 20 },
  linkText: { fontSize: 14, color: colors.textMuted },
  linkAccent: { color: colors.primary, fontWeight: '700' },
});
