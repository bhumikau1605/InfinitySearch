const DEFAULT_OLLAMA_ENDPOINT =
  import.meta.env.VITE_LOCAL_LLM_ENDPOINT || 'http://localhost:11434/api/generate';
const DEFAULT_MODEL = import.meta.env.VITE_LOCAL_LLM_MODEL || 'llama3.2:3b';

function buildPrompt(query, results) {
  const context = results
    .slice(0, 5)
    .map((item, index) => `${index + 1}. Q: ${item.question}\nA: ${item.answer}`)
    .join('\n\n');

  return `You are an offline assistant inside InfinitySearch. Use only the provided context and do not invent facts.\n\nUser query: ${query}\n\nContext:\n${context}\n\nReturn a concise answer in 3-5 sentences. If context is insufficient, clearly say so.`;
}

export async function summarizeWithLocalModel(query, results) {
  if (!query || !results?.length) {
    return 'No results are available to summarize yet.';
  }

  const prompt = buildPrompt(query, results);

  const response = await fetch(DEFAULT_OLLAMA_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      prompt,
      stream: false,
      options: {
        temperature: 0.2
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Local LLM request failed with status ${response.status}`);
  }

  const data = await response.json();
  return data.response?.trim() || 'The local model returned an empty response.';
}
