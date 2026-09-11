import "server-only";

/**
 * The Sanity read token.
 *
 * The dataset is private, so every read needs this. `server-only` is
 * load-bearing: importing this module from a client component is a build
 * error rather than a leaked credential. It is the one place the token is
 * read, so the assertion lives here instead of at each call site.
 */
export const token = assertValue(
  process.env.SANITY_API_READ_TOKEN,
  "Missing environment variable: SANITY_API_READ_TOKEN",
);

function assertValue<T>(value: T | undefined, errorMessage: string): T {
  if (value === undefined) {
    throw new Error(errorMessage);
  }

  return value;
}
