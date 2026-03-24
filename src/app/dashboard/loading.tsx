import { AppShell } from "@/components/app-shell";

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-[#E3E8EF] ${className}`} />;
}

export default function DashboardLoading() {
  return (
    <AppShell>
      <div className="h-full overflow-y-auto bg-[#F5F7FB]">
        <div className="mx-auto flex max-w-[1480px] flex-col gap-5 px-5 py-5 lg:px-6">
          {/* Header card */}
          <section className="rounded-[26px] border border-[#D9E1EC] bg-white px-4 py-4 shadow-[0_18px_50px_rgba(15,23,42,0.05)]">
            <div className="flex items-center gap-2">
              <Skeleton className="h-7 w-28 rounded-full" />
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="mt-4 h-9 w-96" />
            <Skeleton className="mt-2 h-4 w-64" />
          </section>

          {/* KPI metric cards — 5 cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-[#E3E8EF] bg-white p-4"
              >
                <Skeleton className="h-3 w-24 mb-3" />
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
                <Skeleton className="mt-3 h-8 w-full rounded-lg" />
              </div>
            ))}
          </div>

          {/* Chart + sidebar area */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {/* Main chart area */}
            <div className="lg:col-span-2 space-y-5">
              <div className="rounded-2xl border border-[#E3E8EF] bg-white p-6">
                <Skeleton className="h-5 w-40 mb-4" />
                <Skeleton className="h-48 w-full rounded-xl" />
              </div>

              {/* Table skeleton */}
              <div className="rounded-2xl border border-[#E3E8EF] bg-white overflow-hidden">
                <div className="px-5 py-4 border-b border-[#E3E8EF]">
                  <Skeleton className="h-5 w-36" />
                </div>
                <div className="p-4 space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-8 w-8 rounded-lg" />
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-4 w-24 ml-auto" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              <div className="rounded-2xl border border-[#E3E8EF] bg-white p-5">
                <Skeleton className="h-5 w-32 mb-4" />
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-3 w-full mb-1.5" />
                        <Skeleton className="h-3 w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-[#E3E8EF] bg-white p-5">
                <Skeleton className="h-5 w-28 mb-4" />
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-1.5 w-24 rounded-full" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
