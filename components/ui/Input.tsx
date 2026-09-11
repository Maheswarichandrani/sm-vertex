import type { InputHTMLAttributes } from "react";
import { SearchIcon } from "./icons";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  shortcut?: string;
  inputSize?: "md" | "lg";
}

const searchSizeClasses: Record<"md" | "lg", string> = {
  md: "h-11 px-4 text-sm gap-2 border-neutral-200 bg-white",
  lg: "h-[88px] pl-[27px] pr-6 text-xl gap-5 border-canvas-line bg-canvas-card",
};

export function SearchInput({
  shortcut,
  inputSize = "md",
  className = "",
  ...rest
}: InputProps) {
  const isLg = inputSize === "lg";
  return (
    <div
      className={`flex items-center rounded-md border text-neutral-900 focus-within:border-primary-400 ${searchSizeClasses[inputSize]} ${className}`}
    >
      <SearchIcon
        width={isLg ? 24 : 18}
        height={isLg ? 24 : 18}
        className="shrink-0 text-neutral-900"
      />
      <input
        className="w-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-neutral-500"
        {...rest}
      />
      {shortcut && (
        <kbd
          className={
            isLg
              ? "hidden shrink-0 items-center justify-center rounded-sm border border-canvas-line bg-canvas px-3 py-2 text-base text-neutral-500 sm:flex"
              : "rounded border border-neutral-200 bg-neutral-50 px-1.5 py-0.5 text-xs text-neutral-500"
          }
        >
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
