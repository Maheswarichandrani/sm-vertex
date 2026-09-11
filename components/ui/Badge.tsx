import type { ReactNode } from "react";

type BadgeVariant = "video" | "lesson" | "popular";

const variantClasses: Record<BadgeVariant, string> = {
  video: "bg-neutral-900 text-white",
  lesson: "bg-neutral-200 text-neutral-700",
  popular: "bg-primary-100 text-primary-500",
};

export function Badge({
  variant,
  children,
}: {
  variant: BadgeVariant;
  children: ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-xs px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase ${variantClasses[variant]}`}
    >
      {children}
    </span>
  );
}
