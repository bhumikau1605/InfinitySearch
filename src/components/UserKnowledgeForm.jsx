import { useState } from 'react';

export default function UserKnowledgeForm({ onAdd, count }) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  const submit = (event) => {
    event.preventDefault();
    const didSave = onAdd(question, answer);
    if (didSave) {
      setQuestion('');
      setAnswer('');
    }
  };

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-emerald-300">Add Personal Knowledge</h2>
        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300">{count} entries</span>
      </div>

      <form className="space-y-3" onSubmit={submit}>
        <input
          className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
          placeholder="Question (e.g., What is AI?)"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <textarea
          className="min-h-20 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
          placeholder="Answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />
        <button
          className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400"
          type="submit"
        >
          Save to Local Knowledge
        </button>
      </form>
    </section>
  );
}
