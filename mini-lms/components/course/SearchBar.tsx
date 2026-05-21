import React, { useCallback, useRef } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useCourses } from '@/context/CoursesContext';
import { colors, radius } from '@/constants/theme';

export function SearchBar() {
  const { searchQuery, setSearch } = useCourses();
  const inputRef = useRef<TextInput>(null);

  const handleClear = useCallback(() => {
    setSearch('');
    inputRef.current?.clear();
  }, [setSearch]);

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🔍</Text>
      <TextInput
        ref={inputRef}
        value={searchQuery}
        onChangeText={setSearch}
        placeholder="Search courses, categories..."
        placeholderTextColor={colors.textLight}
        style={styles.input}
        returnKeyType="search"
        clearButtonMode="never"
      />
      {searchQuery.length > 0 && (
        <TouchableOpacity onPress={handleClear} hitSlop={8}>
          <Text style={styles.clearIcon}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    paddingHorizontal: 14,
    paddingVertical: 11,
    marginHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  icon: { fontSize: 15, marginRight: 8 },
  input: { flex: 1, fontSize: 14, color: colors.text, padding: 0 },
  clearIcon: { color: colors.textLight, fontSize: 16, fontWeight: '600' },
});
