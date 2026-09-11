import { CheckIcon, LockIcon, PlayIcon } from "./icons";

type Status = "in-progress" | "completed" | "now-playing" | "locked";

const labels: Record<Status, string> = {
  "in-progress": "In Progress",
  completed: "Completed",
  "now-playing": "Now Playing",
  locked: "Locked",
};

export function StatusIndicator({ status }: { status: Status }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-neutral-700">
      <StatusIcon status={status} />
      {labels[status]}
    </span>
  );
}

function StatusIcon({ status }: { status: Status }) {
  switch (status) {
    case "in-progress":
      return (
        <svg width={16} height={16} viewBox="0 0 16 16" className="text-primary-500">
          <circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeOpacity={0.25} strokeWidth={2} />
          <path d="M8 1.5a6.5 6.5 0 0 1 6.5 6.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
        </svg>
      );
    case "completed":
      return (
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-success text-white">
          <CheckIcon width={11} height={11} strokeWidth={3} />
        </span>
      );
    case "now-playing":
      return (
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary-100 text-primary-500">
          <PlayIcon filled width={10} height={10} />
        </span>
      );
    case "locked":
      return <LockIcon width={15} height={15} className="text-neutral-500" />;
  }
}
