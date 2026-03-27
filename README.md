# InfinitySearch

InfinitySearch is a prototype offline-first decentralized search app.

It searches local knowledge first (JSON + localStorage cache), then queries connected peers through WebRTC (PeerJS).

## Features

- Local keyword search over `knowledge.json`
- Case-insensitive matching
- Peer-to-peer query and response flow
- Optional relay with simple TTL (`ttl: 1`)
- Result labels: **Local Result** and **From Peer**
- Caches peer responses into `localStorage`
- Connection panel with peer ID, connect field, and status
- User-added knowledge entries stored locally (Question + Answer form)
- Optional **Offline AI summary mode** using a local model endpoint (for example Ollama)

## Tech Stack

- React + Vite
- Tailwind CSS
- PeerJS (WebRTC)
- Local JSON and `localStorage`
- Optional local LLM endpoint (localhost)

## Run locally

1. Install dependencies:

```bash
npm install
```

2. Start local PeerJS signaling server (required for peer discovery on your LAN/offline network):

```bash
npm run peer-server
```

3. In a separate terminal, start the app:

```bash
npm run dev
```

4. Open on two devices (same network), copy one device's peer ID, and connect from the other.

> For fully offline use after initial installation, keep dependencies and this app cached locally and run the local signaling server on your network.


## User knowledge input

You can add your own Question + Answer entries from the **Add Personal Knowledge** panel in the app.

- Saved into browser `localStorage`
- Immediately searchable as **User Result**
- Included when responding to peer search requests

## Offline AI mode (optional)

You can enable the **AI On** toggle in the UI to summarize search results using a local LLM endpoint.

Example with Ollama:

```bash
ollama serve
ollama run llama3.2:3b
```

Environment variables (optional):

- `VITE_LOCAL_LLM_ENDPOINT` (default: `http://localhost:11434/api/generate`)
- `VITE_LOCAL_LLM_MODEL` (default: `llama3.2:3b`)

If the local model is unavailable, InfinitySearch continues to work in normal local/peer search mode.

## Project structure

- `src/components/SearchBar.jsx`
- `src/components/ResultCard.jsx`
- `src/components/PeerConnection.jsx`
- `src/lib/search.js`
- `src/lib/peer.js`
- `src/lib/offlineAi.js`
- `src/components/UserKnowledgeForm.jsx`
- `src/data/knowledge.json`
