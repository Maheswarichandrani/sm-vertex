const leftCluster = [88, 121, 152, 184, 133, 97];
const rightCluster = [59, 85, 114, 152, 182, 90, 133, 170];

function Cluster({ heights, className }: { heights: number[]; className?: string }) {
  return (
    <div className={`flex items-end gap-0.5 ${className ?? ""}`}>
      {heights.map((h, i) => (
        <div
          key={i}
          style={{ height: h }}
          className="w-[62px] flex-1 bg-gradient-to-b from-transparent to-primary-400/70"
        />
      ))}
    </div>
  );
}

/**
 * Two clusters of blurred bars fading up out of the page edge, cropped by the
 * viewport bottom. Decoration only — it carries no data.
 */
export function BarDecoration() {
  return (
    <div aria-hidden className="mt-14 h-[150px] overflow-hidden blur-[6px]">
      <div className="flex h-[206px] items-end justify-between">
        <Cluster heights={leftCluster} className="w-[38%]" />
        <Cluster heights={rightCluster} className="w-[51%]" />
      </div>
    </div>
  );
}
