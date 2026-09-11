/**
 * Placeholder for the user photo in the reference — the real one arrives with
 * Clerk. Sized to the measured 50px circle.
 */
export function Avatar({ initials, name }: { initials: string; name: string }) {
  return (
    <span
      role="img"
      aria-label={name}
      className="flex h-[50px] w-[50px] items-center justify-center rounded-full bg-primary-200 text-sm font-semibold text-primary-500 ring-1 ring-canvas-line"
    >
      {initials}
    </span>
  );
}
