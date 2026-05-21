import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import { coursesApi } from '@/lib/api/courses.api';
import { AppStorage } from '@/lib/storage/async';
import { scheduleBookmarkMilestoneNotification } from '@/lib/notifications';
import { fallbackCoursesResponse, fallbackInstructorsResponse } from '@/lib/data/fallbackCourses';
import type { Course, Instructor } from '@/types';

interface CoursesState {
  courses: Course[];
  instructors: Instructor[];
  bookmarkedIds: number[];
  enrolledIds: number[];
  completedIds: number[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  searchQuery: string;
  page: number;
  hasMore: boolean;
}

type CoursesAction =
  | { type: 'SET_LOADING' }
  | { type: 'SET_REFRESHING' }
  | { type: 'FETCH_SUCCESS'; payload: { courses: Course[]; instructors: Instructor[]; page: number; hasMore: boolean } }
  | { type: 'APPEND_COURSES'; payload: { courses: Course[]; page: number; hasMore: boolean } }
  | { type: 'SET_BOOKMARKS'; payload: number[] }
  | { type: 'SET_ENROLLED'; payload: number[] }
  | { type: 'SET_COMPLETED'; payload: number[] }
  | { type: 'TOGGLE_BOOKMARK'; payload: number }
  | { type: 'ENROLL'; payload: number }
  | { type: 'COMPLETE'; payload: number }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_ERROR'; payload: string };

const initial: CoursesState = {
  courses: [],
  instructors: [],
  bookmarkedIds: [],
  enrolledIds: [],
  completedIds: [],
  isLoading: false,
  isRefreshing: false,
  error: null,
  searchQuery: '',
  page: 1,
  hasMore: true,
};

function reducer(state: CoursesState, action: CoursesAction): CoursesState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: true, error: null };
    case 'SET_REFRESHING':
      return { ...state, isRefreshing: true, error: null };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        courses: action.payload.courses,
        instructors: action.payload.instructors,
        page: action.payload.page,
        hasMore: action.payload.hasMore,
        isLoading: false,
        isRefreshing: false,
        error: null,
      };
    case 'APPEND_COURSES':
      return {
        ...state,
        courses: [...state.courses, ...action.payload.courses],
        page: action.payload.page,
        hasMore: action.payload.hasMore,
        isLoading: false,
      };
    case 'SET_BOOKMARKS':
      return { ...state, bookmarkedIds: action.payload };
    case 'SET_ENROLLED':
      return { ...state, enrolledIds: action.payload };
    case 'SET_COMPLETED':
      return { ...state, completedIds: action.payload };
    case 'TOGGLE_BOOKMARK': {
      const id = action.payload;
      const exists = state.bookmarkedIds.includes(id);
      return {
        ...state,
        bookmarkedIds: exists
          ? state.bookmarkedIds.filter((b) => b !== id)
          : [...state.bookmarkedIds, id],
      };
    }
    case 'ENROLL':
      return {
        ...state,
        enrolledIds: state.enrolledIds.includes(action.payload)
          ? state.enrolledIds
          : [...state.enrolledIds, action.payload],
      };
    case 'COMPLETE':
      return {
        ...state,
        completedIds: state.completedIds.includes(action.payload)
          ? state.completedIds
          : [...state.completedIds, action.payload],
      };
    case 'SET_SEARCH':
      return { ...state, searchQuery: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false, isRefreshing: false };
    default:
      return state;
  }
}

interface CoursesContextType extends CoursesState {
  enrichedCourses: Course[];
  filteredCourses: Course[];
  fetchCourses: (refresh?: boolean) => Promise<void>;
  loadMore: () => Promise<void>;
  toggleBookmark: (id: number) => Promise<void>;
  enroll: (id: number) => Promise<void>;
  markCompleted: (id: number) => Promise<void>;
  setSearch: (q: string) => void;
}

const CoursesContext = createContext<CoursesContextType | null>(null);

