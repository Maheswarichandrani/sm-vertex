import type { ReactNode } from "react";

/**
 * The reference frames the page in a column with a hairline down each side and
 * a diagonal hatch outside it. The hatch lives on the outer element and the
 * column paints over it, so below the max width the column fills the viewport
 * and no hatch shows. Column width is 1440px per the brief; the reference's
 * proportions were measured against its narrower 966px export.
 */
export function PageFrame({ children }: { children: ReactNode }) {
  return (
    <div className="canvas-hatch min-h-full bg-canvas">
      <div className="mx-auto min-h-full w-full max-w-[1440px] bg-canvas 2xl:border-x 2xl:border-canvas-line">
        {children}
      </div>
    </div>
  );
}
