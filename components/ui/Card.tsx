import type { ReactNode } from "react";
import { Badge } from "./Badge";
import {
  BarChartIcon,
  ClockIcon,
  DownloadIcon,
  ExternalLinkIcon,
  FileIcon,
  PlayIcon,
} from "./icons";

function CardShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-5 shadow-sm">
      {children}
    </div>
  );
}

interface CourseCardProps {
  title: string;
  description: string;
  level: string;
  duration: string;
  modules: string;
  icon?: ReactNode;
  /** "row" is the design-system sheet's card; "stacked" is the home page's. */
  layout?: "row" | "stacked";
}

function CourseMeta({
  level,
  duration,
  modules,
  size,
}: {
  level: string;
  duration: string;
  modules: string;
  size: number;
}) {
  return (
    <>
      <span className="flex items-center gap-1.5">
        <BarChartIcon width={size} height={size} />
        {level}
      </span>
      <span className="flex items-center gap-1.5">
        <ClockIcon width={size} height={size} />
        {duration}
      </span>
      <span className="flex items-center gap-1.5">
        <FileIcon width={size} height={size} />
        {modules}
      </span>
    </>
  );
}

export function CourseCard({
  title,
  description,
  level,
  duration,
  modules,
  icon,
  layout = "row",
}: CourseCardProps) {
  if (layout === "stacked") {
    return (
      <article className="flex min-h-[374px] flex-col rounded-lg border border-canvas-line bg-canvas-card px-7 pt-8 pb-[33px] shadow-sm">
        {icon ?? (
          <span className="flex h-[72px] w-[72px] items-center justify-center rounded-lg bg-neutral-900 font-display text-[30px] text-white">
            {title.charAt(0)}
          </span>
        )}
        <h3 className="mt-[27px] font-display text-2xl font-bold text-neutral-900">
          {title}
        </h3>
        <p className="mt-[26px] text-[15px] leading-[25px] text-neutral-500">
          {description}
        </p>
        {/* The reference insets the divider and meta row 18px, 10px wider than the body padding. */}
        <div className="mt-auto -mx-2.5 border-t border-canvas-line pt-[22px]">
          <div className="flex items-center gap-[18px] text-small text-neutral-500">
            <CourseMeta level={level} duration={duration} modules={modules} size={16} />
          </div>
        </div>
      </article>
    );
  }

  return (
    <CardShell>
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-neutral-900 font-display text-white">
          {icon ?? title.charAt(0)}
        </div>
        <div>
          <h4 className="text-heading-3 text-neutral-900">{title}</h4>
          <p className="text-body text-neutral-500">{description}</p>
        </div>
      </div>
      <div className="flex items-center gap-4 text-small text-neutral-500">
        <CourseMeta level={level} duration={duration} modules={modules} size={14} />
      </div>
    </CardShell>
  );
}

export function LessonVideoCard({
  title,
  description,
  meta,
  cta,
}: {
  title: string;
  description: string;
  meta: string;
  cta: string;
}) {
  return (
    <CardShell>
      <Badge variant="video">Video</Badge>
      <div>
        <h4 className="text-heading-3 text-neutral-900">{title}</h4>
        <p className="text-body text-neutral-500">{description}</p>
      </div>
      <div className="flex items-center justify-between pt-1">
        <span className="text-small text-neutral-500">{meta}</span>
        <button className="inline-flex items-center gap-1 text-sm font-medium text-primary-500 hover:text-primary-400">
          {cta}
          <PlayIcon filled width={14} height={14} />
        </button>
      </div>
    </CardShell>
  );
}

export function LessonCard({
  title,
  description,
  meta,
  cta,
}: {
  title: string;
  description: string;
  meta: string;
  cta: string;
}) {
  return (
    <CardShell>
      <Badge variant="lesson">Lesson</Badge>
      <div>
        <h4 className="text-heading-3 text-neutral-900">{title}</h4>
        <p className="text-body text-neutral-500">{description}</p>
      </div>
      <div className="flex items-center justify-between pt-1">
        <span className="text-small text-neutral-500">{meta}</span>
        <button className="inline-flex items-center gap-1 text-sm font-medium text-primary-500 hover:text-primary-400">
          {cta}
          <ExternalLinkIcon width={14} height={14} />
        </button>
      </div>
    </CardShell>
  );
}

export function ResourceCard({
  title,
  description,
  meta,
}: {
  title: string;
  description: string;
  meta: string;
}) {
  return (
    <CardShell>
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-neutral-100 text-neutral-700">
          <FileIcon width={18} height={18} />
        </div>
        <div>
          <h4 className="text-heading-3 text-neutral-900">{title}</h4>
          <p className="text-body text-neutral-500">{description}</p>
        </div>
      </div>
      <div className="flex items-center justify-between pt-1">
        <span className="text-small text-neutral-500">{meta}</span>
        <DownloadIcon width={16} height={16} className="text-neutral-500" />
      </div>
    </CardShell>
  );
}
