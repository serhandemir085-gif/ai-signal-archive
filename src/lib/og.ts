function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function createOgSvg(options: { eyebrow: string; title: string; summary: string; footer: string }) {
  return `
<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#F5F1E8"/>
  <rect x="28" y="28" width="1144" height="574" rx="28" fill="#FAF7F1" stroke="#16181B" stroke-width="2"/>
  <circle cx="1070" cy="120" r="160" fill="#0B63CE" fill-opacity="0.08"/>
  <circle cx="1030" cy="500" r="120" fill="#117A5D" fill-opacity="0.08"/>
  <rect x="76" y="78" width="160" height="34" rx="17" fill="#16181B"/>
  <text x="96" y="101" fill="#F5F1E8" font-size="18" font-family="'IBM Plex Sans', sans-serif">${escapeXml(
    options.eyebrow
  )}</text>
  <text x="76" y="198" fill="#16181B" font-size="62" font-weight="700" font-family="'Newsreader', serif">${escapeXml(
    options.title
  )}</text>
  <text x="76" y="300" fill="#2B3138" font-size="28" font-family="'IBM Plex Sans', sans-serif">${escapeXml(
    options.summary
  )}</text>
  <rect x="76" y="474" width="1048" height="1" fill="#16181B" fill-opacity="0.14"/>
  <text x="76" y="532" fill="#16181B" font-size="22" font-family="'IBM Plex Mono', monospace">${escapeXml(
    options.footer
  )}</text>
</svg>
  `.trim();
}
