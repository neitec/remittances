import { cn } from "@/lib/utils";

/* ── Base shimmer block ─────────────────────────────────── */
function Sk({ className }: { className?: string }) {
  return <div className={cn("sk", className)} />;
}

/* ══════════════════════════════════════════════════════════
   DASHBOARD SKELETON
   Matches: HeroBalanceCard + Operaciones + MisCuentas + Actividad
══════════════════════════════════════════════════════════ */
export function DashboardSkeleton() {
  return (
    <div className="pt-[84px] pb-6 px-5 lg:pl-12 lg:pr-10">
      <div className="max-w-[1088px]">

        {/* Hero balance card */}
        <div className="mb-7 rounded-[28px] overflow-hidden" style={{ height: 210, background: "rgba(0,0,0,0.04)" }}>
          <div className="h-full p-7 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Sk className="h-3 w-28 rounded-full" />
                <Sk className="h-10 w-48 rounded-xl" />
              </div>
              <Sk className="h-10 w-10 rounded-full" />
            </div>
            <div className="flex gap-3">
              <Sk className="h-10 flex-1 rounded-full" />
              <Sk className="h-10 flex-1 rounded-full" />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-5 xl:grid xl:grid-cols-2 xl:gap-6">

          {/* LEFT column */}
          <div className="flex flex-col gap-7">

            {/* Operaciones */}
            <div>
              <Sk className="h-2.5 w-24 rounded-full mb-3" />
              <div className="flex flex-col gap-[14px]">
                {/* Deposita */}
                <div className="rounded-[22px] px-5 py-[13px] flex items-center gap-4" style={{ background: "rgba(5,150,105,0.05)", border: "1px solid rgba(5,150,105,0.10)" }}>
                  <Sk className="w-12 h-12 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Sk className="h-4 w-20 rounded-full" />
                    <Sk className="h-3 w-28 rounded-full" />
                  </div>
                </div>
                {/* Transfiere */}
                <div className="rounded-[22px] px-5 py-[13px] flex items-center gap-4" style={{ background: "rgba(188,72,0,0.05)", border: "1px solid rgba(188,72,0,0.10)" }}>
                  <Sk className="w-12 h-12 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Sk className="h-4 w-24 rounded-full" />
                    <Sk className="h-3 w-40 rounded-full" />
                  </div>
                </div>
                {/* Retirar */}
                <div className="rounded-[22px] px-5 py-4 flex items-center gap-4" style={{ background: "rgba(0,0,0,0.02)", border: "1.5px dashed rgba(0,0,0,0.08)" }}>
                  <Sk className="w-12 h-12 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Sk className="h-4 w-16 rounded-full" />
                    <Sk className="h-3 w-32 rounded-full" />
                  </div>
                  <Sk className="h-6 w-16 rounded-full flex-shrink-0" />
                </div>
              </div>
            </div>

            {/* Mis Cuentas */}
            <div className="rounded-[1.6rem] px-4 py-4 flex items-center gap-4" style={{ background: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.05)" }}>
              <Sk className="w-11 h-11 rounded-[14px] flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Sk className="h-4 w-28 rounded-full" />
                <Sk className="h-3 w-20 rounded-full" />
              </div>
              <Sk className="w-7 h-7 rounded-full flex-shrink-0" />
            </div>
          </div>

          {/* RIGHT column — Actividad reciente */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Sk className="h-2.5 w-28 rounded-full" />
              <Sk className="h-2.5 w-14 rounded-full" />
            </div>
            <div className="rounded-[22px] overflow-hidden" style={{ background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.05)" }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-4" style={i < 4 ? { borderBottom: "1px solid rgba(0,0,0,0.04)" } : {}}>
                  <Sk className="w-10 h-10 rounded-[13px] flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Sk className="h-3.5 w-24 rounded-full" />
                    <Sk className="h-2.5 w-16 rounded-full" />
                  </div>
                  <div className="space-y-2 items-end flex flex-col">
                    <Sk className="h-3.5 w-16 rounded-full" />
                    <Sk className="h-2.5 w-8 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   TRANSACTIONS SKELETON
   Matches: filter tabs + transaction rows
══════════════════════════════════════════════════════════ */
export function TransactionsSkeleton() {
  return (
    <div className="pt-[84px] px-5 py-6 lg:pl-12 lg:pr-10">
      <div className="max-w-[900px]">
        {/* Filter tabs */}
        <div className="flex items-center gap-1 mb-7 p-1 rounded-[14px] w-fit" style={{ background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.05)" }}>
          {[56, 72, 60, 76].map((w, i) => (
            <div key={i} className={`sk h-9 rounded-[10px]`} style={{ width: w }} />
          ))}
        </div>
        {/* Rows */}
        <div className="rounded-[22px] overflow-hidden" style={{ background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.05)" }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 pl-4 pr-8 py-4" style={i < 7 ? { borderBottom: "1px solid rgba(0,0,0,0.04)" } : {}}>
              <Sk className="w-10 h-10 rounded-[13px] flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Sk className="h-3.5 w-28 rounded-full" />
                <Sk className="h-2.5 w-20 rounded-full" />
              </div>
              <div className="space-y-2 flex flex-col items-end">
                <Sk className="h-3.5 w-20 rounded-full" />
                <Sk className="h-2.5 w-10 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   ACCOUNTS SKELETON
   Matches: header + account rows + add button
══════════════════════════════════════════════════════════ */
export function AccountsSkeleton() {
  return (
    <div className="pt-24 px-6 pb-32 max-w-2xl mx-auto space-y-6">
      <div className="space-y-2">
        <Sk className="h-2.5 w-36 rounded-full" />
        <Sk className="h-9 w-64 rounded-xl" />
        <Sk className="h-3.5 w-80 rounded-full" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl p-4 flex items-center gap-3" style={{ background: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.05)" }}>
            <Sk className="w-10 h-10 rounded-[12px] flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Sk className="h-4 w-32 rounded-full" />
              <Sk className="h-3 w-44 rounded-full" />
            </div>
            <Sk className="w-8 h-8 rounded-full flex-shrink-0" />
          </div>
        ))}
      </div>
      <Sk className="h-12 w-full rounded-2xl" />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   PROFILE SKELETON
   Matches: avatar + plan badge + info rows
══════════════════════════════════════════════════════════ */
export function ProfileSkeleton() {
  return (
    <div className="pt-[92px] px-5 pb-32 lg:pl-12 lg:pr-10 max-w-[640px]">
      {/* Avatar + name */}
      <div className="flex flex-col items-center gap-3 py-8">
        <Sk className="w-20 h-20 rounded-full" />
        <div className="space-y-2 flex flex-col items-center">
          <Sk className="h-6 w-36 rounded-xl" />
          <Sk className="h-4 w-24 rounded-full" />
        </div>
        <Sk className="h-8 w-28 rounded-full" />
      </div>
      {/* Info cards */}
      {Array.from({ length: 2 }).map((_, section) => (
        <div key={section} className="mb-5">
          <Sk className="h-2.5 w-24 rounded-full mb-3" />
          <div className="rounded-[20px] overflow-hidden" style={{ background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.05)" }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4" style={i < 2 ? { borderBottom: "1px solid rgba(0,0,0,0.04)" } : {}}>
                <Sk className="w-9 h-9 rounded-[10px] flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Sk className="h-2.5 w-16 rounded-full" />
                  <Sk className="h-3.5 w-40 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   SEND PAGE SKELETON
   Matches: breadcrumb + destinatario + monto + concepto + slide
══════════════════════════════════════════════════════════ */
export function SendSkeleton() {
  return (
    <div className="pt-[92px] px-5 pb-32 lg:pb-10 lg:pl-12 lg:pr-10">
      <div className="max-w-[1088px]">
        {/* Breadcrumb */}
        <div className="pt-1 mb-5">
          <Sk className="h-2.5 w-20 rounded-full" />
        </div>
        {/* Step 1 cards */}
        <div className="space-y-3">
          {/* Main card */}
          <div className="rounded-[22px] p-5" style={{ background: "rgba(0,62,199,0.04)", border: "1px solid rgba(0,62,199,0.08)" }}>
            <div className="flex items-start justify-between mb-4">
              <Sk className="w-12 h-12 rounded-[14px]" />
              <Sk className="h-7 w-24 rounded-full" />
            </div>
            <div className="space-y-2 mb-4">
              <Sk className="h-5 w-48 rounded-xl" />
              <Sk className="h-3.5 w-64 rounded-full" />
            </div>
            <div className="pt-3 flex items-center justify-between" style={{ borderTop: "1px solid rgba(0,62,199,0.07)" }}>
              <Sk className="h-4 w-24 rounded-full" />
              <Sk className="h-4 w-16 rounded-full" />
            </div>
          </div>
          {/* Coming soon card */}
          <div className="rounded-[22px] p-5 flex items-start gap-4" style={{ background: "rgba(248,249,250,0.5)", border: "2px dashed rgba(0,0,0,0.10)" }}>
            <Sk className="w-12 h-12 rounded-[14px] flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Sk className="h-5 w-40 rounded-xl" />
              <Sk className="h-3.5 w-56 rounded-full" />
            </div>
            <Sk className="h-7 w-24 rounded-full flex-shrink-0" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   DEPOSIT PAGE SKELETON
   Matches: breadcrumb + deposit method cards
══════════════════════════════════════════════════════════ */
export function DepositSkeleton() {
  return (
    <div className="pt-[92px] px-5 pb-28 lg:pb-10 lg:pl-12 lg:pr-10">
      <div className="max-w-[1088px] space-y-3">
        {/* Breadcrumb */}
        <div className="pt-2 mb-3">
          <Sk className="h-2.5 w-20 rounded-full" />
        </div>
        {/* Title */}
        <div className="space-y-2 pb-4">
          <Sk className="h-7 w-60 rounded-xl" />
          <Sk className="h-3.5 w-72 rounded-full" />
        </div>
        {/* EUR card */}
        <div className="rounded-[22px] p-5" style={{ background: "rgba(0,62,199,0.04)", border: "1px solid rgba(0,62,199,0.08)" }}>
          <div className="flex items-start justify-between mb-4">
            <Sk className="w-12 h-12 rounded-[14px]" />
            <Sk className="h-7 w-24 rounded-full" />
          </div>
          <div className="space-y-2 mb-4">
            <Sk className="h-5 w-44 rounded-xl" />
            <Sk className="h-3.5 w-80 rounded-full" />
          </div>
          <div className="pt-3 flex items-center justify-between" style={{ borderTop: "1px solid rgba(0,62,199,0.07)" }}>
            <Sk className="h-4 w-36 rounded-full" />
            <Sk className="h-4 w-32 rounded-full" />
          </div>
        </div>
        {/* Coming soon card */}
        <div className="rounded-[22px] p-5 flex items-start gap-4" style={{ background: "rgba(248,249,250,0.5)", border: "2px dashed rgba(0,0,0,0.10)" }}>
          <Sk className="w-12 h-12 rounded-[14px] flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Sk className="h-5 w-44 rounded-xl" />
            <Sk className="h-3.5 w-64 rounded-full" />
          </div>
          <Sk className="h-7 w-28 rounded-full flex-shrink-0" />
        </div>
        {/* 2-col grid */}
        <div className="grid grid-cols-2 gap-3 mt-2">
          {[0, 1].map((i) => (
            <div key={i} className="rounded-[22px] p-4" style={{ background: "rgba(0,0,0,0.03)" }}>
              <Sk className="w-10 h-10 rounded-full mb-3" />
              <Sk className="h-4 w-20 rounded-full mb-2" />
              <Sk className="h-3 w-28 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Legacy exports kept for back-compat ── */
export function ShimmerSkeleton({ className = "" }: { className?: string }) {
  return <Sk className={className} />;
}
export function SkeletonCard() {
  return <DashboardSkeleton />;
}
export function SkeletonTransactionRow() {
  return (
    <div className="flex items-center gap-3 pl-4 pr-8 py-4" style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
      <Sk className="w-10 h-10 rounded-[13px] flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Sk className="h-3.5 w-28 rounded-full" />
        <Sk className="h-2.5 w-20 rounded-full" />
      </div>
      <Sk className="h-3.5 w-20 rounded-full" />
    </div>
  );
}
