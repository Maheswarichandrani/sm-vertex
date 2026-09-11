import type { ReactNode } from "react";
import { Badge } from "./Badge";
import {
  BarChartIcon,
  BookmarkIcon,
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

export function CourseCard({
  title,
  description,
  level,
  duration,
  modules,
}: {
  title: string;
  description: string;
  level: string;
  duration: string;
  modules: string;
}) {
  return (
    <CardShell>
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-neutral-900 font-display text-white">
          {title.charAt(0)}
        </div>
        <div>
          <h4 className="text-heading-3 text-neutral-900">{title}</h4>
          <p className="text-body text-neutral-500">{description}</p>
        </div>
      </div>
      <div className="flex items-center gap-4 text-small text-neutral-500">
        <span className="flex items-center gap-1">
          <BarChartIcon width={14} height={14} />
          {level}
        </span>
        <span className="flex items-center gap-1">
          <ClockIcon width={14} height={14} />
          {duration}
        </span>
        <span className="flex items-center gap-1">
          <BookmarkIcon width={14} height={14} />
          {modules}
        </span>
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
