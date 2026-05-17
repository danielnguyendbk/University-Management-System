export function PageHeader({ title, subtitle, actions }) {
  return (
    <header className="flex items-start justify-between gap-4 rounded-lg border border-[#1E3A8A]/15 bg-white/90 px-6 py-5 shadow-[0_18px_60px_rgba(30,58,138,0.08)] backdrop-blur">
      <div className="space-y-1">
        <p className="inline-flex rounded-full bg-[#1E3A8A]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[#1E3A8A]">
          Quản trị
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">{title}</h1>
        {subtitle ? <p className="max-w-2xl text-slate-600">{subtitle}</p> : null}
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </header>
  );
}
