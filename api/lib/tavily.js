// Tavily search wrapper for opportunity map pre-search.

const TAVILY_API = 'https://api.tavily.com/search';

export async function searchTavily(query, { maxResults = 5, timeout = 5000 } = {}) {
  const key = process.env.TAVILY_API_KEY;
  if (!key) return { query, results: [], error: 'TAVILY_API_KEY not configured' };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(TAVILY_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: key,
        query,
        max_results: maxResults,
        include_raw_content: false,
        search_depth: 'basic',
      }),
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      return { query, results: [], error: `Tavily ${res.status}: ${text.slice(0, 200)}` };
    }

    const data = await res.json();
    return {
      query,
      results: (data.results || []).map((r) => ({
        title: r.title || '',
        url: r.url || '',
        content: (r.content || '').slice(0, 500),
        score: r.score || 0,
      })),
    };
  } catch (err) {
    clearTimeout(timer);
    return { query, results: [], error: err.name === 'AbortError' ? 'timeout' : err.message };
  }
}

export async function batchSearchTavily(queries, opts = {}) {
  // Run up to 5 concurrent searches
  const results = [];
  const batch = [];
  for (const q of queries) {
    batch.push(searchTavily(q.query, opts).then((r) => ({ ...r, label: q.label })));
    if (batch.length >= 5) {
      results.push(...(await Promise.all(batch)));
      batch.length = 0;
    }
  }
  if (batch.length) results.push(...(await Promise.all(batch)));
  return results;
}
