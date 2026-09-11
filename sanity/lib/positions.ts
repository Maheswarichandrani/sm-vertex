/**
 * Module and lesson numbering.
 *
 * "Module 5" and "Lesson 5.1" are derived from authored order and stored
 * nowhere (AGENTS.md §8). GROQ has no array-index variable, so the counting
 * happens here instead — once, so every caller labels a lesson identically.
 *
 * No `server-only` guard: these are pure functions over already-fetched data
 * and hold no token, so a client component may use them.
 */

type LessonLike = { _id: string } | null;
type ModuleLike<TLesson> = { _key: string; lessons?: Array<TLesson> | null };

export type WithPosition<TModule, TLesson> = TModule & {
  /** 1-based, as shown: "Module 5". */
  moduleNumber: number;
  lessons: Array<TLesson & { lessonNumber: number; lessonLabel: string }>;
};

/**
 * Numbers a course's modules and their lessons.
 *
 * `lessonLabel` is the "5.1" part only — the surrounding copy ("Lesson 5.1 in
 * Data Fetching and Caching") belongs to the view, which knows the wording.
 */
export function withPositions<
  TLesson extends LessonLike,
  TModule extends ModuleLike<TLesson>,
>(modules: Array<TModule> | null | undefined): Array<WithPosition<TModule, NonNullable<TLesson>>> {
  return (modules ?? []).map((moduleItem, moduleIndex) => {
    const moduleNumber = moduleIndex + 1;
    const lessons = (moduleItem.lessons ?? []).filter(
      (lessonItem): lessonItem is NonNullable<TLesson> => lessonItem !== null,
    );

    return {
      ...moduleItem,
      moduleNumber,
      lessons: lessons.map((lessonItem, lessonIndex) => ({
        ...lessonItem,
        lessonNumber: lessonIndex + 1,
        lessonLabel: `${moduleNumber}.${lessonIndex + 1}`,
      })),
    };
  });
}

/**
 * Locates a lesson inside its course.
 *
 * The lesson page gets the course back as `modules[]{_key, title, lessonIds}`,
 * which is enough to label the lesson without re-fetching every sibling.
 * Returns null when the lesson is not in the course — a lesson can exist
 * without any course referencing it yet.
 */
export function findLessonPosition(
  modules: Array<{ _key: string; title?: string | null; lessonIds?: Array<string> | null }> | null | undefined,
  lessonId: string,
): { moduleNumber: number; moduleTitle: string | null; lessonNumber: number; lessonLabel: string } | null {
  const list = modules ?? [];

  for (let moduleIndex = 0; moduleIndex < list.length; moduleIndex++) {
    const lessonIndex = (list[moduleIndex].lessonIds ?? []).indexOf(lessonId);
    if (lessonIndex === -1) continue;

    return {
      moduleNumber: moduleIndex + 1,
      moduleTitle: list[moduleIndex].title ?? null,
      lessonNumber: lessonIndex + 1,
      lessonLabel: `${moduleIndex + 1}.${lessonIndex + 1}`,
    };
  }

  return null;
}

/** Formats stored seconds as the site shows them: "18h 24m", "9m 30s". */
export function formatDuration(totalSeconds: number | null | undefined): string {
  if (!totalSeconds || totalSeconds < 0) return "0m";

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.round(totalSeconds % 60);

  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds > 0 ? `${seconds}s` : ""}`.trim();
  return `${seconds}s`;
}
