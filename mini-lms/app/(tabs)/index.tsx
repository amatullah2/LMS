import React, { useEffect, useCallback } from 'react';
import { View, Text, RefreshControl, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCourses } from '@/context/CoursesContext';
import { CourseCard } from '@/components/course/CourseCard';
import { SearchBar } from '@/components/course/SearchBar';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { colors } from '@/constants/theme';
import type { Course } from '@/types';

export default function HomeScreen() {
  const {
    filteredCourses,
    isLoading,
    isRefreshing,
    error,
    searchQuery,
    fetchCourses,
    loadMore,
  } = useCourses();

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleRefresh = useCallback(() => fetchCourses(true), [fetchCourses]);
  const renderItem = useCallback(({ item }: { item: Course }) => <CourseCard course={item} />, []);
  const keyExtractor = useCallback((item: Course) => String(item.id), []);

  if (isLoading && filteredCourses.length === 0) {
    return <LoadingState message="Loading courses..." />;
  }

  if (error && filteredCourses.length === 0) {
    return <ErrorState message={error} onRetry={() => fetchCourses()} />;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Explore Courses</Text>
        <Text style={styles.subtitle}>{filteredCourses.length} courses available</Text>
      </View>

      <SearchBar />

      {searchQuery.length > 0 && filteredCourses.length === 0 && (
        <View style={styles.emptySearch}>
          <Text style={styles.emptyEmoji}>🔍</Text>
          <Text style={styles.emptyTitle}>No courses found</Text>
          <Text style={styles.emptySubtitle}>Try a different search term</Text>
        </View>
      )}

      <FlatList
        data={filteredCourses}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews
        maxToRenderPerBatch={8}
        initialNumToRender={6}
        windowSize={10}
        ListEmptyComponent={
          !searchQuery ? (
            <View style={styles.emptyList}>
              <Text style={styles.emptyEmoji}>📭</Text>
              <Text style={styles.emptyTitle}>No courses yet</Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 },
  title: { fontSize: 24, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  listContent: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 20 },
  emptySearch: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  emptyList: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  emptyEmoji: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { fontSize: 15, fontWeight: '600', color: colors.textMuted },
  emptySubtitle: { fontSize: 13, color: colors.textLight, marginTop: 4 },
});
