import React, { memo, useCallback } from 'react';
import { View, Text, TouchableOpacity, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCourses } from '@/context/CoursesContext';
import { colors, radius, shadow } from '@/constants/theme';
import type { Course } from '@/types';

interface CourseCardProps {
  course: Course;
}

export const CourseCard = memo(function CourseCard({ course }: CourseCardProps) {
  const router = useRouter();
  const { toggleBookmark } = useCourses();

  const handleBookmark = useCallback(
    (e: { stopPropagation: () => void }) => {
      e.stopPropagation();
      toggleBookmark(course.id);
    },
    [course.id, toggleBookmark]
  );

  const handlePress = useCallback(() => {
    router.push({ pathname: '/course/[id]', params: { id: String(course.id) } });
  }, [course.id, router]);

  return (
    <Pressable
      onPress={handlePress}
      android_ripple={{ color: colors.primaryLight }}
      style={styles.card}
    >
      <Image
        source={course.thumbnail}
        style={styles.thumbnail}
        contentFit="cover"
        transition={300}
        placeholder="L6PZfSi_.AyE_3t7t7R**0o#DgR4"
      />

      <View style={styles.body}>
        <View style={styles.topRow}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{course.category}</Text>
          </View>
          <TouchableOpacity
            onPress={handleBookmark}
            style={[styles.bookmarkBtn, course.isBookmarked && styles.bookmarkBtnActive]}
            hitSlop={8}
          >
            <Text style={styles.bookmarkIcon}>{course.isBookmarked ? '🔖' : '🏷️'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.title} numberOfLines={2}>{course.title}</Text>
        <Text style={styles.description} numberOfLines={2}>{course.description}</Text>

        <View style={styles.footer}>
          {course.instructor && (
            <View style={styles.instructorRow}>
              <Image
                source={course.instructor.avatar}
                style={styles.avatar}
                contentFit="cover"
              />
              <Text style={styles.instructorName} numberOfLines={1}>
                {course.instructor.firstName} {course.instructor.lastName}
              </Text>
            </View>
          )}
          <View style={styles.ratingRow}>
            <Text style={styles.star}>★</Text>
            <Text style={styles.ratingText}>{course.rating.toFixed(1)}</Text>
          </View>
        </View>

        {course.isEnrolled && (
          <View style={styles.enrolledBadge}>
            <Text style={styles.enrolledText}>✓ Enrolled</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.sm,
  },
  thumbnail: { width: '100%', height: 160 },
  body: { padding: 14 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  categoryBadge: {
    backgroundColor: colors.primaryLight,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  categoryText: { color: colors.primary, fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  bookmarkBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookmarkBtnActive: { backgroundColor: colors.primaryLight },
  bookmarkIcon: { fontSize: 15 },
  title: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 4, lineHeight: 21 },
  description: { fontSize: 13, color: colors.textMuted, marginBottom: 10, lineHeight: 18 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  instructorRow: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8, gap: 6 },
  avatar: { width: 22, height: 22, borderRadius: 11 },
  instructorName: { fontSize: 12, color: colors.textMuted, flex: 1 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  star: { color: colors.amber, fontSize: 13 },
  ratingText: { fontSize: 12, fontWeight: '700', color: colors.text },
  enrolledBadge: {
    marginTop: 8,
    backgroundColor: colors.successLight,
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  enrolledText: { fontSize: 11, color: colors.success, fontWeight: '600' },
});
