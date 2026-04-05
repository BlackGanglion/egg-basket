const JINA_READER_BASE = 'https://r.jina.ai';

export async function fetchPageContent(url: string): Promise<string> {
  const apiKey = process.env.JINA_API_KEY;
  if (!apiKey) throw new Error('JINA_API_KEY not set');

  const res = await fetch(`${JINA_READER_BASE}/${url}`, {
    headers: { 'Authorization': `Bearer ${apiKey}` },
  });
  if (!res.ok) throw new Error(`Jina Reader HTTP ${res.status} for ${url}`);
  const text = await res.text();
  const marker = 'Markdown Content:';
  const idx = text.indexOf(marker);
  return idx >= 0 ? text.slice(idx + marker.length).trim() : text;
}
