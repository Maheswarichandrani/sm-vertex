import type { InputHTMLAttributes } from "react";
import { SearchIcon } from "./icons";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  shortcut?: string;
}

export function SearchInput({ shortcut, className = "", ...rest }: InputProps) {
  return (
    <div
      className={`flex h-11 items-center gap-2 rounded-md border border-neutral-200 bg-white px-4 text-sm text-neutral-900 focus-within:border-primary-400 ${className}`}
    >
      <SearchIcon width={18} height={18} className="text-neutral-500" />
      <input
        className="flex-1 bg-transparent outline-none placeholder:text-neutral-500"
        {...rest}
      />
      {shortcut && (
        <kbd className="rounded border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 text-xs text-neutral-500">
          {shortcut}
        </kbd>
      )}
    </div>
  );
}

export function TextInput({ className = "", ...rest }: InputProps) {
  return (
    <input
      className={`h-11 w-full rounded-md border border-neutral-200 bg-white px-4 text-sm text-neutral-900 outline-none placeholder:text-neutral-500 focus:border-primary-400 ${className}`}
      {...rest}
    />
  );
}
