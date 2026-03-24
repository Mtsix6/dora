import { AppShell } from "@/components/app-shell";

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-[#E3E8EF] ${className}`} />;
}

export default function ContractsLoading() {
  return (
    <AppShell>
      <div className="flex h-full flex-col gap-4 overflow-y-auto p-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="mt-1.5 h-4 w-56" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-28 rounded-md" />
            <Skeleton className="h-9 w-32 rounded-md" />
          </div>
        </div>

        {/* Search bar + tab filters */}
        <div className="rounded-xl border border-[#E3E8EF] bg-white p-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Skeleton className="h-8 flex-1 rounded-md" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-20 rounded-md" />
              ))}
            </div>
            <Skeleton className="h-8 w-28 rounded-full" />
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 rounded-xl border border-[#E3E8EF] bg-white overflow-hidden">
          {/* Table header */}
          <div className="flex items-center gap-4 border-b border-[#E3E8EF] px-4 py-2.5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-28" />
            <Skeleton className="hidden h-3 w-20 md:block" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="hidden h-3 w-16 sm:block" />
          </div>
          {/* Table rows */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 border-b border-[#E3E8EF] px-4 py-3"
            >
              <div className="flex items-center gap-2">
                <Skeleton className="h-7 w-7 rounded-md" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-4 w-28" />
              <Skeleton className="hidden h-4 w-20 md:block" />
              <Skeleton className="h-5 w-14 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="hidden h-3 w-14 sm:block ml-auto" />
            </div>
          ))}
        </div>

        <Skeleton className="h-4 w-32" />
      </div>
    </AppShell>
  );
}
