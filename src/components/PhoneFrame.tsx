import type { ReactNode } from "react";

export function PhoneFrame({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`relative mx-auto max-w-full ${className}`}>
      <div className="relative aspect-[9/19.5] rounded-[3rem] bg-ink p-[10px] shadow-[0_40px_90px_-30px_rgba(14,124,102,0.35),0_20px_50px_-20px_rgba(0,0,0,0.25)] ring-1 ring-black/5">
        <div className="absolute left-1/2 top-3 z-30 h-6 w-28 -translate-x-1/2 rounded-full bg-ink" />
        <div className="relative h-full w-full overflow-hidden rounded-[2.4rem] bg-sand">
          {children}
        </div>
      </div>
    </div>
  );
}
