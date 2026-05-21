import { apiGet } from './client';
import type { Course, Instructor, PaginatedData } from '@/types';

// Raw shape returned by the randomusers endpoint
interface RawUser {
  id: number;
  name: { title: string; first: string; last: string };
  email: string;
  login: { uuid: string; username: string };
  picture: { large: string; medium: string; thumbnail: string };
}

const JOB_TITLES = [
  'Senior Instructor', 'Course Lead', 'Expert Mentor',
  'Lead Developer', 'Tech Educator', 'Full-Stack Tutor',
  'Data Science Coach', 'UX Design Lead', 'DevOps Expert',
  'Mobile Dev Instructor',
];

function toInstructor(raw: RawUser): Instructor {
  return {
    id: raw.id,
    uid: raw.login.uuid,
    firstName: raw.name.first,
    lastName: raw.name.last,
    username: raw.login.username,
    email: raw.email,
    avatar: raw.picture.medium,
    jobTitle: JOB_TITLES[raw.id % JOB_TITLES.length],
  };
}

// Map raw product categories → educational subject names
const EDUCATION_CATEGORIES: Record<string, string> = {
  smartphones:        'Mobile Development',
  laptops:            'Computer Science',
  fragrances:         'Digital Marketing',
  skincare:           'Health & Wellness',
  groceries:          'Nutrition Science',
  'home-decoration':  'Interior Design',
  furniture:          'Architecture',
  tops:               'Fashion Design',
  'womens-dresses':   'Textile Arts',
  'womens-shoes':     'Product Design',
  'mens-shirts':      'Business Strategy',
  'mens-shoes':       'Sports Science',
  'mens-watches':     'Productivity',
  'womens-watches':   'Lifestyle Design',
  'womens-bags':      'Brand Management',
  'womens-jewellery': 'Fine Arts',
  sunglasses:         'Photography',
  automotive:         'Automotive Eng.',
  motorcycle:         'Mechanical Eng.',
  lighting:           'Electrical Eng.',
};

// Map categories to relevant Picsum seed keywords for visually matching images
const CATEGORY_IMAGE_SEEDS: Record<string, string> = {
  smartphones: 'technology', laptops: 'coding', fragrances: 'marketing',
  skincare: 'wellness', groceries: 'food', 'home-decoration': 'architecture',
  furniture: 'interior', tops: 'fashion', 'womens-dresses': 'textile',
  'womens-shoes': 'design', 'mens-shirts': 'business', 'mens-shoes': 'sport',
  'mens-watches': 'productivity', 'womens-watches': 'lifestyle',
  'womens-bags': 'branding', 'womens-jewellery': 'art',
  sunglasses: 'photography', automotive: 'engineering',
  motorcycle: 'mechanics', lighting: 'science',
};

function toCourse(raw: Course): Course {
  const seed = CATEGORY_IMAGE_SEEDS[raw.category] ?? raw.category;
  return {
    ...raw,
    thumbnail: `https://picsum.photos/seed/${seed}${raw.id}/600/360`,
    category: EDUCATION_CATEGORIES[raw.category] ?? raw.category,
  };
}

export const coursesApi = {
  getCourses: async (page = 1, limit = 20): Promise<PaginatedData<Course>> => {
    const res = await apiGet<PaginatedData<Course>>('/api/v1/public/randomproducts', { page, limit });
    return { ...res, data: (res.data ?? []).map(toCourse) };
  },

  getInstructors: async (page = 1, limit = 20): Promise<PaginatedData<Instructor>> => {
    const res = await apiGet<PaginatedData<RawUser>>('/api/v1/public/randomusers', { page, limit });
    return { ...res, data: (res.data ?? []).map(toInstructor) } as PaginatedData<Instructor>;
  },
};
