import React, { useCallback } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCourses } from '@/context/CoursesContext';
import { CourseCard } from '@/components/course/CourseCard';
import { colors, radius } from '@/constants/theme';
import type { Course } from '@/types';

export default function BookmarksScreen() {
  const { enrichedCourses, bookmarkedIds } = useCourses();
  const bookmarkedCourses = enrichedCourses.filter((c) => bookmarkedIds.includes(c.id));

  const renderItem = useCallback(({ item }: { item: Course }) => <CourseCard course={item} />, []);
  const keyExtractor = useCallback((item: Course) => String(item.id), []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Bookmarks</Text>
        <Text style={styles.subtitle}>
          {bookmarkedCourses.length} saved course{bookmarkedCourses.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {bookmarkedCourses.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyEmoji}>🔖</Text>
          <Text style={styles.emptyTitle}>No bookmarks yet</Text>
          <Text style={styles.emptySubtitle}>
            Tap the bookmark icon on any course to save it here for later.
          </Text>
          <View style={styles.tipBox}>
            <Text style={styles.tipText}>💡 Bookmark 5 courses to unlock a surprise!</Text>
          </View>
        </View>
      ) : (
        <FlatList
          data={bookmarkedCourses}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews
          maxToRenderPerBatch={8}
          initialNumToRender={6}
          windowSize={10}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 },
  title: { fontSize: 24, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  listContent: { paddingHorizontal: 16, paddingBottom: 20 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  emptyEmoji: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: colors.text, textAlign: 'center', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 20 },
  tipBox: {
    marginTop: 24,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.lg,
    paddingHorizontal: 16,
    paddingVertical: 12,
    width: '100%',
  },
  tipText: { fontSize: 13, color: colors.primary, textAlign: 'center', fontWeight: '600' },
});
