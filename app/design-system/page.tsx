import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { StatusIndicator } from "@/components/ui/StatusIndicator";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
  CourseCard,
  LessonVideoCard,
  LessonCard,
  ResourceCard,
} from "@/components/ui/Card";
import { Navbar, Breadcrumbs, Pagination, Logo } from "@/components/ui/Navigation";
import {
  BellIcon,
  SearchIcon,
  PlayIcon,
  FileIcon,
  BookmarkIcon,
  BarChartIcon,
  ClockIcon,
  UserIcon,
  ChevronRightIcon,
  ExternalLinkIcon,
} from "@/components/ui/icons";
import type { ReactNode } from "react";

function Section({
  index,
  title,
  children,
}: {
  index: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-neutral-200 bg-white p-6">
      <div className="mb-5 flex items-center gap-2">
        <span className="text-small font-semibold text-primary-500">{index}</span>
        <h3 className="text-small font-semibold tracking-wide text-neutral-900">
          {title.toUpperCase()}
        </h3>
      </div>
      {children}
    </section>
  );
}

function Swatch({ name, hex, className }: { name: string; hex: string; className: string }) {
  return (
    <div className="flex flex-col gap-2">
      <div className={`h-16 w-16 rounded-md ${className}`} />
      <div className="text-small text-neutral-500">
        <div>{name}</div>
        <div>{hex}</div>
      </div>
    </div>
  );
}

const typeScale = [
  { style: "Display 1", font: "Playfair Display", size: "48 / 56", weight: "Bold", use: "Page titles", cls: "text-display-1" },
  { style: "Display 2", font: "Playfair Display", size: "36 / 44", weight: "Bold", use: "Section titles", cls: "text-display-2" },
  { style: "Heading 1", font: "Inter", size: "28 / 36", weight: "Semi Bold", use: "Card titles", cls: "text-heading-1" },
  { style: "Heading 2", font: "Inter", size: "22 / 30", weight: "Semi Bold", use: "Sub section", cls: "text-heading-2" },
  { style: "Heading 3", font: "Inter", size: "18 / 26", weight: "Medium", use: "Small titles", cls: "text-heading-3" },
  { style: "Body Large", font: "Inter", size: "16 / 24", weight: "Regular", use: "Body copy", cls: "text-body-lg" },
  { style: "Body", font: "Inter", size: "14 / 20", weight: "Regular", use: "Supporting text", cls: "text-body" },
  { style: "Small", font: "Inter", size: "12 / 16", weight: "Regular", use: "Captions, meta", cls: "text-small" },
];

const spacingScale = [
  ["4", "0.25rem"],
  ["8", "0.5rem"],
  ["12", "0.75rem"],
  ["16", "1rem"],
  ["24", "1.5rem"],
  ["32", "2rem"],
  ["40", "2.5rem"],
  ["48", "3rem"],
  ["64", "4rem"],
];

const radiusScale = [
  ["4px", "xs"],
  ["8px", "sm"],
  ["12px", "md"],
  ["16px", "lg"],
  ["24px", "xl"],
  ["Full", "circle"],
];

const shadowScale = [
  { name: "Sm", value: "0 1px 2px 0", rgba: "rgba(15, 23, 42, 0.05)" },
  { name: "Md", value: "0 4px 12px -2px", rgba: "rgba(15, 23, 42, 0.08)" },
  { name: "Lg", value: "0 12px 24px -4px", rgba: "rgba(15, 23, 42, 0.10)" },
  { name: "Xl", value: "0 20px 40px -8px", rgba: "rgba(15, 23, 42, 0.12)" },
];

