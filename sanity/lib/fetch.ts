import "server-only";

import type { QueryParams } from "next-sanity";

import { client } from "./client";

/**
 * The single read path for Sanity content.
 *
 * Pages call this instead of `client.fetch` directly so caching stays in one
 * place. Pass `tags` for content that should invalidate on a webhook, or
 * `revalidate` for content that can go stale on a timer. Tags win when both
 * are given — a tagged fetch is cached until something revalidates the tag.
 */
export async function sanityFetch<const QueryString extends string>({
  query,
  params = {},
  revalidate = 60,
  tags = [],
}: {
  query: QueryString;
  params?: QueryParams;
  revalidate?: number | false;
  tags?: string[];
}) {
  return client.fetch(query, params, {
    next: {
      revalidate: tags.length ? false : revalidate,
      tags,
    },
  });
}
