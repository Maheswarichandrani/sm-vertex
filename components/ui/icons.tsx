import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { filled?: boolean };

/**
 * Icon spec: 24x24 grid, 2px stroke (outline) / filled variant, rounded line
 * caps, consistent optical balance.
 */
function base(props: IconProps) {
  const { filled, ...rest } = props;
  return {
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: filled ? "currentColor" : "none",
    stroke: filled ? "none" : "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    ...rest,
  };
}

export function BellIcon(props: IconProps) {
  return props.filled ? (
    <svg {...base(props)}>
      <path d="M12 2a6 6 0 0 0-6 6v3.2c0 .5-.2 1-.5 1.4L4 15h16l-1.5-2.4a2.2 2.2 0 0 1-.5-1.4V8a6 6 0 0 0-6-6Z" />
      <path d="M9.5 19a2.5 2.5 0 0 0 5 0" stroke="currentColor" strokeWidth={2} strokeLinecap="round" fill="none" />
    </svg>
  ) : (
    <svg {...base(props)}>
      <path d="M12 3a5 5 0 0 0-5 5v3.4c0 .4-.1.8-.4 1.1L5 15h14l-1.6-2.5a1.8 1.8 0 0 1-.4-1.1V8a5 5 0 0 0-5-5Z" />
      <path d="M9.5 19a2.5 2.5 0 0 0 5 0" />
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return props.filled ? (
    <svg {...base(props)}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-3.5-3.5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" fill="none" />
    </svg>
  ) : (
    <svg {...base(props)}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  );
}

export function PlayIcon(props: IconProps) {
  return props.filled ? (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="10" fill="currentColor" />
      <path d="M10 8.5l6 3.5-6 3.5v-7Z" fill="var(--color-background, #fff)" />
    </svg>
  ) : (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M10.5 9l4.5 3-4.5 3V9Z" />
    </svg>
  );
}

export function FileIcon(props: IconProps) {
  return props.filled ? (
    <svg {...base(props)}>
      <path d="M6 2h8l4 4v16H6V2Z" />
      <path d="M14 2v4h4" stroke="var(--color-background,#fff)" strokeWidth={1.5} fill="none" />
    </svg>
  ) : (
    <svg {...base(props)}>
      <path d="M6 2h8l4 4v16H6V2Z" />
      <path d="M14 2v4h4" />
    </svg>
  );
}

export function BookmarkIcon(props: IconProps) {
  return props.filled ? (
    <svg {...base(props)}>
      <path d="M6 3h12v18l-6-4-6 4V3Z" />
    </svg>
  ) : (
    <svg {...base(props)}>
      <path d="M6 3h12v18l-6-4-6 4V3Z" />
    </svg>
  );
}

export function BarChartIcon(props: IconProps) {
  return props.filled ? (
    <svg {...base(props)}>
      <rect x="4" y="12" width="4" height="8" rx="1" />
      <rect x="10" y="7" width="4" height="13" rx="1" />
      <rect x="16" y="3" width="4" height="17" rx="1" />
    </svg>
  ) : (
    <svg {...base(props)}>
      <rect x="4" y="12" width="4" height="8" rx="1" />
      <rect x="10" y="7" width="4" height="13" rx="1" />
      <rect x="16" y="3" width="4" height="17" rx="1" />
    </svg>
  );
}

export function ClockIcon(props: IconProps) {
  return props.filled ? (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 7v5l3.5 2" stroke="var(--color-background,#fff)" strokeWidth={2} strokeLinecap="round" fill="none" />
    </svg>
  ) : (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v5l3.2 1.8" />
    </svg>
  );
}

export function UserIcon(props: IconProps) {
  return props.filled ? (
    <svg {...base(props)}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
    </svg>
  ) : (
    <svg {...base(props)}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 21c0-4.1 3.4-7.5 7.5-7.5s7.5 3.4 7.5 7.5" />
    </svg>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <svg {...base(props)} fill="none" stroke="currentColor">
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg {...base(props)} fill="none" stroke="currentColor">
      <path d="M5 12.5l4.5 4.5L19 7" />
    </svg>
  );
}

export function LockIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="5" y="10.5" width="14" height="10" rx="2" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </svg>
  );
}

export function ExternalLinkIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M14 4h6v6" />
      <path d="M20 4L10 14" />
      <path d="M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6" />
    </svg>
  );
}

export function DownloadIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3v12" />
      <path d="M7 10l5 5 5-5" />
      <path d="M4 21h16" />
    </svg>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <svg {...base(props)} fill="none" stroke="currentColor">
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}

export function StarIcon(props: IconProps) {
  return props.filled ? (
    <svg {...base(props)}>
      <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8L12 2.5Z" />
    </svg>
  ) : (
    <svg {...base(props)}>
      <path d="M12 3l2.6 5.4 5.9.7-4.3 4.1 1.1 5.9L12 16.2l-5.3 2.9 1.1-5.9-4.3-4.1 5.9-.7L12 3Z" />
    </svg>
  );
}
