import { AppShell } from "@/components/app-shell";

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-[#E3E8EF] ${className}`} />;
}

export default function ReportsLoading() {
  return (
    <AppShell>
      <div className="flex flex-col h-full bg-[#FAFBFC]">
        {/* Top header */}
        <div className="px-8 py-10 border-b border-[#E3E8EF] bg-white">
          <div className="flex items-center justify-between mb-8 max-w-7xl mx-auto">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-7 w-48" />
              </div>
              <Skeleton className="mt-1 h-4 w-72" />
            </div>
            <Skeleton className="h-11 w-40 rounded-xl" />
          </div>

          {/* Template cards */}
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-[#E3E8EF] bg-white p-5"
              >
                <Skeleton className="h-10 w-10 rounded-xl mb-4" />
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3 w-full mb-1" />
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="mt-4 h-8 w-full rounded-lg" />
              </div>
            ))}
          </div>
        </div>

        {/* Report vault table */}
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="bg-white rounded-2xl border border-[#E3E8EF] shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-[#E3E8EF] flex items-center justify-between bg-gray-50/30">
                <Skeleton className="h-6 w-32" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-40 rounded-md" />
                  <Skeleton className="h-8 w-24 rounded-md" />
                </div>
              </div>

              {/* Table header */}
              <div className="flex items-center gap-6 px-6 py-4 bg-[#F9FBFC] border-b border-[#E3E8EF]">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-3 w-14" />
                <Skeleton className="h-3 w-16 ml-auto" />
              </div>

              {/* Table rows */}
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-6 px-6 py-5 border-b border-gray-50">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-lg" />
                    <div>
                      <Skeleton className="h-4 w-40 mb-1" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-5 w-12 rounded" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-5 w-14 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded ml-auto" />
                </div>
              ))}

              <div className="px-6 py-4 border-t border-[#E3E8EF] flex items-center justify-between">
                <Skeleton className="h-3 w-40" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
