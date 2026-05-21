import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  StyleSheet,
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
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
type FormData = z.infer<typeof schema>;

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuth();

  useEffect(() => {
    console.log('[auth] login_screen_mounted');
  }, []);

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: FormData) => {
    clearError();
    console.log('[auth] login_submit', { email: data.email });
    try { await login(data); } catch {}
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoWrap}>
              <Text style={styles.logoText}>L</Text>
            </View>
            <Text style={styles.greeting}>Welcome back! 👋</Text>
            <Text style={styles.subtitle}>Sign in to continue learning</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorBoxText}>⚠️  {error}</Text>
              </View>
            )}

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Email Address"
                  placeholder="you@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.email?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Password"
                  placeholder="••••••••"
                  secureTextEntry
                  secureToggle
                  autoComplete="password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.password?.message}
                />
              )}
            />

            <Button
              title="Sign In"
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              fullWidth
              size="lg"
              style={{ marginTop: 4 }}
            />

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity onPress={() => router.push('/(auth)/register')} style={styles.linkBtn}>
              <Text style={styles.linkText}>
                Don't have an account?{' '}
                <Text style={styles.linkAccent}>Create one</Text>
              </Text>
            </TouchableOpacity>
          </View>

          {/* Demo hint */}
          <View style={styles.demoBox}>
            <Text style={styles.demoTitle}>🔑  Quick Demo Login</Text>
            <Text style={styles.demoLine}>Email:    lmsdemo2026@gmail.com</Text>
            <Text style={styles.demoLine}>Password: LmsDemo@1</Text>
            <View style={styles.demoSeparator} />
            <Text style={styles.demoNote}>
              Or tap "Create one" above to register your own account instantly.
            </Text>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, paddingHorizontal: 20, paddingBottom: 40 },

  header: { alignItems: 'center', paddingTop: 40, paddingBottom: 32 },
  logoWrap: {
    width: 64, height: 64, borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
    ...shadow.md,
  },
  logoText: { color: '#fff', fontSize: 28, fontWeight: '800' },
  greeting: { fontSize: 26, fontWeight: '800', color: colors.text, marginBottom: 6 },
  subtitle: { fontSize: 15, color: colors.textMuted },

  card: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 24,
    ...shadow.sm,
  },

  errorBox: {
    backgroundColor: colors.errorLight,
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 16,
  },
  errorBoxText: { color: colors.error, fontSize: 13, fontWeight: '500' },

  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { marginHorizontal: 12, color: colors.textLight, fontSize: 13 },

  linkBtn: { alignItems: 'center', paddingVertical: 4 },
  linkText: { fontSize: 14, color: colors.textMuted },
  linkAccent: { color: colors.primary, fontWeight: '700' },

  demoBox: {
    marginTop: 20,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.md,
    padding: 16,
  },
  demoTitle: { fontSize: 13, fontWeight: '700', color: colors.primaryDark, marginBottom: 6 },
  demoLine: { fontSize: 13, color: colors.primary, marginTop: 2, fontFamily: 'monospace' },
  demoSeparator: { height: 1, backgroundColor: colors.primary, opacity: 0.2, marginVertical: 10 },
  demoNote: { fontSize: 12, color: colors.primaryDark, opacity: 0.8, lineHeight: 16 },
});
