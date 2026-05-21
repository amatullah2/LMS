import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_VERSION = 'v3'; // bump this whenever the data shape changes

const KEYS = {
  BOOKMARKS: 'lms_bookmarks',
  ENROLLED: 'lms_enrolled',
  COMPLETED: 'lms_completed',
  LAST_OPENED: 'lms_last_opened',
  COURSES_CACHE: 'lms_courses_cache',
  INSTRUCTORS_CACHE: 'lms_instructors_cache',
  PREFERENCES: 'lms_preferences',
  CACHE_VER: 'lms_cache_version',
  AVATAR_URI: 'lms_avatar_uri',
} as const;

export const AppStorage = {
  // Bookmarks
  async getBookmarks(): Promise<number[]> {
    const raw = await AsyncStorage.getItem(KEYS.BOOKMARKS);
    return raw ? (JSON.parse(raw) as number[]) : [];
  },

  async setBookmarks(ids: number[]): Promise<void> {
    await AsyncStorage.setItem(KEYS.BOOKMARKS, JSON.stringify(ids));
  },

  async addBookmark(id: number): Promise<number[]> {
    const current = await this.getBookmarks();
    if (current.includes(id)) return current;
    const updated = [...current, id];
    await this.setBookmarks(updated);
    return updated;
  },

  async removeBookmark(id: number): Promise<number[]> {
    const current = await this.getBookmarks();
    const updated = current.filter((b) => b !== id);
    await this.setBookmarks(updated);
    return updated;
  },

  // Enrolled
  async getEnrolled(): Promise<number[]> {
    const raw = await AsyncStorage.getItem(KEYS.ENROLLED);
    return raw ? (JSON.parse(raw) as number[]) : [];
  },

  async addEnrolled(id: number): Promise<number[]> {
    const current = await this.getEnrolled();
    if (current.includes(id)) return current;
    const updated = [...current, id];
    await AsyncStorage.setItem(KEYS.ENROLLED, JSON.stringify(updated));
    return updated;
  },

  // Completed courses
  async getCompleted(): Promise<number[]> {
    const raw = await AsyncStorage.getItem(KEYS.COMPLETED);
    return raw ? (JSON.parse(raw) as number[]) : [];
  },

  async addCompleted(id: number): Promise<number[]> {
    const current = await this.getCompleted();
    if (current.includes(id)) return current;
    const updated = [...current, id];
    await AsyncStorage.setItem(KEYS.COMPLETED, JSON.stringify(updated));
    return updated;
  },

  // Avatar URI
  async getAvatarUri(): Promise<string | null> {
    return AsyncStorage.getItem(KEYS.AVATAR_URI);
  },

  async setAvatarUri(uri: string): Promise<void> {
    await AsyncStorage.setItem(KEYS.AVATAR_URI, uri);
  },

  // Last opened (for 24hr notification)
  async updateLastOpened(): Promise<void> {
    await AsyncStorage.setItem(KEYS.LAST_OPENED, Date.now().toString());
  },

  async getLastOpened(): Promise<number | null> {
    const raw = await AsyncStorage.getItem(KEYS.LAST_OPENED);
    return raw ? parseInt(raw, 10) : null;
  },

  // Courses cache
  async setCourses(data: unknown): Promise<void> {
    await AsyncStorage.setItem(KEYS.COURSES_CACHE, JSON.stringify(data));
  },

  async getCourses<T>(): Promise<T | null> {
    const raw = await AsyncStorage.getItem(KEYS.COURSES_CACHE);
    return raw ? (JSON.parse(raw) as T) : null;
  },

  async setInstructors(data: unknown): Promise<void> {
    await AsyncStorage.setItem(KEYS.INSTRUCTORS_CACHE, JSON.stringify(data));
  },

  async getInstructors<T>(): Promise<T | null> {
    const raw = await AsyncStorage.getItem(KEYS.INSTRUCTORS_CACHE);
    return raw ? (JSON.parse(raw) as T) : null;
  },

  async clearCache(): Promise<void> {
    await AsyncStorage.multiRemove([KEYS.COURSES_CACHE, KEYS.INSTRUCTORS_CACHE]);
  },

  // Clears courses/instructors cache if the stored version doesn't match CACHE_VERSION
  async validateCacheVersion(): Promise<void> {
    const stored = await AsyncStorage.getItem(KEYS.CACHE_VER);
    if (stored !== CACHE_VERSION) {
      await AsyncStorage.multiRemove([KEYS.COURSES_CACHE, KEYS.INSTRUCTORS_CACHE]);
      await AsyncStorage.setItem(KEYS.CACHE_VER, CACHE_VERSION);
    }
  },
};
