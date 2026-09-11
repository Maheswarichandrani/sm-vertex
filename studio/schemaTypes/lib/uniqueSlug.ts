import type {CustomValidator, SlugValue} from 'sanity'

/**
 * Rejects a slug already used by another document of the same type.
 *
 * Slugs are route segments, so a duplicate makes a page ambiguous. The draft
 * prefix is stripped before comparing, otherwise a document always collides
 * with its own published version.
 */
export function uniqueSlug(documentType: string): CustomValidator<SlugValue | undefined> {
  return async (slug, context) => {
    if (!slug?.current) return true

    if (!/^[a-z0-9-]+$/.test(slug.current)) {
      return 'Use lowercase letters, numbers and hyphens only'
    }

    const client = context.getClient({apiVersion: '2026-09-11'})
    const id = context.document?._id?.replace(/^drafts\./, '')

    const taken = await client.fetch<number>(
      `count(*[_type == $documentType && slug.current == $slug && !(_id in [$id, "drafts." + $id])])`,
      {documentType, slug: slug.current, id},
    )

    return taken === 0 || `Another ${documentType} already uses this slug`
  }
}
