export default function PeerConnection({
  peerId,
  targetPeerId,
  setTargetPeerId,
  onConnect,
  status,
  connectedPeerIds
}) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <h2 className="text-lg font-semibold text-slate-100">Peer Connection</h2>

      <div className="mt-4 space-y-3 text-sm text-slate-300">
        <p>
          <span className="font-semibold text-slate-100">Your Peer ID:</span>{' '}
          <span className="rounded bg-slate-800 px-2 py-1 text-cyan-300">{peerId || 'Initializing...'}</span>
        </p>

        <p>
          <span className="font-semibold text-slate-100">Status:</span>{' '}
          <span className={status.startsWith('Connected') ? 'text-emerald-400' : 'text-amber-300'}>{status}</span>
        </p>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <input
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none"
          value={targetPeerId}
          onChange={(e) => setTargetPeerId(e.target.value)}
          placeholder="Enter peer ID"
        />
        <button
          className="rounded-xl bg-emerald-500 px-4 py-2 font-semibold text-slate-950 transition hover:bg-emerald-400"
          onClick={onConnect}
        >
          Connect
        </button>
      </div>

      <div className="mt-5">
        <h3 className="text-sm font-semibold text-slate-100">Connected Peers</h3>
        <ul className="mt-2 space-y-2 text-sm text-slate-300">
          {connectedPeerIds.length > 0 ? (
            connectedPeerIds.map((id) => (
              <li key={id} className="rounded bg-slate-800 px-3 py-2">
                {id}
              </li>
            ))
          ) : (
            <li className="rounded bg-slate-800/60 px-3 py-2 text-slate-500">No active peer connections</li>
          )}
        </ul>
      </div>
    </section>
  );
}
