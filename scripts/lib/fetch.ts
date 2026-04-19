const defaultHeaders = {
  "user-agent": "AI Signal Archive Bot/0.1 (+https://ai-signal-archive.workers.dev)",
  accept: "text/html,application/xhtml+xml,application/xml;q=0.9,text/xml;q=0.9,*/*;q=0.8"
};

export async function fetchText(url: string) {
  const response = await fetch(url, { headers: defaultHeaders, redirect: "follow" });
  if (!response.ok) {
    throw new Error(`Fetch failed for ${url}: ${response.status} ${response.statusText}`);
  }
  return response.text();
}
