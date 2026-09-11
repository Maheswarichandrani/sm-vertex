import { defineQuery } from "next-sanity";

/**
 * Every GROQ query the app runs lives here.
 *
 * TypeGen scans for `defineQuery` calls and writes a result type per query
 * into `sanity.types.ts`, so a query built inline at a call site gets no
 * types. Fetch functions in `content.ts` pair each query with a cache tag.
 *
 * Two rules shape what follows. Filters never dereference (`->`) — that
 * resolves a reference for every candidate document — so they stick to
 * `slug.current` and `references()`, both of which use an index. And a
 * course stores neither its duration nor its lesson count; both are summed
 * from the lessons its modules point at, so they cannot drift.
 */

const imageFragment = /* groq */ `
  asset->{_id, url, metadata{lqip, dimensions}},
  alt,
  hotspot,
  crop
`;

/** What a course looks like on a card: catalog, home, instructor page. */
const courseCardFragment = /* groq */ `
  _id,
  title,
  "slug": slug.current,
  summary,
  level,
  price,
  popular,
  studentCount,
  coverImage{${imageFragment}},
  instructor->{_id, name, "slug": slug.current},
  category->{_id, title, "slug": slug.current},
  "moduleCount": count(modules),
  "lessonCount": count(modules[].lessons[]),
  "durationSeconds": math::sum(modules[].lessons[]->durationSeconds)
`;

export const COURSES_QUERY = defineQuery(/* groq */ `
  *[_type == "course" && defined(slug.current)]
    | order(popular desc, title asc){
      ${courseCardFragment}
    }
`);

export const COURSE_BY_SLUG_QUERY = defineQuery(/* groq */ `
  *[_type == "course" && slug.current == $slug][0]{
    ${courseCardFragment},
    learningOutcomes[]{_key, icon, title, description},
    instructor->{
      _id,
      name,
      "slug": slug.current,
      expertise,
      bio,
      photo{${imageFragment}}
    },
    modules[]{
      _key,
      title,
      summary,
      "durationSeconds": math::sum(lessons[]->durationSeconds),
      lessons[]->{
        _id,
        title,
        "slug": slug.current,
        durationSeconds,
        freePreview,
        poster{${imageFragment}}
      }
    }
  }
`);

export const COURSE_SLUGS_QUERY = defineQuery(/* groq */ `
  *[_type == "course" && defined(slug.current)].slug.current
`);

/**
 * A lesson does not store its parent course (AGENTS.md §8), so the course is
 * derived with a reverse reference. `modules` comes back whole because the
 * lesson's position inside it is what produces "Lesson 5.1", and GROQ has no
 * array-index variable — `content.ts` counts the positions.
 */
export const LESSON_BY_SLUG_QUERY = defineQuery(/* groq */ `
  *[_type == "lesson" && slug.current == $slug][0]{
    _id,
    title,
    "slug": slug.current,
    videoUrl,
    durationSeconds,
    freePreview,
    studentCount,
    notes,
    proTip,
    poster{${imageFragment}},
    keyPoints[]{_key, text},
    resources[]{_key, type, title, description, url},
    "course": *[_type == "course" && references(^._id)][0]{
      _id,
      title,
      "slug": slug.current,
      coverImage{${imageFragment}},
      instructor->{_id, name, "slug": slug.current},
      modules[]{
        _key,
        title,
        "lessonIds": lessons[]._ref
      }
    }
  }
`);

export const LESSON_SLUGS_QUERY = defineQuery(/* groq */ `
  *[_type == "lesson" && defined(slug.current)].slug.current
`);

export const INSTRUCTORS_QUERY = defineQuery(/* groq */ `
  *[_type == "instructor" && defined(slug.current)] | order(name asc){
    _id,
    name,
    "slug": slug.current,
    expertise,
    bio,
    photo{${imageFragment}},
    "courseCount": count(*[_type == "course" && references(^._id)])
  }
`);

export const INSTRUCTOR_BY_SLUG_QUERY = defineQuery(/* groq */ `
  *[_type == "instructor" && slug.current == $slug][0]{
    _id,
    name,
    "slug": slug.current,
    expertise,
    bio,
    photo{${imageFragment}},
    "courses": *[_type == "course" && references(^._id)] | order(popular desc, title asc){
      ${courseCardFragment}
    }
  }
`);

export const INSTRUCTOR_SLUGS_QUERY = defineQuery(/* groq */ `
  *[_type == "instructor" && defined(slug.current)].slug.current
`);

export const CATEGORIES_QUERY = defineQuery(/* groq */ `
  *[_type == "category" && defined(slug.current)] | order(title asc){
    _id,
    title,
    "slug": slug.current,
    description,
    "courseCount": count(*[_type == "course" && references(^._id)])
  }
`);
