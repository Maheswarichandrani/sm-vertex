import {
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";
import { BellIcon } from "./icons";

const links = [
  { label: "Courses", href: "/courses" },
  { label: "My Learning", href: "/my-learning" },
];

export function SiteHeader({ activeHref }: { activeHref?: string }) {
  return (
    <header className="flex h-24 items-center border-b border-canvas-line px-6 sm:px-[42px] xl:px-[63px]">
      <Link
        href="/"
        className="flex items-center gap-2 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-500"
      >
        <svg width={32} height={32} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M2 3h6.5L12 15l3.5-12H22L14 21h-4L2 3Z" fill="var(--color-primary-500)" />
        </svg>
        <span className="font-display text-[22px] font-bold text-neutral-900">Vertex</span>
      </Link>

      <nav className="ml-8 flex items-center gap-8 sm:ml-[63px] sm:gap-[45px]">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            aria-current={activeHref === link.href ? "page" : undefined}
            className={`rounded-sm text-base font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-500 ${
              activeHref === link.href
                ? "text-neutral-900"
                : "text-neutral-700 hover:text-neutral-900"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-[21px]">
        <button
          type="button"
          aria-label="Notifications"
          className="rounded-sm text-neutral-900 hover:text-primary-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-500"
        >
          <BellIcon width={24} height={24} />
        </button>
        <Show when="signed-out">
          <SignInButton mode="modal">
            <button
              type="button"
              className="rounded-sm text-base font-medium text-neutral-700 hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-500"
            >
              Sign in
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button
              type="button"
              className="inline-flex h-11 items-center justify-center rounded-md bg-primary-500 px-4 text-[15px] font-medium text-white transition-colors hover:bg-primary-400 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-500"
            >
              Sign up
            </button>
          </SignUpButton>
        </Show>
        <Show when="signed-in">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "h-[50px] w-[50px] ring-1 ring-canvas-line",
              },
            }}
          />
        </Show>
      </div>
    </header>
  );
}
