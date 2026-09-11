/**
 * Studio configuration read from the environment.
 *
 * The Studio's Vite build only exposes vars prefixed `SANITY_STUDIO_`, which
 * is why these are named differently from the app's `NEXT_PUBLIC_SANITY_*`.
 * Neither value is a secret — a project id is not a credential.
 */
export const projectId = assertValue(
  process.env.SANITY_STUDIO_PROJECT_ID,
  'Missing environment variable: SANITY_STUDIO_PROJECT_ID',
)

export const dataset = assertValue(
  process.env.SANITY_STUDIO_DATASET,
  'Missing environment variable: SANITY_STUDIO_DATASET',
)

function assertValue<T>(value: T | undefined, errorMessage: string): T {
  if (value === undefined) {
    throw new Error(errorMessage)
  }

  return value
}
