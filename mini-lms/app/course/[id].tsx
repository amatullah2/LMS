import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCourses } from '@/context/CoursesContext';
import { Button } from '@/components/ui/Button';
import { colors, radius, shadow } from '@/constants/theme';

const { width } = Dimensions.get('window');

const LEARN_ITEMS = [
  'Comprehensive hands-on projects',
  'Industry best practices and patterns',
  'Real-world case studies',
  'Certificate upon completion',
];

export default function CourseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { enrichedCourses, toggleBookmark, enroll } = useCourses();
  const [enrolling, setEnrolling] = useState(false);

  const course = useMemo(
    () => enrichedCourses.find((c) => String(c.id) === id),
    [enrichedCourses, id]
  );

  if (!course) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Course not found.</Text>
      </View>
    );
  }

  const handleEnroll = async () => {
    if (course.isEnrolled) return;
    setEnrolling(true);
    await enroll(course.id);
    setEnrolling(false);
    Alert.alert('Enrolled!', `You are now enrolled in "${course.title}"`, [
      {
        text: 'Start Learning',
        onPress: () =>
          router.push({ pathname: '/course/webview/[id]', params: { id: String(course.id) } }),
      },
      { text: 'Later', style: 'cancel' },
    ]);
  };

  const handleOpenContent = () => {
    router.push({ pathname: '/course/webview/[id]', params: { id: String(course.id) } });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Hero image */}
        <Image
          source={course.thumbnail}
          style={{ width, height: 240 }}
          contentFit="cover"
          transition={300}
        />

        <View style={styles.content}>

          {/* Category + Bookmark */}
          <View style={styles.topRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{course.category}</Text>
            </View>
            <TouchableOpacity
              onPress={() => toggleBookmark(course.id)}
              style={[styles.bookmarkBtn, course.isBookmarked && styles.bookmarkBtnActive]}
              hitSlop={8}
            >
              <Text style={styles.bookmarkIcon}>{course.isBookmarked ? '🔖' : '🤍'}</Text>
            </TouchableOpacity>
          </View>

          {/* Title */}
          <Text style={styles.title}>{course.title}</Text>

          {/* Meta row */}
          <View style={styles.metaRow}>
            <Text style={styles.star}>★</Text>
            <Text style={styles.ratingText}>{course.rating.toFixed(1)}</Text>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.metaText}>{course.brand}</Text>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.metaText}>{course.stock} spots left</Text>
          </View>

          {/* Instructor card */}
          {course.instructor && (
            <View style={styles.instructorCard}>
              <Image
                source={course.instructor.avatar}
                style={styles.instructorAvatar}
                contentFit="cover"
              />
              <View>
                <Text style={styles.instructorName}>
                  {course.instructor.firstName} {course.instructor.lastName}
                </Text>
                <Text style={styles.instructorJob}>{course.instructor.jobTitle}</Text>
              </View>
            </View>
          )}

          {/* Description */}
          <Text style={styles.sectionLabel}>About this course</Text>
          <Text style={styles.descriptionText}>{course.description}</Text>

          {/* What you'll learn */}
          <Text style={styles.sectionLabel}>What you'll learn</Text>
          <View style={styles.learnList}>
            {LEARN_ITEMS.map((item) => (
              <View key={item} style={styles.learnItem}>
                <Text style={styles.checkMark}>✓</Text>
                <Text style={styles.learnText}>{item}</Text>
              </View>
            ))}
          </View>

          {/* Price */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{Math.round(course.price * 83)}</Text>
            {course.discountPercentage > 0 && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>{Math.round(course.discountPercentage)}% OFF</Text>
              </View>
            )}
          </View>

        </View>
      </ScrollView>

      {/* Bottom CTAs */}
      <View style={styles.footer}>
        <View style={styles.footerBtn}>
          <Button title="View Content" variant="outline" onPress={handleOpenContent} fullWidth />
        </View>
        <View style={styles.footerBtn}>
          <Button
            title={course.isEnrolled ? '✓ Enrolled' : 'Enroll Now'}
            variant={course.isEnrolled ? 'secondary' : 'primary'}
            onPress={handleEnroll}
            loading={enrolling}
            disabled={course.isEnrolled}
            fullWidth
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.card },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },
  notFoundText: { fontSize: 15, color: colors.textMuted },

  content: { paddingHorizontal: 20, paddingTop: 20 },

  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  categoryBadge: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  categoryText: { color: colors.primary, fontSize: 13, fontWeight: '700', textTransform: 'capitalize' },
  bookmarkBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  bookmarkBtnActive: { backgroundColor: colors.primaryLight, borderColor: colors.primaryLight },
  bookmarkIcon: { fontSize: 18 },

  title: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: 10, lineHeight: 30 },

  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
  star: { color: colors.amber, fontSize: 15 },
  ratingText: { fontSize: 13, fontWeight: '700', color: colors.text },
  dot: { color: colors.textLight, fontSize: 13 },
  metaText: { fontSize: 13, color: colors.textMuted },

  instructorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  instructorAvatar: { width: 44, height: 44, borderRadius: 22 },
  instructorName: { fontSize: 15, fontWeight: '700', color: colors.text },
  instructorJob: { fontSize: 12, color: colors.textMuted, marginTop: 2 },

  sectionLabel: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 8 },
  descriptionText: { fontSize: 14, color: colors.textMuted, lineHeight: 22, marginBottom: 20 },

  learnList: { gap: 8, marginBottom: 24 },
  learnItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  checkMark: { color: colors.primary, fontWeight: '700', fontSize: 14, marginTop: 1 },
  learnText: { fontSize: 14, color: colors.textMuted, flex: 1, lineHeight: 20 },

  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 },
  price: { fontSize: 30, fontWeight: '800', color: colors.text },
  discountBadge: {
    backgroundColor: colors.successLight,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  discountText: { fontSize: 12, fontWeight: '800', color: colors.success },

  footer: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
  },
  footerBtn: { flex: 1 },
});
