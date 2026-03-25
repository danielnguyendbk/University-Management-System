export function StatCard({ label, value, note, accentClass = "text-gray-900", icon }) {
  return (
    <article className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between gap-4 mb-2">
        <p className="text-sm text-gray-500">{label}</p>
        {icon ? <span className="text-gray-400">{icon}</span> : null}
      </div>
      <p className={`text-3xl font-semibold ${accentClass}`}>{value}</p>
      {note ? <p className="text-sm text-gray-600 mt-1">{note}</p> : null}
    </article>
  );
}
