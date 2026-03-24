import { AppShell } from "@/components/app-shell";

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-[#E3E8EF] ${className}`} />;
}

export default function HorizonLoading() {
  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div>
          <Skeleton className="h-6 w-64" />
          <Skeleton className="mt-1.5 h-4 w-96" />
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Feed cards */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-[#E3E8EF] bg-white p-5 relative overflow-hidden"
              >
                {/* Left color bar */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#E3E8EF]" />
                <div className="flex items-start justify-between mb-3">
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-24 rounded-full" />
                  </div>
                  <Skeleton className="h-3 w-14" />
                </div>
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-2/3" />
                <div className="mt-4 pt-4 border-t border-[#F6F9FC] flex items-center gap-4">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-28" />
                </div>
              </div>
            ))}
          </div>

          {/* Right sidebar */}
          <div className="flex flex-col gap-6">
            {/* Dark insights card */}
            <div className="rounded-xl bg-gradient-to-br from-[#0A2540] to-[#1E3A5F] p-6">
              <Skeleton className="h-10 w-10 rounded-xl mb-4 bg-white/10" />
              <Skeleton className="h-5 w-36 mb-2 bg-white/10" />
              <Skeleton className="h-4 w-full mb-1 bg-white/10" />
              <Skeleton className="h-4 w-3/4 mb-1 bg-white/10" />
              <Skeleton className="h-4 w-1/2 bg-white/10" />
              <div className="mt-4 pt-4 border-t border-white/10">
                <Skeleton className="h-3 w-56 bg-white/10" />
              </div>
            </div>

            {/* Critical warnings card */}
            <div className="rounded-xl border border-[#E3E8EF] bg-white shadow-sm">
              <div className="p-4 border-b border-[#F6F9FC]">
                <Skeleton className="h-3 w-32" />
              </div>
              <div className="p-4 space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-3 w-32" />
                    </div>
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
