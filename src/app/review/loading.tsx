import { AppShell } from "@/components/app-shell";

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-[#E3E8EF] ${className}`} />;
}

export default function ReviewLoading() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-6 overflow-y-auto h-full">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <Skeleton className="h-6 w-28" />
            <Skeleton className="mt-1.5 h-4 w-80" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>

        {/* Contract cards */}
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-[#E3E8EF] bg-white p-4"
            >
              <div className="flex items-center gap-4">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <div className="flex-1 min-w-0">
                  <Skeleton className="h-4 w-48 mb-1.5" />
                  <Skeleton className="h-3 w-64" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-10" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-6 w-6 rounded" />
                  <Skeleton className="hidden sm:block h-3 w-14" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
