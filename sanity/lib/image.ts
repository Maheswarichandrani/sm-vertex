import {
  createImageUrlBuilder,
  type SanityImageSource,
} from "@sanity/image-url";

import { dataset, projectId } from "../env";

const builder = createImageUrlBuilder({ projectId, dataset });

/**
 * Builds a CDN URL for a Sanity image asset.
 *
 * No `server-only` guard here on purpose: this takes no token and asset URLs
 * are public, so client components may use it.
 */
export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}
