import "server-only";

import type {
  CATEGORIES_QUERY_RESULT,
  COURSES_QUERY_RESULT,
  COURSE_BY_SLUG_QUERY_RESULT,
  COURSE_SLUGS_QUERY_RESULT,
  INSTRUCTORS_QUERY_RESULT,
  INSTRUCTOR_BY_SLUG_QUERY_RESULT,
  INSTRUCTOR_SLUGS_QUERY_RESULT,
  LESSON_BY_SLUG_QUERY_RESULT,
  LESSON_SLUGS_QUERY_RESULT,
} from "@/sanity.types";

import { sanityFetch } from "./fetch";
import {
  CATEGORIES_QUERY,
  COURSES_QUERY,
  COURSE_BY_SLUG_QUERY,
  COURSE_SLUGS_QUERY,
  INSTRUCTORS_QUERY,
  INSTRUCTOR_BY_SLUG_QUERY,
  INSTRUCTOR_SLUGS_QUERY,
  LESSON_BY_SLUG_QUERY,
  LESSON_SLUGS_QUERY,
} from "./queries";

/**
 * The app's read API.
 *
 * Pages call these and never touch the client directly, so caching and cache
 * tags stay in one place. Tags are per document type, so a future webhook can
 * revalidate just the type that changed.
 *
 * `server-only` is load-bearing — everything here runs through a client that
 * holds the read token.
 */

export function getCourses(): Promise<COURSES_QUERY_RESULT> {
  return sanityFetch({ query: COURSES_QUERY, tags: ["course"] });
}

export function getCourseBySlug(slug: string): Promise<COURSE_BY_SLUG_QUERY_RESULT> {
  return sanityFetch({
    query: COURSE_BY_SLUG_QUERY,
    params: { slug },
    tags: ["course", `course:${slug}`],
  });
}

export function getCourseSlugs(): Promise<COURSE_SLUGS_QUERY_RESULT> {
  return sanityFetch({ query: COURSE_SLUGS_QUERY, tags: ["course"] });
}

export function getLessonBySlug(slug: string): Promise<LESSON_BY_SLUG_QUERY_RESULT> {
  return sanityFetch({
    query: LESSON_BY_SLUG_QUERY,
    params: { slug },
    tags: ["lesson", `lesson:${slug}`],
  });
}

export function getLessonSlugs(): Promise<LESSON_SLUGS_QUERY_RESULT> {
  return sanityFetch({ query: LESSON_SLUGS_QUERY, tags: ["lesson"] });
}

export function getInstructors(): Promise<INSTRUCTORS_QUERY_RESULT> {
  return sanityFetch({ query: INSTRUCTORS_QUERY, tags: ["instructor"] });
}

export function getInstructorBySlug(slug: string): Promise<INSTRUCTOR_BY_SLUG_QUERY_RESULT> {
  return sanityFetch({
    query: INSTRUCTOR_BY_SLUG_QUERY,
    params: { slug },
    tags: ["instructor", `instructor:${slug}`],
  });
}

export function getInstructorSlugs(): Promise<INSTRUCTOR_SLUGS_QUERY_RESULT> {
  return sanityFetch({ query: INSTRUCTOR_SLUGS_QUERY, tags: ["instructor"] });
}

export function getCategories(): Promise<CATEGORIES_QUERY_RESULT> {
  return sanityFetch({ query: CATEGORIES_QUERY, tags: ["category"] });
}
