import React, { useMemo, useRef, useState } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet, Alert, ScrollView, Platform } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCourses } from '@/context/CoursesContext';
import { useAuth } from '@/context/AuthContext';
import { colors, radius } from '@/constants/theme';

function buildCourseHTML(params: {
  title: string;
  description: string;
  instructor: string;
  category: string;
  rating: number;
  price: number;
  userName: string;
  isEnrolled: boolean;
}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0"/>
  <title>${params.title}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8fafc; color: #1e293b; }
    .header { background: linear-gradient(135deg, #7c3aed, #3b82f6); padding: 24px 20px; color: white; }
    .badge { background: rgba(255,255,255,0.2); display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; margin-bottom: 10px; }
    h1 { font-size: 22px; font-weight: 700; line-height: 1.3; margin-bottom: 6px; }
    .meta { font-size: 13px; opacity: 0.85; }
    .card { background: white; border-radius: 12px; margin: 16px; padding: 16px; box-shadow: 0 1px 4px rgba(0,0,0,0.08); }
    .card-title { font-size: 13px; font-weight: 600; color: #7c3aed; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 10px; }
    .row { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
    .icon { font-size: 18px; width: 24px; }
    .label { font-size: 13px; color: #64748b; flex: 1; }
    .value { font-size: 13px; font-weight: 600; color: #1e293b; }
    .divider { height: 1px; background: #f1f5f9; margin: 10px 0; }
    .enrolled { background: #ecfdf5; border: 1px solid #6ee7b7; border-radius: 8px; padding: 12px; margin: 16px; display: flex; align-items: center; gap: 8px; }
    .enrolled-text { font-size: 13px; color: #059669; font-weight: 600; }
    .lesson { background: white; border-radius: 10px; margin: 8px 16px; padding: 14px; border-left: 3px solid #7c3aed; display: flex; align-items: center; gap: 12px; }
    .lesson-num { font-size: 11px; color: #7c3aed; font-weight: 700; }
    .lesson-title { font-size: 14px; font-weight: 600; color: #1e293b; }
    .lesson-dur { font-size: 11px; color: #94a3b8; }
    .section-heading { font-size: 15px; font-weight: 700; color: #1e293b; padding: 0 16px; margin-top: 16px; margin-bottom: 8px; }
    .progress-bar { background: #e2e8f0; border-radius: 10px; height: 6px; margin: 0 16px 16px; overflow: hidden; }
    .progress-fill { height: 100%; background: linear-gradient(to right, #7c3aed, #3b82f6); border-radius: 10px; width: ${params.isEnrolled ? '25' : '0'}%; transition: width 1s ease; }
    .footer { text-align: center; padding: 24px; color: #94a3b8; font-size: 12px; }
    .btn { background: linear-gradient(135deg, #7c3aed, #3b82f6); color: white; border: none; padding: 12px 24px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; width: calc(100% - 32px); margin: 8px 16px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="badge">${params.category}</div>
    <h1>${params.title}</h1>
    <div class="meta">By ${params.instructor} · ⭐ ${params.rating.toFixed(1)}</div>
  </div>

  ${params.isEnrolled ? `
  <div class="enrolled">
    <span>✅</span>
    <span class="enrolled-text">You're enrolled, ${params.userName}! 25% complete</span>
  </div>
  <div class="progress-bar"><div class="progress-fill" id="progress"></div></div>
  ` : ''}

  <div class="card">
    <div class="card-title">Course Overview</div>
    <p style="font-size:13px;color:#64748b;line-height:1.6">${params.description}</p>
  </div>

  <div class="card">
    <div class="card-title">Course Details</div>
    <div class="row">
      <span class="icon">💰</span>
      <span class="label">Price</span>
      <span class="value">₹${Math.round(params.price * 83)}</span>
    </div>
    <div class="divider"></div>
    <div class="row">
      <span class="icon">📂</span>
      <span class="label">Category</span>
      <span class="value" style="text-transform:capitalize">${params.category}</span>
    </div>
    <div class="divider"></div>
    <div class="row">
      <span class="icon">🎓</span>
      <span class="label">Instructor</span>
      <span class="value">${params.instructor}</span>
    </div>
  </div>

  <div class="section-heading">Course Curriculum</div>
  ${['Introduction & Setup', 'Core Concepts', 'Hands-on Project', 'Advanced Topics', 'Final Assessment']
    .map((title, i) => `
  <div class="lesson">
    <div>
      <div class="lesson-num">LESSON ${i + 1}</div>
      <div class="lesson-title">${title}</div>
      <div class="lesson-dur">${20 + i * 15} min · ${i < 2 ? 'Free Preview' : 'Enrolled Only'}</div>
    </div>
    <span style="margin-left:auto;font-size:18px">${i < 2 || params.isEnrolled ? '▶️' : '🔒'}</span>
  </div>`).join('')}

  <button class="btn" onclick="window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({action:'enroll',courseTitle:'${params.title.replace(/'/g, "\\'")}'}))">
    ${params.isEnrolled ? '▶ Continue Learning' : '🚀 Enroll Now — ₹' + Math.round(params.price * 83)}
  </button>

  <div class="footer">Mini LMS · Built with React Native Expo</div>

  <script>
    setTimeout(() => {
      const el = document.getElementById('progress');
      if (el) el.style.width = '25%';
    }, 300);

    document.addEventListener('message', function(e) {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === 'COURSE_DATA') console.log('Received from native:', msg);
      } catch {}
    });
  </script>
</body>
</html>`;
}

export default function WebViewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const webViewRef = useRef<WebView>(null);
  const [loadError, setLoadError] = useState(false);
  const [loading, setLoading] = useState(true);
  const { enrichedCourses, enroll, markCompleted } = useCourses();
  const { user } = useAuth();

  const course = useMemo(
    () => enrichedCourses.find((c) => String(c.id) === id),
    [enrichedCourses, id]
  );

  const htmlContent = useMemo(() => {
    if (!course) return '';
    return buildCourseHTML({
      title: course.title,
      description: course.description,
      instructor: course.instructor
        ? `${course.instructor.firstName} ${course.instructor.lastName}`
        : 'Expert Instructor',
      category: course.category,
      rating: course.rating,
      price: course.price,
      userName: user?.fullName ?? user?.username ?? 'Learner',
      isEnrolled: course.isEnrolled ?? false,
    });
  }, [course, user]);

  const injectedJS = useMemo(() => {
    if (!course) return '';
    return `
      window.ReactNativeWebView && window.ReactNativeWebView.postMessage(
        JSON.stringify({ type: 'NATIVE_READY', courseId: '${id}' })
      );
      window.__COURSE_DATA__ = ${JSON.stringify({
        id: course.id,
        title: course.title,
        category: course.category,
        isEnrolled: course.isEnrolled,
      })};
      true;
    `;
  }, [course, id]);

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data) as { action?: string; type?: string };
      if (msg.action === 'enroll' && course) {
        if (course.isEnrolled) {
          // Already enrolled — mark as completed
          markCompleted(course.id);
          Alert.alert('🎉 Progress Saved!', 'Great job continuing your learning journey!');
          router.back();
        } else {
          enroll(course.id);
          Alert.alert('✅ Enrolled!', `You are now enrolled in "${course.title}". Keep learning!`);
          router.back();
        }
      }
    } catch {}
  };

  if (!course) {
    return (
      <View style={styles.centered}>
        <Text style={styles.notFoundText}>Course not found.</Text>
      </View>
    );
  }

  if (Platform.OS === 'web') {
    return (
      <ScrollView style={styles.webWrap} contentContainerStyle={styles.webContent}>
        <Text style={styles.webTitle}>{course.title}</Text>
        <Text style={styles.webMeta}>⭐ {course.rating.toFixed(1)} · {course.category}</Text>
        <Text style={styles.webDescription}>{course.description}</Text>

        <View style={styles.webCard}>
          <Text style={styles.webCardLabel}>Instructor</Text>
          <Text style={styles.webCardValue}>
            {course.instructor
              ? `${course.instructor.firstName} ${course.instructor.lastName}`
              : 'Expert Instructor'}
          </Text>
        </View>

        <View style={styles.webCard}>
          <Text style={styles.webCardLabel}>Course Access</Text>
          <Text style={styles.webCardValue}>
            {course.isEnrolled ? 'Enrolled' : 'Not Enrolled'}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => {
            if (course.isEnrolled) {
              markCompleted(course.id);
              Alert.alert('🎉 Progress Saved!', 'Great job continuing your learning journey!');
              router.back();
            } else {
              enroll(course.id);
              Alert.alert('✅ Enrolled!', `You are now enrolled in "${course.title}". Keep learning!`);
              router.back();
            }
          }}
          style={styles.webCta}
        >
          <Text style={styles.webCtaText}>
            {course.isEnrolled ? 'Continue Learning' : 'Enroll Now'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  if (loadError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorEmoji}>😔</Text>
        <Text style={styles.errorTitle}>Content Failed to Load</Text>
        <Text style={styles.errorSubtitle}>
          There was a problem loading the course content. Please try again.
        </Text>
        <TouchableOpacity onPress={() => setLoadError(false)} style={styles.retryBtn}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading content...</Text>
        </View>
      )}
      <WebView
        ref={webViewRef}
        source={{ html: htmlContent }}
        injectedJavaScript={injectedJS}
        onMessage={handleMessage}
        onLoad={() => setLoading(false)}
        onError={() => { setLoading(false); setLoadError(true); }}
        onHttpError={() => { setLoading(false); setLoadError(true); }}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState={false}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  webWrap: { flex: 1, backgroundColor: colors.background },
  webContent: { padding: 16, paddingBottom: 32 },
  webTitle: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: 8 },
  webMeta: { fontSize: 13, color: colors.textMuted, marginBottom: 14 },
  webDescription: { fontSize: 14, color: colors.textMuted, lineHeight: 22, marginBottom: 18 },
  webCard: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  webCardLabel: { fontSize: 12, color: colors.textLight, marginBottom: 6, textTransform: 'uppercase' },
  webCardValue: { fontSize: 14, fontWeight: '600', color: colors.text },
  webCta: {
    marginTop: 6,
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: 12,
    alignItems: 'center',
  },
  webCtaText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    backgroundColor: colors.background,
  },
  notFoundText: { fontSize: 15, color: colors.textMuted },
  errorEmoji: { fontSize: 44, marginBottom: 16 },
  errorTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 8 },
  errorSubtitle: { fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  retryBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: radius.lg,
  },
  retryText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  loadingOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
    zIndex: 10,
  },
  loadingText: { color: colors.textMuted, marginTop: 12, fontSize: 13 },
});
