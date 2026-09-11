import "server-only";

import { createClient } from "next-sanity";

import { apiVersion, dataset, projectId } from "../env";
import { token } from "./token";

/**
 * Read-only Sanity client.
 *
 * `server-only` is load-bearing: the dataset is private, so this module holds
 * a read token. Importing it from a client component is a build error rather
 * than a leaked credential.
 */
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: "published",
  token,
});
