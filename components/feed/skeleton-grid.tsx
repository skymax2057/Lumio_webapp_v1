"use client";

export function SkeletonGrid() {
  const heights = [280, 380, 220, 340, 420, 300, 260, 360];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {heights.map((h, index) => (
        <div
          key={index}
          className="rounded-2xl bg-lumio-card/60 border border-lumio-border/40 animate-pulse p-4 flex flex-col justify-between"
          style={{ height: `${h}px` }}
        >
          <div className="flex justify-between items-center">
            <div className="w-16 h-4 rounded-full bg-white/5" />
            <div className="w-8 h-8 rounded-full bg-white/5" />
          </div>
          <div className="space-y-2">
            <div className="w-3/4 h-4 rounded bg-white/10" />
            <div className="flex justify-between items-center pt-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-white/10" />
                <div className="w-20 h-3 rounded bg-white/5" />
              </div>
              <div className="w-12 h-5 rounded-full bg-white/5" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
