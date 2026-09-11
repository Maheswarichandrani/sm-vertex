import type { SelectHTMLAttributes } from "react";
import { ChevronDownIcon } from "./icons";

export function Select({
  className = "",
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div className="relative">
      <select
        className={`h-11 w-full appearance-none rounded-md border border-neutral-200 bg-white px-4 pr-10 text-sm text-neutral-900 outline-none focus:border-primary-400 ${className}`}
        {...rest}
      >
        {children}
      </select>
      <ChevronDownIcon
        width={16}
        height={16}
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500"
      />
    </div>
  );
}
