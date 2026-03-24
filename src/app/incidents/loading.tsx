import { AppShell } from "@/components/app-shell";

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-[#E3E8EF] ${className}`} />;
}

export default function IncidentsLoading() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-6 overflow-y-auto h-full">
        {/* Header */}
        <div className="flex items-center justify-between mt-2">
          <div>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="mt-1.5 h-4 w-72" />
          </div>
          <Skeleton className="h-9 w-36 rounded-md" />
        </div>

        {/* KPI stat cards — 4 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-[#E3E8EF] bg-white p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-7 w-7 rounded-md" />
              </div>
              <Skeleton className="h-8 w-12" />
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="rounded-xl border border-[#E3E8EF] bg-white overflow-hidden">
          <div className="px-4 pt-4 pb-2">
            <Skeleton className="h-3 w-28" />
          </div>

          {/* Table header */}
          <div className="flex items-center gap-4 px-4 py-2.5 bg-[#F6F9FC] border-y border-[#E3E8EF]">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-16 ml-auto" />
          </div>

          {/* Table rows */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-4 px-4 py-3 border-b border-[#E3E8EF]"
            >
              <div className="flex items-center gap-2">
                <Skeleton className="h-3.5 w-3.5 rounded" />
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-14 ml-auto" />
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
