export const siteConfig = {
  name: "AI Signal Archive",
  description:
    "A premium, search-first archive for AI product changes, pricing moves, releases, policy shifts, and availability updates across the tooling landscape.",
  shortDescription: "Track what changed in AI, when it changed, and where it was announced.",
  defaultUrl: "https://ai-signal-archive.workers.dev",
  nav: [
    { href: "/today/", label: "Today" },
    { href: "/week/", label: "This Week" },
    { href: "/archive/", label: "Archive" },
    { href: "/sources/", label: "Sources" },
    { href: "/methodology/", label: "Methodology" }
  ],
  footerLinks: [
    { href: "/about/", label: "About" },
    { href: "/corrections/", label: "Corrections" },
    { href: "/privacy/", label: "Privacy" }
  ]
} as const;

export function withBase(pathname = "/") {
  if (/^[a-z]+:\/\//i.test(pathname) || pathname.startsWith("mailto:") || pathname.startsWith("#")) {
    return pathname;
  }

  const base = (import.meta.env.BASE_URL ?? "/").replace(/\/+$/, "");
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;

  return `${base}${normalizedPath}` || "/";
}

export function getSiteUrl(pathname = "/") {
  const base = import.meta.env.SITE ?? siteConfig.defaultUrl;
  return new URL(withBase(pathname), base).toString();
}
