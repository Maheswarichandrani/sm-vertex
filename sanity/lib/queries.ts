import { defineQuery } from "next-sanity";

/**
 * Every GROQ query the app runs lives here.
 *
 * Keeping them in one file is what TypeGen needs: `sanity typegen generate`
 * scans for `defineQuery` calls and writes a result type per query into
 * `sanity.types.ts`. A query built inline at a call site gets no types.
 *
 * Empty for now — the content schema does not exist yet.
 */
export const placeholderQuery = defineQuery(`*[false][0]`);
