export function PageHeader({ title, subtitle, actions }) {
  return (
    <header className="page-header flex items-start justify-between gap-4">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">{title}</h1>
        {subtitle ? <p className="text-gray-600 mt-1">{subtitle}</p> : null}
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </header>
  );
}
