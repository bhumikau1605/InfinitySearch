export default function ResultCard({ result }) {
  return (
    <article className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-cyan-300">{result.question}</h3>
        <span className="rounded-full border border-cyan-400/40 px-2 py-1 text-xs text-cyan-200">
          {result.label}
        </span>
      </div>
      <p className="text-sm leading-relaxed text-slate-300">{result.answer}</p>
    </article>
  );
}
