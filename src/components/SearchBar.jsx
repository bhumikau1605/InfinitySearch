export default function SearchBar({ value, onChange, onSearch, loading }) {
  const handleSubmit = (event) => {
    event.preventDefault();
    onSearch();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
      <input
        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-slate-100 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none"
        placeholder="Search local knowledge or connected peers..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-cyan-500 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? 'Searching...' : 'Search'}
      </button>
    </form>
  );
}
