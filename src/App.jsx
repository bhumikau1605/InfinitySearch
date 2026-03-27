import { useEffect, useMemo, useRef, useState } from 'react';
import SearchBar from './components/SearchBar';
import ResultCard from './components/ResultCard';
import PeerConnection from './components/PeerConnection';
import {
  addToCache,
  createPeerCacheResult,
  findAnswerForPeer,
  normalizeQuery,
  searchKnowledge
} from './lib/search';
import { createPeerInstance } from './lib/peer';
import { summarizeWithLocalModel } from './lib/offlineAi';

const SEARCH_WAIT_MS = 1500;

export default function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [status, setStatus] = useState('Starting...');
  const [peerId, setPeerId] = useState('');
  const [targetPeerId, setTargetPeerId] = useState('');
  const [connectedPeerIds, setConnectedPeerIds] = useState([]);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [aiStatus, setAiStatus] = useState('AI mode is off.');

  const peerApiRef = useRef(null);
  const pendingQueryMap = useRef(new Map());
  const peerIdRef = useRef('');

  useEffect(() => {
    peerIdRef.current = peerId;
  }, [peerId]);

  useEffect(() => {
    const handleIncomingData = (message, conn) => {
      if (!message || typeof message !== 'object') return;

      if (message.type === 'search-request') {
        const localAnswers = findAnswerForPeer(message.query);

        if (localAnswers.length > 0) {
          peerApiRef.current?.sendToPeer(conn.peer, {
            type: 'search-response',
            requestId: message.requestId,
            fromPeerId: peerIdRef.current,
            results: localAnswers,
            query: message.query
          });
          return;
        }

        if ((message.ttl ?? 0) > 0) {
          peerApiRef.current?.broadcast(
            {
              ...message,
              ttl: message.ttl - 1,
              route: [...(message.route ?? []), peerIdRef.current]
            },
            conn.peer
          );
        }
        return;
      }

      if (message.type === 'search-response') {
        const pending = pendingQueryMap.current.get(message.requestId);
        if (!pending) return;

        const transformed = (message.results || []).map((item) => {
          const cacheItem = createPeerCacheResult({
            question: item.question,
            answer: item.answer,
            sourcePeerId: message.fromPeerId
          });
          addToCache(cacheItem);
          return {
            ...cacheItem,
            source: 'peer',
            label: `From Peer (${message.fromPeerId || 'unknown'})`
          };
        });

        pendingQueryMap.current.delete(message.requestId);
        pending.resolve(transformed);
      }
    };

    const peerApi = createPeerInstance(
      handleIncomingData,
      (nextStatus) => {
        setStatus(nextStatus);
        setConnectedPeerIds(peerApi.getPeerIds());
      },
      (id) => setPeerId(id)
    );

    peerApiRef.current = peerApi;

    return () => {
      peerApi.cleanup();
    };
  }, []);

  const localHint = useMemo(() => {
    if (!query) return 'Try terms like "offline-first", "TTL", or "WebRTC".';
    if (results.length > 0) return `${results.length} result(s) for "${query}".`;
    return `No result found for "${query}" yet.`;
  }, [query, results]);

  const connectToPeer = () => {
    const cleaned = targetPeerId.trim();
    if (!cleaned) return;
    peerApiRef.current?.connectToPeer(cleaned);
    setTargetPeerId('');
  };

  const onSearch = async () => {
    const normalized = normalizeQuery(query);
    if (!normalized) return;

    setIsSearching(true);
    setAiSummary('');

    const localMatches = searchKnowledge(normalized, true);
    if (localMatches.length > 0) {
      setResults(localMatches);
      if (aiEnabled) {
        setAiStatus('Generating AI summary from local model...');
        try {
          const summary = await summarizeWithLocalModel(normalized, localMatches);
          setAiSummary(summary);
          setAiStatus('AI summary ready.');
        } catch (error) {
          setAiStatus(`AI summary unavailable: ${error.message}`);
        }
      } else {
        setAiStatus('AI mode is off.');
      }
      setIsSearching(false);
      return;
    }

    const requestId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const peerResults = await new Promise((resolve) => {
      pendingQueryMap.current.set(requestId, { resolve });

      peerApiRef.current?.broadcast({
        type: 'search-request',
        requestId,
        query: normalized,
        ttl: 1,
        route: [peerIdRef.current]
      });

      setTimeout(() => {
        if (!pendingQueryMap.current.has(requestId)) return;
        pendingQueryMap.current.delete(requestId);
        resolve([]);
      }, SEARCH_WAIT_MS);
    });

    setResults(peerResults);

    if (aiEnabled && peerResults.length > 0) {
      setAiStatus('Generating AI summary from local model...');
      try {
        const summary = await summarizeWithLocalModel(normalized, peerResults);
        setAiSummary(summary);
        setAiStatus('AI summary ready.');
      } catch (error) {
        setAiStatus(`AI summary unavailable: ${error.message}`);
      }
    } else if (aiEnabled) {
      setAiStatus('No search results to summarize.');
    } else {
      setAiStatus('AI mode is off.');
    }

    setIsSearching(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 py-8 text-slate-100">
      <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-5 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <header>
            <p className="text-sm uppercase tracking-wide text-cyan-400">Offline Decentralized Search</p>
            <h1 className="mt-2 text-3xl font-bold">InfinitySearch</h1>
            <p className="mt-2 text-slate-400">
              Search local knowledge first, then ask connected peers with no centralized backend.
            </p>
          </header>

          <SearchBar value={query} onChange={setQuery} onSearch={onSearch} loading={isSearching} />

          <p className="text-sm text-slate-400">{localHint}</p>


          <section className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-purple-300">Offline AI Assistant</h2>
                <p className="text-xs text-slate-400">Uses a local model endpoint (for example Ollama on localhost). No cloud API required.</p>
              </div>
              <button
                onClick={() => {
                  setAiEnabled((prev) => {
                    const next = !prev;
                    setAiStatus(next ? 'AI mode enabled. Run a search to summarize.' : 'AI mode is off.');
                    return next;
                  });
                  setAiSummary('');
                }}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  aiEnabled ? 'bg-purple-500 text-white hover:bg-purple-400' : 'bg-slate-700 text-slate-100 hover:bg-slate-600'
                }`}
              >
                {aiEnabled ? 'AI On' : 'AI Off'}
              </button>
            </div>

            <p className="mt-3 text-xs text-slate-400">{aiStatus}</p>
            {aiSummary && <p className="mt-2 rounded-lg bg-slate-900 p-3 text-sm text-slate-200">{aiSummary}</p>}
          </section>

          <section className="space-y-3">
            {results.length > 0 ? (
              results.map((result) => <ResultCard key={result.id} result={result} />)
            ) : (
              <article className="rounded-xl border border-dashed border-slate-700 bg-slate-950/50 p-5 text-sm text-slate-500">
                Search results will appear here. If local data has no match, InfinitySearch asks peers.
              </article>
            )}
          </section>
        </section>

        <PeerConnection
          peerId={peerId}
          targetPeerId={targetPeerId}
          setTargetPeerId={setTargetPeerId}
          onConnect={connectToPeer}
          status={status}
          connectedPeerIds={connectedPeerIds}
        />
      </div>
    </main>
  );
}
