import { AppShell } from "@/components/app-shell";

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-[#E3E8EF] ${className}`} />;
}

export default function ComplianceLoading() {
  return (
    <AppShell>
      <div className="flex flex-col h-full bg-[#FAFBFC] overflow-y-auto">
        {/* Header */}
        <div className="px-8 py-8 border-b border-[#E3E8EF] bg-white">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-7 w-64" />
              </div>
              <Skeleton className="mt-1 h-4 w-80" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-36 rounded-md" />
              <Skeleton className="h-10 w-36 rounded-md" />
            </div>
          </div>

          {/* 4 metric cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="p-4 rounded-xl border border-[#E3E8EF] bg-white shadow-sm"
              >
                <Skeleton className="h-3 w-20 mb-2" />
                <div className="flex items-end justify-between">
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-5 w-24 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Content: 3-col grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-8">
          {/* Main table area */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl border border-[#E3E8EF] shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-[#E3E8EF] bg-gray-50/50">
                <Skeleton className="h-5 w-40" />
              </div>
              <div className="p-4 space-y-3">
                {/* Table header */}
                <div className="flex items-center gap-6 px-2">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-12 ml-auto" />
                </div>
                {/* Table rows */}
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-6 px-2 py-3 border-t border-gray-100">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                    <Skeleton className="h-4 w-14 ml-auto" />
                  </div>
                ))}
              </div>
            </div>

            {/* DORA articles dark card */}
            <div className="bg-[#111827] rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Skeleton className="h-8 w-8 rounded-lg bg-[#635BFF]/30" />
                <Skeleton className="h-5 w-44 bg-white/10" />
              </div>
              <Skeleton className="h-4 w-64 mb-6 bg-white/10" />
              <div className="grid grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/10">
                    <Skeleton className="h-3 w-24 mb-2 bg-white/10" />
                    <Skeleton className="h-4 w-20 bg-white/10" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-[#E3E8EF] p-6 shadow-sm">
              <Skeleton className="h-5 w-36 mb-4" />
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-[#F9FBFC] border border-[#E3E8EF]">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-5 w-24 rounded-md" />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#E3E8EF] p-6 shadow-sm">
              <Skeleton className="h-5 w-32 mb-4" />
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i}>
                    <div className="flex justify-between mb-1">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-3 w-8" />
                    </div>
                    <Skeleton className="h-1.5 w-full rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
