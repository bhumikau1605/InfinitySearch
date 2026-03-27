import Peer from 'peerjs';

const SIGNALING_HOST = import.meta.env.VITE_PEER_HOST || location.hostname;
const SIGNALING_PORT = Number(import.meta.env.VITE_PEER_PORT || 9000);
const SIGNALING_PATH = import.meta.env.VITE_PEER_PATH || '/infinity';
const SIGNALING_KEY = import.meta.env.VITE_PEER_KEY || 'infinitysearch';

export function createPeerInstance(onData, onStatusChange, onReady) {
  const peer = new Peer({
    host: SIGNALING_HOST,
    port: SIGNALING_PORT,
    path: SIGNALING_PATH,
    key: SIGNALING_KEY,
    secure: false
  });

  const connections = new Map();

  const setConn = (conn) => {
    connections.set(conn.peer, conn);

    conn.on('open', () => onStatusChange?.(`Connected to ${conn.peer}`));
    conn.on('data', (data) => onData?.(data, conn));
    conn.on('close', () => {
      connections.delete(conn.peer);
      onStatusChange?.(`Disconnected from ${conn.peer}`);
    });
    conn.on('error', () => onStatusChange?.(`Connection error with ${conn.peer}`));
  };

  peer.on('open', (id) => {
    onReady?.(id);
    onStatusChange?.('Ready to connect');
  });

  peer.on('connection', (conn) => setConn(conn));
  peer.on('error', (error) => {
    onStatusChange?.(`Peer error: ${error.type}`);
  });

  const connectToPeer = (targetId) => {
    if (!targetId || connections.has(targetId)) return;
    const conn = peer.connect(targetId, { reliable: true });
    setConn(conn);
  };

  const broadcast = (payload, excludePeerId = null) => {
    connections.forEach((conn, peerId) => {
      if (excludePeerId && peerId === excludePeerId) return;
      if (conn.open) {
        conn.send(payload);
      }
    });
  };

  const sendToPeer = (peerId, payload) => {
    const conn = connections.get(peerId);
    if (conn?.open) conn.send(payload);
  };

  const cleanup = () => {
    connections.forEach((conn) => conn.close());
    peer.destroy();
  };

  return {
    connectToPeer,
    broadcast,
    sendToPeer,
    cleanup,
    getPeerIds: () => [...connections.keys()]
  };
}
