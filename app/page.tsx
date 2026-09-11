import Link from "next/link";
import { SearchInput } from "@/components/ui/Input";
import { CourseCard } from "@/components/ui/Card";
import { PageFrame } from "@/components/ui/PageFrame";
import { SiteHeader } from "@/components/ui/SiteHeader";
import { BarDecoration } from "@/components/home/BarDecoration";
import { ArrowRightIcon, StarIcon } from "@/components/ui/icons";
import {
  DockerMark,
  NextjsMark,
  TypeScriptMark,
} from "@/components/ui/CourseLogos";

const courses = [
  {
    title: "Next.js for Production",
    description: "Build scalable, high-performance web applications with Next.js.",
    level: "Intermediate",
    duration: "18h 24m",
    modules: "12 modules",
    icon: <NextjsMark />,
  },
  {
    title: "Docker Essentials",
    description: "Containerize applications and streamline your development workflow.",
    level: "Beginner",
    duration: "10h 12m",
    modules: "8 modules",
    icon: <DockerMark />,
  },
  {
    title: "TypeScript Deep Dive",
    description: "Go beyond the basics and write safer, more expressive code.",
    level: "Intermediate",
    duration: "14h 36m",
    modules: "10 modules",
    icon: <TypeScriptMark />,
  },
];

export default function Home() {
  return (
    <PageFrame>
      <SiteHeader activeHref="/courses" />

      <main>
        <section className="flex flex-col items-center px-6 pt-[68px] pb-[53px] text-center">
          <p className="rounded-[10px] border border-canvas-line bg-primary-100/60 px-6 py-[11px] text-[13px] font-semibold tracking-[0.12em] text-primary-500 uppercase">
            Intelligent Learning
          </p>

          <h1 className="mt-[38px] font-display text-[44px] leading-[52px] font-bold text-balance text-neutral-900 sm:text-[68px] sm:leading-[74px]">
            Search your learning
            <br className="hidden sm:inline" /> in plain English.
          </h1>

          <p className="mt-[30px] max-w-[440px] text-lg leading-[33px] text-neutral-500 sm:text-xl xl:max-w-[656px]">
            Vertex understands what you want to learn and finds the exact lessons
            across all your courses.
          </p>

          <Link
            href="/courses"
            className="mt-[39px] inline-flex h-[65px] items-center gap-6 rounded-md bg-primary-500 px-7 text-lg font-medium text-white shadow-md transition-colors hover:bg-primary-400 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-500"
          >
            Explore Courses
            <ArrowRightIcon width={20} height={20} />
          </Link>

          <SearchInput
            inputSize="lg"
            shortcut="⌘ K"
            aria-label="Search your learning"
            placeholder="Ask anything about your learning..."
            className="mt-[38px] w-full max-w-[748px] xl:max-w-[1115px]"
          />
        </section>

        <section className="border-t border-canvas-line px-6 pt-[52px] sm:px-[52px] xl:px-[78px]">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="font-display text-[28px] font-bold text-neutral-900">
              All Courses
            </h2>
            <Link
              href="/courses"
              className="inline-flex items-center gap-3 rounded-sm text-[17px] text-primary-500 transition-colors hover:text-primary-400 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-500"
            >
              View all courses
              <ArrowRightIcon width={16} height={16} />
            </Link>
          </div>

          <div className="mt-[33px] grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course.title} layout="stacked" {...course} />
            ))}
          </div>

          <div className="mt-[74px] flex items-center">
            <span className="h-px flex-1 bg-canvas-line" />
            <StarIcon width={20} height={20} className="mr-6 ml-8 shrink-0 text-primary-400" />
            <span className="text-[17px] text-neutral-500">
              New courses and lessons added every week.
            </span>
            <span className="ml-8 h-px flex-1 bg-canvas-line" />
          </div>

          <BarDecoration />
        </section>
      </main>
    </PageFrame>
  );
}
