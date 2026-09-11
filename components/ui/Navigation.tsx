import { ChevronRightIcon } from "./icons";

export function Logo({ withWordmark = true }: { withWordmark?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <path d="M2 3h6.5L12 15l3.5-12H22L14 21h-4L2 3Z" fill="var(--color-primary-500)" />
      </svg>
      {withWordmark && (
        <span className="font-display text-lg font-semibold text-neutral-900">
          Vertex
        </span>
      )}
    </div>
  );
}

export function Navbar({ links }: { links: string[] }) {
  return (
    <nav className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-4">
      <Logo />
      <div className="flex items-center gap-6">
        {links.map((link, i) => (
          <a
            key={link}
            href="#"
            className={`text-sm font-medium ${
              i === 0 ? "text-neutral-900" : "text-neutral-500 hover:text-neutral-900"
            }`}
          >
            {link}
          </a>
        ))}
      </div>
    </nav>
  );
}

export function Breadcrumbs({ items }: { items: string[] }) {
  return (
    <nav className="flex items-center gap-2 text-sm text-neutral-500">
      {items.map((item, i) => (
        <span key={item} className="flex items-center gap-2">
          <a
            href="#"
            className={
              i === items.length - 1
                ? "text-neutral-900"
                : "hover:text-neutral-900"
            }
          >
            {item}
          </a>
          {i < items.length - 1 && (
            <ChevronRightIcon width={14} height={14} />
          )}
        </span>
      ))}
    </nav>
  );
}

export function Pagination({
  page,
  total,
}: {
  page: number;
  total: number;
}) {
  const pages: (number | "ellipsis")[] = [1];
  if (page > 3) pages.push("ellipsis");
  for (let p = Math.max(2, page - 1); p <= Math.min(total - 1, page + 1); p++) {
    pages.push(p);
  }
  if (page < total - 2) pages.push("ellipsis");
  if (total > 1) pages.push(total);

  return (
    <nav className="flex items-center gap-1">
      <button
        disabled={page === 1}
        className="flex h-8 w-8 items-center justify-center rounded-sm text-neutral-500 hover:bg-neutral-100 disabled:opacity-40"
        aria-label="Previous page"
      >
        <ChevronRightIcon width={16} height={16} className="rotate-180" />
      </button>
      {pages.map((p, i) =>
        p === "ellipsis" ? (
          <span key={`e-${i}`} className="px-2 text-sm text-neutral-500">
            ...
          </span>
        ) : (
          <button
            key={p}
            className={`flex h-8 w-8 items-center justify-center rounded-sm text-sm font-medium ${
              p === page
                ? "bg-primary-100 text-primary-500"
                : "text-neutral-700 hover:bg-neutral-100"
            }`}
          >
            {p}
          </button>
        )
      )}
      <button
        disabled={page === total}
        className="flex h-8 w-8 items-center justify-center rounded-sm text-neutral-500 hover:bg-neutral-100 disabled:opacity-40"
        aria-label="Next page"
      >
        <ChevronRightIcon width={16} height={16} />
      </button>
    </nav>
  );
}