export function CoursesProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initial);

  // Load persisted bookmarks, enrolled & completed on mount
  useEffect(() => {
    (async () => {
      const [bookmarks, enrolled, completed] = await Promise.all([
        AppStorage.getBookmarks(),
        AppStorage.getEnrolled(),
        AppStorage.getCompleted(),
      ]);
      dispatch({ type: 'SET_BOOKMARKS', payload: bookmarks });
      dispatch({ type: 'SET_ENROLLED', payload: enrolled });
      dispatch({ type: 'SET_COMPLETED', payload: completed });
    })();
  }, []);

  const fetchCourses = useCallback(async (refresh = false) => {
    if (refresh) {
      dispatch({ type: 'SET_REFRESHING' });
    } else {
      dispatch({ type: 'SET_LOADING' });
    }

    try {
      // Try cache first (only on initial load, not refresh)
      if (!refresh && state.courses.length === 0) {
        const [cachedCourses, cachedInstructors] = await Promise.all([
          AppStorage.getCourses<Course[]>(),
          AppStorage.getInstructors<Instructor[]>(),
        ]);
        if (cachedCourses && cachedInstructors) {
          dispatch({
            type: 'FETCH_SUCCESS',
            payload: { courses: cachedCourses, instructors: cachedInstructors, page: 1, hasMore: true },
          });
        }
      }

      const [coursesRes, instructorsRes] = await Promise.all([
        coursesApi.getCourses(1, 20),
        coursesApi.getInstructors(1, 20),
      ]);

      const courses = coursesRes?.data ?? [];
      const instructors = instructorsRes?.data ?? [];

      await Promise.all([
        AppStorage.setCourses(courses),
        AppStorage.setInstructors(instructors),
      ]);

      dispatch({
        type: 'FETCH_SUCCESS',
        payload: {
          courses,
          instructors,
          page: 1,
          hasMore: coursesRes?.hasNextPage ?? false,
        },
      });
    } catch {
      const fallbackCourses = fallbackCoursesResponse.data;
      const fallbackInstructors = fallbackInstructorsResponse.data;

      await Promise.all([
        AppStorage.setCourses(fallbackCourses),
        AppStorage.setInstructors(fallbackInstructors),
      ]);

      dispatch({
        type: 'FETCH_SUCCESS',
        payload: {
          courses: fallbackCourses,
          instructors: fallbackInstructors,
          page: 1,
          hasMore: false,
        },
      });
    }
  }, [state.courses.length]);

  const loadMore = useCallback(async () => {
    if (!state.hasMore || state.isLoading) return;
    try {
      const nextPage = state.page + 1;
      const res = await coursesApi.getCourses(nextPage, 20);
      dispatch({
        type: 'APPEND_COURSES',
        payload: { courses: res?.data ?? [], page: nextPage, hasMore: res?.hasNextPage ?? false },
      });
    } catch {
      // silently fail on load-more
    }
  }, [state.hasMore, state.isLoading, state.page]);

  const toggleBookmark = useCallback(async (id: number) => {
    const isBookmarked = state.bookmarkedIds.includes(id);
    dispatch({ type: 'TOGGLE_BOOKMARK', payload: id });

    if (isBookmarked) {
      await AppStorage.removeBookmark(id);
    } else {
      const updated = await AppStorage.addBookmark(id);
      // Fire notification at exactly 5 bookmarks
      if (updated.length === 5) {
        await scheduleBookmarkMilestoneNotification();
      }
    }
  }, [state.bookmarkedIds]);

  const enroll = useCallback(async (id: number) => {
    dispatch({ type: 'ENROLL', payload: id });
    await AppStorage.addEnrolled(id);
  }, []);

  const markCompleted = useCallback(async (id: number) => {
    dispatch({ type: 'COMPLETE', payload: id });
    await AppStorage.addCompleted(id);
  }, []);

  const setSearch = useCallback((q: string) => {
    dispatch({ type: 'SET_SEARCH', payload: q });
  }, []);

  // Enrich courses with instructors, bookmark, enroll, completion status
  const enrichedCourses: Course[] = state.courses.map((course, i) => ({
    ...course,
    instructor: state.instructors[i % Math.max(state.instructors.length, 1)],
    isBookmarked: state.bookmarkedIds.includes(course.id),
    isEnrolled: state.enrolledIds.includes(course.id),
    isCompleted: state.completedIds.includes(course.id),
  }));

  const filteredCourses = state.searchQuery.trim()
    ? enrichedCourses.filter(
        (c) =>
          c.title.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
          c.description.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
          c.category.toLowerCase().includes(state.searchQuery.toLowerCase())
      )
    : enrichedCourses;

  return (
    <CoursesContext.Provider
      value={{
        ...state,
        enrichedCourses,
        filteredCourses,
        fetchCourses,
        loadMore,
        toggleBookmark,
        enroll,
        markCompleted,
        setSearch,
      }}
    >
      {children}
    </CoursesContext.Provider>
  );
}

export function useCourses(): CoursesContextType {
  const ctx = useContext(CoursesContext);
  if (!ctx) throw new Error('useCourses must be used within CoursesProvider');
  return ctx;
}
