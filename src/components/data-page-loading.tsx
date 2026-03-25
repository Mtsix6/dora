"use client";

import { AppShell } from "@/components/app-shell";
import { cn } from "@/lib/utils";

function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton rounded-md", className)} />;
}

export function DataPageLoading({
  titleWidth = "w-52",
  subtitleWidth = "w-80",
  cardCount = 4,
  listRows = 6,
}: {
  titleWidth?: string;
  subtitleWidth?: string;
  cardCount?: number;
  listRows?: number;
}) {
  return (
    <AppShell>
      <div className="h-full overflow-y-auto bg-[#F6F9FC]">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 py-6">
          <div className="rounded-2xl border border-[#E3E8EF] bg-white px-5 py-5 shadow-sm">
            <Skeleton className={cn("h-7", titleWidth)} />
            <Skeleton className={cn("mt-2 h-4", subtitleWidth)} />
          </div>

          <div className={cn("grid gap-4", cardCount > 3 ? "lg:grid-cols-4" : "md:grid-cols-3")}>
            {Array.from({ length: cardCount }).map((_, index) => (
              <div key={index} className="rounded-2xl border border-[#E3E8EF] bg-white p-4">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="mt-4 h-8 w-20" />
                <Skeleton className="mt-3 h-3 w-28" />
              </div>
            ))}
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-2xl border border-[#E3E8EF] bg-white p-5">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="mt-5 h-64 w-full rounded-2xl" />
            </div>
            <div className="rounded-2xl border border-[#E3E8EF] bg-white p-5">
              <Skeleton className="h-5 w-36" />
              <div className="mt-4 space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="rounded-xl border border-[#EEF2F7] p-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="mt-3 h-3 w-full" />
                    <Skeleton className="mt-2 h-3 w-3/4" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#E3E8EF] bg-white p-5">
            <Skeleton className="h-5 w-44" />
            <div className="mt-5 space-y-3">
              {Array.from({ length: listRows }).map((_, index) => (
                <div key={index} className="flex items-center gap-4 rounded-xl border border-[#EEF2F7] px-4 py-3">
                  <Skeleton className="h-9 w-9 rounded-xl" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="mt-2 h-3 w-28" />
                  </div>
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
