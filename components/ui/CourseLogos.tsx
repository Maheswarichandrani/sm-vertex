export function NextjsMark() {
  return (
    <span className="flex h-[72px] w-[72px] items-center justify-center rounded-lg bg-neutral-900 text-[30px] font-bold text-white">
      N
    </span>
  );
}

export function TypeScriptMark() {
  return (
    <span className="flex h-[72px] w-[72px] items-center justify-center rounded-lg bg-[#3178C6] text-2xl font-bold text-white">
      TS
    </span>
  );
}

/** The reference draws Docker as a bare illustration — no tile behind it. */
export function DockerMark() {
  return (
    <span className="flex h-[72px] w-[72px] items-center justify-center">
      <svg width={72} height={56} viewBox="0 0 72 56" fill="none" aria-hidden>
        <g stroke="#0B1B2B" strokeWidth={1.6} strokeLinejoin="round">
          <rect x="16" y="30" width="9" height="8" fill="#2AA3E0" />
          <rect x="26" y="30" width="9" height="8" fill="#2AA3E0" />
          <rect x="36" y="30" width="9" height="8" fill="#2AA3E0" />
          <rect x="26" y="21" width="9" height="8" fill="#2AA3E0" />
          <rect x="36" y="21" width="9" height="8" fill="#2AA3E0" />
          <rect x="36" y="12" width="9" height="8" fill="#2AA3E0" />
        </g>
        <path
          d="M10 39h53c0 0-1 5-5 8-4 3-10 4-17 4-9 0-16-2-21-6-5-4-8-6-10-6Z"
          fill="#2496ED"
          stroke="#0B1B2B"
          strokeWidth={1.6}
          strokeLinejoin="round"
        />
        <path
          d="M59 32c2-2 5-2 7 0 1-3 4-4 6-3-1 4-4 6-7 6-2 0-4-1-6-3Z"
          fill="#2496ED"
          stroke="#0B1B2B"
          strokeWidth={1.6}
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
