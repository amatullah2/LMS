export interface User {
  _id: string;
  username: string;
  email: string;
  fullName?: string;
  avatar?: {
    url: string;
    localPath?: string;
  };
  role: string;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  role?: string;
}

export interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedData<T> {
  data: T[];
  page: number;
  limit: number;
  totalPages: number;
  previousPage: boolean;
  nextPage: boolean;
  serialNumberStartFrom: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  totalItems: number;
}

// Instructors (from randomusers endpoint)
export interface Instructor {
  id: number;
  uid: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  avatar: string;
  jobTitle: string;
}

// Courses (from randomproducts endpoint)
export interface Course {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand: string;
  category: string;
  thumbnail: string;
  images: string[];
  // Enriched locally
  instructor?: Instructor;
  isBookmarked?: boolean;
  isEnrolled?: boolean;
  isCompleted?: boolean;
}

export interface UserStats {
  enrolled: number;
  bookmarked: number;
  completed: number;
}