const principles = [
  { icon: "clarity", title: "Clarity First", desc: "Every element should communicate clearly." },
  { icon: "consistency", title: "Consistency", desc: "Use components and patterns consistently across the platform." },
  { icon: "focus", title: "Focus & Calm", desc: "Remove noise and help learners focus on what matters." },
  { icon: "accessible", title: "Accessible", desc: "Design with accessibility and inclusivity in mind." },
];

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-6 px-6 py-10">
      {/* Header */}
      <header className="rounded-lg border border-neutral-200 bg-white p-8">
        <Logo />
        <h1 className="mt-6 text-display-1 text-neutral-900">Design System</h1>
        <p className="mt-3 max-w-md text-body-lg text-neutral-500">
          A unified design language for Vertex learning platform. Clean, modern
          and focused on clarity, consistency and intuitive learning
          experiences.
        </p>
        <p className="mt-4 text-small font-medium text-neutral-500">
          VERSION 1.0 · MAY 2025
        </p>
      </header>

      {/* 01 Colors */}
      <Section index="01" title="Colors">
        <p className="mb-3 text-small font-semibold text-neutral-500">Primary</p>
        <div className="flex flex-wrap gap-6">
          <Swatch name="Primary 500" hex="#F97316" className="bg-primary-500" />
          <Swatch name="Primary 400" hex="#FB923C" className="bg-primary-400" />
          <Swatch name="Primary 300" hex="#FDBA74" className="bg-primary-300" />
          <Swatch name="Primary 200" hex="#FED7AA" className="bg-primary-200" />
          <Swatch name="Primary 100" hex="#FFEEE5" className="bg-primary-100" />
        </div>
        <p className="mt-6 mb-3 text-small font-semibold text-neutral-500">Neutral</p>
        <div className="flex flex-wrap gap-6">
          <Swatch name="Neutral 900" hex="#0F172A" className="bg-neutral-900" />
          <Swatch name="Neutral 700" hex="#334155" className="bg-neutral-700" />
          <Swatch name="Neutral 500" hex="#64748B" className="bg-neutral-500" />
          <Swatch name="Neutral 300" hex="#CBD5E1" className="bg-neutral-300" />
          <Swatch name="Neutral 200" hex="#E2E8F0" className="bg-neutral-200" />
          <Swatch name="Neutral 100" hex="#F1F5F9" className="bg-neutral-100" />
          <Swatch name="Neutral 50" hex="#FAFAFC" className="bg-neutral-50 border border-neutral-200" />
          <Swatch name="White" hex="#FFFFFF" className="bg-white border border-neutral-200" />
        </div>
      </Section>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* 02 Typography */}
        <Section index="02" title="Typography">
          <div className="flex flex-col gap-6">
            <div>
              <p className="text-display-2 text-neutral-900">Ag</p>
              <p className="text-heading-3 text-neutral-900">Playfair Display</p>
              <p className="text-small text-neutral-500">Elegant · Readable · Timeless</p>
            </div>
            <div>
              <p className="text-4xl font-sans text-neutral-900">Ag</p>
              <p className="text-heading-3 text-neutral-900">Inter</p>
              <p className="text-small text-neutral-500">Clean · Modern · Highly legible</p>
            </div>
          </div>
        </Section>

        {/* 03 Type scale */}
        <Section index="03" title="Type Scale">
          <div className="flex flex-col divide-y divide-neutral-100">
            {typeScale.map((t) => (
              <div key={t.style} className="flex items-center justify-between gap-4 py-2">
                <span className={`${t.cls} text-neutral-900`}>{t.style}</span>
                <span className="text-small text-neutral-500">{t.use}</span>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* 04 Spacing */}
        <Section index="04" title="Spacing System">
          <p className="mb-4 text-small text-neutral-500">Base unit: 4px</p>
          <div className="flex flex-wrap items-end gap-4">
            {spacingScale.map(([px]) => (
              <div key={px} className="flex flex-col items-center gap-2">
                <div
                  className="rounded-xs bg-primary-200"
                  style={{ width: `${px}px`, height: `${px}px` }}
                />
                <span className="text-small text-neutral-500">{px}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* 05 Radius & shadows */}
        <Section index="05" title="Radius & Shadows">
          <p className="mb-3 text-small font-semibold text-neutral-500">Radius</p>
          <div className="mb-6 flex flex-wrap gap-4">
            {radiusScale.map(([px, label]) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <div
                  className={`h-10 w-10 border border-neutral-200 bg-neutral-50 ${
                    label === "circle" ? "rounded-full" : ""
                  }`}
                  style={label === "circle" ? {} : { borderRadius: px }}
                />
                <span className="text-small text-neutral-500">{px}</span>
              </div>
            ))}
          </div>
          <p className="mb-3 text-small font-semibold text-neutral-500">Shadows</p>
          <div className="grid grid-cols-2 gap-3">
            {shadowScale.map((s) => (
              <div
                key={s.name}
                className="rounded-md border border-neutral-200 bg-white p-3"
                style={{ boxShadow: `${s.value} ${s.rgba}` }}
              >
                <p className="text-sm font-medium text-neutral-900">{s.name}</p>
                <p className="text-small text-neutral-500">
                  {s.value} {s.rgba}
                </p>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* 06 Icons */}
        <Section index="06" title="Icons">
          <p className="mb-2 text-small font-semibold text-neutral-500">Outline Style</p>
          <div className="mb-5 flex flex-wrap gap-3 text-neutral-700">
            <BellIcon /> <SearchIcon /> <PlayIcon /> <FileIcon /> <BookmarkIcon />
            <BarChartIcon /> <ClockIcon /> <UserIcon /> <ChevronRightIcon />
          </div>
          <p className="mb-2 text-small font-semibold text-neutral-500">Filled Style</p>
          <div className="flex flex-wrap gap-3 text-neutral-900">
            <BellIcon filled /> <SearchIcon filled /> <PlayIcon filled /> <FileIcon filled />
            <BookmarkIcon filled /> <BarChartIcon filled /> <ClockIcon filled /> <UserIcon filled />
            <ChevronRightIcon />
          </div>
        </Section>

        {/* 07 Buttons */}
        <Section index="07" title="Buttons">
          <div className="flex flex-col gap-3">
            <Button variant="primary">Get Started</Button>
            <Button variant="secondary">Explore Courses</Button>
            <Button variant="tertiary" icon={<ExternalLinkIcon width={16} height={16} />}>
              View Lesson
            </Button>
            <Button variant="text" icon={<PlayIcon filled width={14} height={14} />}>
              Watch Video
            </Button>
            <Button variant="primary" disabled>
              Get Started
            </Button>
          </div>
        </Section>

        {/* 08 Inputs */}
        <Section index="08" title="Inputs">
          <div className="flex flex-col gap-4">
            <div>
              <p className="mb-2 text-small font-semibold text-neutral-500">
                Search / Text Input
              </p>
              <SearchInput placeholder="Search anything..." shortcut="⌘ K" />
            </div>
            <div>
              <p className="mb-2 text-small font-semibold text-neutral-500">Select</p>
              <Select defaultValue="Most Relevant">
                <option>Most Relevant</option>
                <option>Newest</option>
                <option>Popular</option>
              </Select>
            </div>
          </div>
        </Section>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* 09 Badges */}
        <Section index="09" title="Badges / Tags">
          <div className="flex flex-wrap items-center gap-4">
            <Badge variant="video">Video</Badge>
            <Badge variant="lesson">Lesson</Badge>
            <Badge variant="popular">Popular</Badge>
          </div>
        </Section>

        {/* 10 Status */}
        <Section index="10" title="Status / Indicators">
          <div className="flex flex-wrap items-center gap-4">
            <StatusIndicator status="in-progress" />
            <StatusIndicator status="completed" />
            <StatusIndicator status="now-playing" />
            <StatusIndicator status="locked" />
          </div>
        </Section>

        {/* 11 Progress */}
        <Section index="11" title="Progress Bar">
          <ProgressBar value={35} />
        </Section>
      </div>

      {/* 12 Cards */}
      <Section index="12" title="Cards">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <CourseCard
            layout="row"
            title="Next.js for Production"
            description="Build scalable, high-performance web applications with Next.js."
            level="Intermediate"
            duration="18h 24m"
            modules="12 modules"
          />
          <LessonVideoCard
            title="Data Fetching in Server Components"
            description="Learn how to fetch data on the server using async/await and Next.js best practices."
            meta="Lesson 5.1 · 12:45"
            cta="Watch from 12:45"
          />
          <LessonCard
            title="Data Fetching & Caching"
            description="Explore different data fetching methods in Next.js and how to cache and revalidate data for optimal performance."
            meta="Module 5"
            cta="View lesson"
          />
          <ResourceCard
            title="Caching and Revalidation Guide"
            description="Deep dive into Next.js caching strategies."
            meta="PDF · 1.2 MB"
          />
        </div>
      </Section>

      {/* 13 Navigation */}
      <Section index="13" title="Navigation">
        <div className="flex flex-col gap-4">
          <div className="overflow-hidden rounded-md border border-neutral-200">
            <Navbar links={["Courses", "My Learning"]} />
          </div>
          <div>
            <p className="mb-2 text-small font-semibold text-neutral-500">Breadcrumbs</p>
            <Breadcrumbs items={["All Courses", "Next.js for Production", "Data Fetching & Caching"]} />
          </div>
          <div>
            <p className="mb-2 text-small font-semibold text-neutral-500">Pagination</p>
            <Pagination page={1} total={8} />
          </div>
        </div>
      </Section>

      {/* 14 Principles */}
      <Section index="14" title="Principles">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-4">
          {principles.map((p) => (
            <div key={p.title} className="flex flex-col gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-neutral-100 text-neutral-700">
                {p.icon === "clarity" && <SearchIcon width={18} height={18} />}
                {p.icon === "consistency" && <BarChartIcon width={18} height={18} />}
                {p.icon === "focus" && <ClockIcon width={18} height={18} />}
                {p.icon === "accessible" && <UserIcon width={18} height={18} />}
              </div>
              <p className="text-sm font-semibold text-neutral-900">{p.title}</p>
              <p className="text-small text-neutral-500">{p.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <footer className="flex items-center justify-between py-4 text-small text-neutral-500">
        <span className="flex items-center gap-2">
          <BellIcon width={16} height={16} /> Vertex Design System
        </span>
        <span>V1.0 · May 2025</span>
      </footer>
    </div>
  );
}
